from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from models.calendar import CalendarEventCreate, CalendarEventUpdate, CalendarEventResponse
from utils.auth import get_current_user
from database import get_collection

router = APIRouter()

@router.post("/events", response_model=CalendarEventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event: CalendarEventCreate, 
    user_id: str = Depends(get_current_user)
):
    """Create a calendar event"""
    calendar_collection = get_collection("calendar_events")
    
    # Store with proper BSON types
    event_doc = {
        **event.model_dump(),
        "user_id": ObjectId(user_id),
        "created_at": datetime.utcnow()
    }
    
    result = await calendar_collection.insert_one(event_doc)
    
    event_doc["_id"] = result.inserted_id
    return event_doc

@router.get("/events", response_model=List[CalendarEventResponse])
async def get_events(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user)
):
    """Get calendar events for current user"""
    calendar_collection = get_collection("calendar_events")
    query = {"user_id": ObjectId(user_id)}
    
    if start_date and end_date:
        try:
            # Handle 'Z' suffix for ISO strings
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            
            query["$and"] = [
                {"start_time": {"$lt": end_dt}},
                {"end_time": {"$gt": start_dt}}
            ]
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid date format: {str(e)}"
            )
    
    try:
        # Fetch events as raw BSON/Dicts
        cursor = calendar_collection.find(query).sort("start_time", 1)
        events = await cursor.to_list(length=100)
        
        return events
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch events: {str(e)}"
        )

@router.put("/{event_id}", response_model=CalendarEventResponse)
async def update_event(
    event_id: str,
    event_update: CalendarEventUpdate,
    user_id: str = Depends(get_current_user)
):
    """Update a calendar event"""
    calendar_collection = get_collection("calendar_events")
    update_data = {k: v for k, v in event_update.model_dump().items() if v is not None}
    
    result = await calendar_collection.find_one_and_update(
        {"_id": ObjectId(event_id), "user_id": ObjectId(user_id)},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return result

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: str, 
    user_id: str = Depends(get_current_user)
):
    """Delete a calendar event"""
    calendar_collection = get_collection("calendar_events")
    result = await calendar_collection.delete_one({
        "_id": ObjectId(event_id),
        "user_id": ObjectId(user_id)
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return None