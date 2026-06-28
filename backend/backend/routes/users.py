from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from models.user import UserResponse
from utils.auth import get_current_user
from database import get_collection

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(user_id: str = Depends(get_current_user)):
    """Get current user profile"""
    users_collection = get_collection("users")
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

