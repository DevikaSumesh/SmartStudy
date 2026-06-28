from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional,Dict,Any
class RLTrainingTuple(BaseModel):
    """Schema for Observation-Action-Reward data in MongoDB"""
    # Allows MongoDB ObjectId to be handled if necessary
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)
    timestamp: datetime = datetime.now()
    user_id: str
    
    # The "Observation": State of the user and environment
    observation: Dict[str, Any]  # e.g., {"mood": 4, "energy": 3, "sleep": 7.5}
    
    # The "Action": What the AI decided to schedule
    action: Dict[str, Any]       # e.g., {"task_id": "...", "duration": 25, "slot": "09:00"}
    
    # The "Reward": Feedback from the user's performance
    reward: Dict[str, Any]       # e.g., {"score": 1.1, "actual_minutes": 20}
    
    # Optional PPO specific values (advantage, log_probs) for advanced training
    ppo_metadata: Optional[Dict[str, Any]] = None

class AIScheduleEvent(BaseModel):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    title: str
    subject: Optional[str] = "General"  # FIX: Give it a default or make it Optional
    start_time: datetime
    end_time: datetime
    event_type: str
    task_id: Optional[str] = None
    is_scheduled_by_ai: bool = True     # Ensure this is here

class AIScheduleResponse(BaseModel):
    message: str
    events_created: int
    schedule: List[AIScheduleEvent]