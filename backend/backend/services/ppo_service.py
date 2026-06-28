import numpy as np
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
import gymnasium as gym
from gymnasium import spaces
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv
import os
from config import get_settings
settings = get_settings()

class StudyEnvironment(gym.Env):
    """Custom Gym environment for study scheduling"""
    
    def __init__(self, state_data: Dict[str, Any]):
        super(StudyEnvironment, self).__init__()
        
        self.state_data = state_data
        
        # Define action space: [subject_index, duration_hours, break_minutes]
        # Assuming max 10 subjects, 1-4 hour sessions, 5-30 min breaks
        self.action_space = spaces.MultiDiscrete([10, 4, 6])
        
        # Define observation space
        # [mood, energy, stress, sleep_hours, sleep_quality, hour_of_day, pending_tasks]
        self.observation_space = spaces.Box(
            low=np.array([1, 1, 1, 0, 1, 0, 0]),
            high=np.array([6, 5, 5, 12, 5, 23, 100]),
            dtype=np.float32
        )
        
        self.current_state = self._get_state()
    
    def _get_state(self) -> np.ndarray:
        """Get current state observation"""
        mood_data = self.state_data.get("latest_mood", {})
        sleep_data = self.state_data.get("latest_sleep", {})
        
        mood = mood_data.get("mood_score", 3)
        energy = mood_data.get("energy_level", 3)
        stress = mood_data.get("stress_level", 3)
        sleep_hours = sleep_data.get("hours_slept", 7)
        sleep_quality = sleep_data.get("quality_rating", 3)
        hour = datetime.now().hour
        pending = len(self.state_data.get("pending_tasks", []))
        
        return np.array([mood, energy, stress, sleep_hours, sleep_quality, hour, pending], dtype=np.float32)
    
    def reset(self, seed=None, options=None):
        """Reset environment"""
        super().reset(seed=seed)
        self.current_state = self._get_state()
        return self.current_state, {}
    
    def step(self, action):
        """Execute action and return new state, reward"""
        subject_idx, duration_idx, break_idx = action
        
        # Map action to actual values
        duration_hours = duration_idx + 1  # 1-4 hours
        break_minutes = (break_idx + 1) * 5  # 5-30 minutes
        
        # Calculate reward based on wellbeing and productivity
        reward = self._calculate_reward(duration_hours, break_minutes)
        
        # Update state (simplified - in real scenario, this would be based on actual feedback)
        self.current_state = self._get_state()
        
        # Episode ends after one scheduling decision
        done = True
        truncated = False
        
        return self.current_state, reward, done, truncated, {}
    
    def _calculate_reward(self, duration: float, break_time: int) -> float:
        """Calculate reward for scheduling decision"""
        mood = self.current_state[0]
        energy = self.current_state[1]
        stress = self.current_state[2]
        sleep_hours = self.current_state[3]
        
        # Reward components
        
        # 1. Wellbeing score (higher mood, energy, sleep = better)
        wellbeing = (mood + energy + (6 - stress) + (sleep_hours / 2)) / 4
        
        # 2. Duration appropriateness (not too long when tired)
        if energy < 3 and duration > 2:
            duration_penalty = -0.5
        else:
            duration_penalty = 0
        
        # 3. Break appropriateness (longer breaks when stressed)
        if stress > 3 and break_time < 15:
            break_penalty = -0.3
        else:
            break_penalty = 0
        
        # 4. Sleep-based adjustment
        if sleep_hours < 6 and duration > 2:
            sleep_penalty = -0.5
        else:
            sleep_penalty = 0
        
        total_reward = wellbeing + duration_penalty + break_penalty + sleep_penalty
        
        return total_reward
    
    def render(self):
        """Render environment (not needed for training)"""
        pass

class PPOSchedulerService:
    def __init__(self):
        self.model_path = settings.PPO_MODEL_PATH
        self.model = None
        self._load_or_create_model()
    
    def _load_or_create_model(self):
        """Load existing model or create new one"""
        if os.path.exists(f"{self.model_path}.zip"):
            print("Loading existing PPO model...")
            # Create a dummy env for loading
            dummy_state = {
                "user_preferences": {},
                "pending_tasks": [],
                "latest_sleep": {},
                "latest_mood": {}
            }
            env = DummyVecEnv([lambda: StudyEnvironment(dummy_state)])
            self.model = PPO.load(self.model_path, env=env)
        else:
            print("Creating new PPO model...")
            # Create initial model (will be trained with first user data)
            dummy_state = {
                "user_preferences": {},
                "pending_tasks": [],
                "latest_sleep": {},
                "latest_mood": {}
            }
            env = DummyVecEnv([lambda: StudyEnvironment(dummy_state)])
            self.model = PPO("MlpPolicy", env, verbose=1)
    
    async def generate_schedule(self, state_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate optimized schedule using PPO"""
        
        # Create environment with current state
        env = StudyEnvironment(state_data)
        
        # Get user preferences
        user_prefs = state_data["user_preferences"]
        subjects = user_prefs.get("subjects", [])
        preferred_hours = user_prefs.get("preferred_study_hours", 8)
        break_pref = user_prefs.get("break_preference", 15)
        
        # Get pending tasks
        pending_tasks = state_data.get("pending_tasks", [])
        
        # Generate schedule events
        schedule = []
        current_time = datetime.now(timezone.utc)
        
        # Start from the next 5-minute boundary (not the next hour) to avoid past scheduling
        # This respects the current actual time
        remainder = current_time.minute % 5
        if remainder != 0:
            current_time = current_time + timedelta(minutes=5 - remainder)
        current_time = current_time.replace(second=0, microsecond=0)
        
        total_scheduled_hours = 0
        
        while total_scheduled_hours < preferred_hours and pending_tasks:
            # Get action from PPO model
            obs, _ = env.reset()
            action, _ = self.model.predict(obs)
            
            subject_idx, duration_idx, break_idx = action
            
            # Map to actual values
            duration_hours = int(duration_idx) + 1
            break_minutes = (int(break_idx) + 1) * 5
            
            # Select subject
            if subjects and int(subject_idx) < len(subjects):
                subject = subjects[int(subject_idx)]
            elif pending_tasks:
                subject = pending_tasks[0]["subject"]
            else:
                break
            
            # Select task for this subject
            task = next((t for t in pending_tasks if t["subject"] == subject), None)
            if not task and pending_tasks:
                task = pending_tasks[0]
            
            if not task:
                break
            
            # Create study session event
            start_time = current_time
            end_time = start_time + timedelta(hours=duration_hours)
            
            schedule.append({
                "title": f"Study: {task['title']}",
                "subject": subject,
                "start_time": start_time,
                "end_time": end_time,
                "event_type": "study",
                "task_id": str(task["_id"])
            })
            
            # Add break
            break_start = end_time
            break_end = break_start + timedelta(minutes=break_minutes)
            
            schedule.append({
                "title": "Break",
                "subject": "Break",  # Required field that was missing
                "start_time": break_start,
                "end_time": break_end,
                "event_type": "break",
                "task_id": None
            })
            
            # Update for next iteration
            current_time = break_end
            total_scheduled_hours += duration_hours
            
            # Remove scheduled task
            pending_tasks = [t for t in pending_tasks if str(t["_id"]) != str(task["_id"])]
        
        return schedule
    
    async def calculate_reward(self, event: Dict[str, Any], performance_score: float) -> float:
        """Calculate reward based on event completion and performance"""
        
        # Factors:
        # 1. Performance score (0-1)
        # 2. Task completion (did they complete it?)
        # 3. Time adherence (did they follow the schedule?)
        
        base_reward = performance_score
        
        # Add bonus for high performance
        if performance_score > 0.8:
            base_reward += 0.2
        
        return base_reward
    
    async def update_model(self, event: Dict[str, Any], reward: float):
        """Update PPO model with feedback"""
        
        # In a production system, you would:
        # 1. Store experience (state, action, reward) in a replay buffer
        # 2. Periodically retrain the model with accumulated experiences
        # 3. Save the updated model
        
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        self.model.save(self.model_path)
        
        print(f"Model updated with reward: {reward}")
    
    async def generate_recommendations(self, analytics_data: Dict[str, Any]) -> List[str]:
        """Generate study recommendations based on analytics"""
        
        recommendations = []
        
        completed_tasks = analytics_data.get("completed_tasks", 0)
        avg_sleep = analytics_data.get("avg_sleep", 0)
        avg_mood = analytics_data.get("avg_mood", 0)
        
        # Sleep recommendations
        if avg_sleep < 7:
            recommendations.append({
                "type": "sleep",
                "message": "Your sleep average is below 7 hours. Try to schedule shorter study sessions and prioritize rest.",
                "priority": "high"
            })
        
        # Productivity recommendations
        if completed_tasks < 5:
            recommendations.append({
                "type": "productivity",
                "message": "Consider breaking down large tasks into smaller, manageable chunks to improve completion rate.",
                "priority": "medium"
            })
        
        # Mood-based recommendations
        if avg_mood < 3:
            recommendations.append({
                "type": "wellbeing",
                "message": "Your mood has been low lately. Make sure to take regular breaks and engage in activities you enjoy.",
                "priority": "high"
            })
        elif avg_mood > 4:
            recommendations.append({
                "type": "wellbeing",
                "message": "Great job maintaining positive mood! Keep up the good balance between study and rest.",
                "priority": "low"
            })
        
        # Study pattern recommendations
        recommendations.append({
            "type": "study",
            "message": "Peak focus hours detected between 9 AM - 12 PM. Schedule challenging subjects during this time.",
            "priority": "medium"
        })
        
        return recommendations
