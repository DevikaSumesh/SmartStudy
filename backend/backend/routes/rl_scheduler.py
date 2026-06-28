from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime, timedelta
from bson import ObjectId
from pydantic import BaseModel

from utils.auth import get_current_user
from database import get_collection
from services.ppo_service import PPOSchedulerService
from models.ai import AIScheduleResponse

router = APIRouter()
ppo_service = PPOSchedulerService()

class RewardUpdate(BaseModel):
    event_id: Optional[str] = None
    task_id: Optional[str] = None
    performance_score: float
    actual_minutes: Optional[int] = None

@router.post("/generate-schedule", response_model=AIScheduleResponse)
async def generate_schedule(user_id: str = Depends(get_current_user)):
    """Generate optimized study schedule using PPO with dynamic urgency"""
    try:
        users_collection = get_collection("users")
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        # --- ADD THIS BLOCK: Construct the preferences object expected by the AI service ---
        user_prefs = {
            "subjects": user.get("subjects", []),
            "goals": user.get("goals", []),
            "preferred_study_hours": user.get("preferred_study_hours", 8),
            "sleep_target_hours": user.get("sleep_target_hours", 8),
            "break_preference": user.get("break_preference", 15)
        }
        # ----------------------------------------------------------------------------------
        
        tasks_collection = get_collection("tasks")
        pending_tasks = await tasks_collection.find({
            "user_id": ObjectId(user_id),
            "completed": False
        }).to_list(length=100)
        
        sleep_collection = get_collection("sleep_logs")
        latest_sleep = await sleep_collection.find_one(
            {"user_id": ObjectId(user_id)},
            sort=[("date", -1)]
        )
        
        mood_collection = get_collection("mood_entries")
        latest_mood = await mood_collection.find_one(
            {"user_id": ObjectId(user_id)},
            sort=[("date", -1)]
        )
        
        # Update the state to include 'user_preferences'
        state = {
            "user_id": user_id,
            "user_preferences": user_prefs,  # THIS KEY IS REQUIRED BY PPOSchedulerService
            "pending_tasks": pending_tasks,
            "latest_sleep": latest_sleep or {"hours_slept": 7},
            "latest_mood": latest_mood or {"mood_score": 5, "energy_level": 5}
        }
        
        # This will no longer throw a KeyError: 'user_preferences'
        schedule = await ppo_service.generate_schedule(state)
        
        calendar_collection = get_collection("calendar_events")
        
        for event in schedule:
            event_doc = {
                "user_id": ObjectId(user_id),
                "title": event.get("title", "Untitled Task"),
                "subject": event.get("subject", "General"),
                "start_time": event["start_time"],
                "end_time": event["end_time"],
                "event_type": event["event_type"],
                "task_id": ObjectId(event.get("task_id")) if event.get("task_id") else None,
                "urgency_score": event.get("urgency_score", 0),
                "is_scheduled_by_ai": True,
                "created_at": datetime.utcnow()
            }
            await calendar_collection.insert_one(event_doc)
        
        return {
            "message": "Schedule generated successfully",
            "events_created": len(schedule),
            "schedule": schedule
        }
    
    except Exception as e:
        print(f"[v0] Schedule generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate schedule: {str(e)}"
        )

@router.post("/retrain")
async def retrain_model(user_id: str = Depends(get_current_user)):
    """Retrain PPO model with accumulated training data"""
    try:
        result = await ppo_service.retrain_model(user_id)
        return {
            "message": "Model retrained successfully",
            "data_points": result.get("data_points_used", 0),
            "status": result.get("status", "success")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrain model: {str(e)}"
            )
# routes/rl_scheduler.py

@router.get("/recommendations")
async def get_task_recommendations(user_id: str = Depends(get_current_user)):
    try:
        calendar_collection = get_collection("calendar_events")
        # Use a 5-minute lookback to account for small sync delays
        now = datetime.utcnow()
        buffer_time = now - timedelta(minutes=5)
        
        # FIND: Any AI study task that has started but not yet ended
        current_event = await calendar_collection.find_one({
            "user_id": ObjectId(user_id),
            "is_scheduled_by_ai": True,
            "event_type": "study",
            "start_time": {"$lte": now.isoformat()},
            "end_time": {"$gte": buffer_time.isoformat()}
        }, sort=[("start_time", 1)]) # Get the earliest one first

        if not current_event:
            return {"recommendation": None, "message": "No active study session."}

        return {
            "recommendation": {
                "task_id": str(current_event.get("task_id")),
                "title": current_event.get("title"),
                "subject": current_event.get("subject"),
                "end_time": current_event.get("end_time")
            }
        }
    except Exception as e:
        return {"recommendation": None}
    
@router.post("/feedback")
async def log_focus_feedback(data: RewardUpdate, user_id: str = Depends(get_current_user)):
    """Logs stopwatch results and calculates RL rewards"""
    try:
        # Calculate Reward
        # Example: +50 for finishing, -10 if they took way too long
        reward = data.performance_score 
        
        # Save to the training buffer
        await ppo_service._save_experience(
            user_id=user_id,
            state=[0.5, 0.5, 0.5, 0.5, 0.5, 0.5], # Replace with real state vector
            action=data.task_id or "unknown",
            reward=reward
        )
        
        return {"status": "success", "reward_logged": reward}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
