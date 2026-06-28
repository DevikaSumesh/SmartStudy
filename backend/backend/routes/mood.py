from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime, date
from bson import ObjectId
from models.mood import MoodEntryCreate, MoodEntryResponse
from utils.auth import get_current_user
from database import get_collection

router = APIRouter()

@router.post("/", response_model=MoodEntryResponse, status_code=status.HTTP_201_CREATED)
async def log_mood(mood_entry: MoodEntryCreate, user_id: str = Depends(get_current_user)):
    mood_collection = get_collection("mood_entries")
    
    mood_doc = {
        **mood_entry.model_dump(),
        "user_id": ObjectId(user_id),
        "created_at": datetime.utcnow() 
    }
    
    result = await mood_collection.insert_one(mood_doc)
    
    # FIX: Assign the raw ObjectId. 
    # Do NOT use str(). The model wants an ObjectId instance to validate.
    mood_doc["_id"] = result.inserted_id
    
    return mood_doc

@router.get("/", response_model=List[MoodEntryResponse])
async def get_mood_entries(
    start_date: date = None,
    end_date: date = None,
    user_id: str = Depends(get_current_user)
):
    mood_collection = get_collection("mood_entries")
    query = {"user_id": ObjectId(user_id)}
    
    if start_date and end_date:
        query["date"] = {
            "$gte": datetime.combine(start_date, datetime.min.time()),
            "$lte": datetime.combine(end_date, datetime.max.time())
        }
    
    cursor = mood_collection.find(query).sort("date", -1)
    entries = await cursor.to_list(length=100)
    
    # FIX: We removed the loop that was converting IDs to strings.
    # Returning raw entries (with ObjectIds) allows PyObjectId to validate correctly.
    return entries

@router.get("/latest", response_model=MoodEntryResponse)
async def get_latest_mood(user_id: str = Depends(get_current_user)):
    mood_collection = get_collection("mood_entries")
    
    entry = await mood_collection.find_one(
        {"user_id": ObjectId(user_id)},
        sort=[("date", -1)]
    )
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No mood entries found"
        )
    
    # FIX: No manual string conversion here either.
    return entry