from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId  # Added for error handling
from models.task import TaskCreate, TaskUpdate, TaskResponse
from utils.auth import get_current_user
from database import get_collection

router = APIRouter()

# Helper function to validate ObjectIDs and prevent server crashes
def validate_object_id(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid ID format: '{id_str}'. Expected a 24-character hex string."
        )

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task: TaskCreate, user_id: str = Depends(get_current_user)):
    """Create a new task"""
    tasks_collection = get_collection("tasks")
    
    new_task = task.model_dump()
    new_task["user_id"] = validate_object_id(user_id) # Validated ID
    new_task["created_at"] = datetime.now()
    
    result = await tasks_collection.insert_one(new_task)
    new_task["_id"] = result.inserted_id
    
    return new_task

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    completed: bool = None,
    subject: str = None,
    user_id: str = Depends(get_current_user)
):
    """Get all tasks for current user"""
    tasks_collection = get_collection("tasks")
    
    query = {"user_id": validate_object_id(user_id)}
    if completed is not None:
        query["completed"] = completed
    if subject:
        query["subject"] = subject
    
    # Combined sorting logic
    cursor = tasks_collection.find(query).sort([
        ("priority", -1), 
        ("due_date", 1)
    ])
    tasks = await cursor.to_list(length=100)
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, user_id: str = Depends(get_current_user)):
    """Get a specific task"""
    tasks_collection = get_collection("tasks")
    
    # Use helper to prevent crash if task_id is 'undefined'
    task = await tasks_collection.find_one({
        "_id": validate_object_id(task_id),
        "user_id": validate_object_id(user_id)
    })
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    user_id: str = Depends(get_current_user)
):
    """Update a task"""
    tasks_collection = get_collection("tasks")
    
    # Filter out None values
    update_data = {k: v for k, v in task_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    # Validating both IDs before querying
    result = await tasks_collection.find_one_and_update(
        {
            "_id": validate_object_id(task_id), 
            "user_id": validate_object_id(user_id)
        },
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return result

@router.post("/{task_id}/sync-completion")
async def sync_task_completion(
    task_id: str,
    total_actual_minutes: int,
    completion_status: str,
    user_id: str = Depends(get_current_user)
):
    """
    Sync task completion status from Focus page to Dashboard
    Updates total_actual_minutes and completion_status
    """
    tasks_collection = get_collection("tasks")
    calendar_collection = get_collection("calendar_events")
    
    # Validate completion status
    valid_statuses = {"pending", "in_progress", "completed", "missed"}
    if completion_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid completion_status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    # Update task with new completion data
    task_result = await tasks_collection.find_one_and_update(
        {
            "_id": validate_object_id(task_id),
            "user_id": validate_object_id(user_id)
        },
        {
            "$set": {
                "total_actual_minutes": total_actual_minutes,
                "completion_status": completion_status,
                "completed": completion_status == "completed",
                "updated_at": datetime.utcnow()
            }
        },
        return_document=True
    )
    
    if not task_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Sync status to all calendar events linked to this task
    await calendar_collection.update_many(
        {
            "user_id": validate_object_id(user_id),
            "task_id": ObjectId(task_id)
        },
        {
            "$set": {
                "status": completion_status,
                "actual_minutes": total_actual_minutes
            }
        }
    )
    
    return {
        "status": "success",
        "message": "Task completion synced",
        "task": task_result
    }

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str, user_id: str = Depends(get_current_user)):
    """Delete a task"""
    tasks_collection = get_collection("tasks")
    
    result = await tasks_collection.delete_one({
        "_id": validate_object_id(task_id),
        "user_id": validate_object_id(user_id)
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return None