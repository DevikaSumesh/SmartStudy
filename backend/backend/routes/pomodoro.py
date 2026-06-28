from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from models.pomodoro import PomodoroSessionCreate, PomodoroSessionUpdate, PomodoroSessionResponse
from utils.auth import get_current_user
from database import get_collection

router = APIRouter()

@router.post("/", response_model=PomodoroSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_session(session: PomodoroSessionCreate, user_id: str = Depends(get_current_user)):
    """Start a Pomodoro session"""
    pomodoro_collection = get_collection("pomodoro_sessions")
    
    session_doc = {
        **session.model_dump(),
        "user_id": ObjectId(user_id),
        "start_time": datetime.utcnow(),
        "completed": False,
        "interrupted": False,
        "created_at": datetime.utcnow()
    }
    
    result = await pomodoro_collection.insert_one(session_doc)
    session_doc["_id"] = str(result.inserted_id)
    session_doc["user_id"] = user_id
    
    return session_doc

@router.put("/{session_id}", response_model=PomodoroSessionResponse)
async def update_session(
    session_id: str,
    session_update: PomodoroSessionUpdate,
    user_id: str = Depends(get_current_user)
):
    """Update/complete a Pomodoro session"""
    pomodoro_collection = get_collection("pomodoro_sessions")
    
    update_data = {k: v for k, v in session_update.model_dump().items() if v is not None}
    
    if session_update.completed:
        update_data["end_time"] = datetime.utcnow()
    
    result = await pomodoro_collection.find_one_and_update(
        {"_id": ObjectId(session_id), "user_id": ObjectId(user_id)},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    result["_id"] = str(result["_id"])
    result["user_id"] = str(result["user_id"])
    return result

@router.get("/", response_model=List[PomodoroSessionResponse])
async def get_sessions(user_id: str = Depends(get_current_user)):
    """Get Pomodoro sessions"""
    pomodoro_collection = get_collection("pomodoro_sessions")
    
    cursor = pomodoro_collection.find({"user_id": ObjectId(user_id)}).sort("start_time", -1)
    sessions = await cursor.to_list(length=100)
    
    for session in sessions:
        session["_id"] = str(session["_id"])
        session["user_id"] = str(session["user_id"])
    
    return sessions

@router.get("/stats")
async def get_pomodoro_stats(user_id: str = Depends(get_current_user)):
    """Get Pomodoro statistics"""
    pomodoro_collection = get_collection("pomodoro_sessions")
    
    pipeline = [
        {"$match": {"user_id": ObjectId(user_id), "completed": True}},
        {"$group": {
            "_id": None,
            "total_sessions": {"$sum": 1},
            "total_minutes": {"$sum": "$actual_duration_minutes"},
            "avg_duration": {"$avg": "$actual_duration_minutes"}
        }}
    ]
    
    result = await pomodoro_collection.aggregate(pipeline).to_list(length=1)
    
    if not result:
        return {
            "total_sessions": 0,
            "total_minutes": 0,
            "avg_duration": 0
        }
    
    stats = result[0]
    stats.pop("_id", None)
    return stats
