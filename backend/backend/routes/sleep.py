from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime, date as py_date, time as py_time
from bson import ObjectId
from models.sleep import SleepLogCreate, SleepLogResponse
from utils.auth import get_current_user
from database import get_collection

router = APIRouter()

@router.post("/", response_model=SleepLogResponse, status_code=status.HTTP_201_CREATED)
async def log_sleep(sleep_log: SleepLogCreate, user_id: str = Depends(get_current_user)):
    sleep_collection = get_collection("sleep_logs")
    
    # 1. Convert Pydantic model to a dictionary
    sleep_data = sleep_log.model_dump()
    
    # 2. FIX: MongoDB cannot encode 'datetime.time'. 
    # We must convert sleep_time and wake_time to strings or full datetimes.
    if isinstance(sleep_data.get("sleep_time"), py_time):
        sleep_data["sleep_time"] = sleep_data["sleep_time"].strftime("%H:%M:%S")
    
    if isinstance(sleep_data.get("wake_time"), py_time):
        sleep_data["wake_time"] = sleep_data["wake_time"].strftime("%H:%M:%S")

    # 3. FIX: MongoDB needs 'date' to be a full datetime object
    if isinstance(sleep_data.get("date"), py_date) and not isinstance(sleep_data["date"], datetime):
        sleep_data["date"] = datetime.combine(sleep_data["date"], py_time.min)
    
    # 4. Prepare document for insertion
    sleep_doc = {
        **sleep_data,
        "user_id": ObjectId(user_id),
        "created_at": datetime.utcnow()
    }
    
    # 5. Insert into MongoDB
    result = await sleep_collection.insert_one(sleep_doc)
    
    # 6. Attach the ID for the response
    sleep_doc["_id"] = result.inserted_id
    
    return sleep_doc

@router.get("/", response_model=List[SleepLogResponse])
async def get_sleep_logs(
    start_date: py_date = None,
    end_date: py_date = None,
    user_id: str = Depends(get_current_user)
):
    sleep_collection = get_collection("sleep_logs")
    query = {"user_id": ObjectId(user_id)}
    
    if start_date and end_date:
        query["date"] = {
            "$gte": datetime.combine(start_date, py_time.min),
            "$lte": datetime.combine(end_date, py_time.max)
        }
    
    cursor = sleep_collection.find(query).sort("date", -1)
    logs = await cursor.to_list(length=100)
    
    return logs

@router.get("/latest", response_model=SleepLogResponse)
async def get_latest_sleep_log(user_id: str = Depends(get_current_user)):
    sleep_collection = get_collection("sleep_logs")
    
    log = await sleep_collection.find_one(
        {"user_id": ObjectId(user_id)},
        sort=[("date", -1)]
    )
    
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No sleep logs found"
        )
    
    return log