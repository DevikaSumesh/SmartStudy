from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from bson import ObjectId
from utils.auth import get_current_user
from database import get_collection

router = APIRouter()

@router.post("/log-session")
async def log_focus_session(
    data: dict,
    user_id: str = Depends(get_current_user)
):
    """
    Log complete focus session with behavioral feedback
    
    Captures:
    - Focus switch detection (selected non-recommended task)
    - Performance score (actual vs target duration)
    - Well-being state (mood, energy, sleep)
    """
    try:
        task_id = data.get("task_id")
        new_task_id = data.get("new_task_id")
        actual_minutes = data.get("actual_minutes", 0)
        focus_switch = data.get("focus_switch", False)
        is_completion = data.get("is_completion", False)
        performance_score = data.get("performance_score", 0.5)
        
        # Fetch mood and sleep state
        mood_collection = get_collection("mood_entries")
        sleep_collection = get_collection("sleep_logs")
        
        latest_mood = await mood_collection.find_one(
            {"user_id": ObjectId(user_id)},
            sort=[("created_at", -1)]
        )
        latest_sleep = await sleep_collection.find_one(
            {"user_id": ObjectId(user_id)},
            sort=[("created_at", -1)]
        )
        
        # Calculate reward with behavioral penalties/bonuses
        reward = 0.0
        
        if is_completion:
            reward += 1.0  # Full completion reward
        else:
            reward += 0.5 * performance_score  # Partial reward
        
        if focus_switch:
            reward -= 0.3
            print(f"[v0] FOCUS SWITCH PENALTY: Task {task_id} → {new_task_id}")
        
        energy = latest_mood.get("energy_level", 5) if latest_mood else 5
        sleep = latest_sleep.get("hours_slept", 7.0) if latest_sleep else 7.0
        
        if energy < 5 and sleep < 6:
            reward -= 0.2  # Penalty for studying in poor state
        
        # Save to training buffer
        rl_collection = get_collection("rl_training_data")
        
        training_entry = {
            "user_id": ObjectId(user_id),
            "task_id": ObjectId(task_id),
            "actual_minutes": actual_minutes,
            "focus_switch": focus_switch,
            "is_completion": is_completion,
            "reward": reward,
            "mood_state": {
                "energy": energy,
                "mood_score": latest_mood.get("mood_score", 5) if latest_mood else 5
            },
            "sleep_state": {
                "hours_slept": sleep
            },
            "timestamp": datetime.utcnow(),
            "processed": False
        }
        
        result = await rl_collection.insert_one(training_entry)
        
        return {
            "message": "Focus session logged",
            "reward": reward,
            "focus_switch_detected": focus_switch,
            "training_data_id": str(result.inserted_id)
        }
    
    except Exception as e:
        print(f"[v0] Focus session error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
