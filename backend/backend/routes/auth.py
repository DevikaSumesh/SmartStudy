from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timedelta
from bson import ObjectId
from models.user import UserCreate, UserLogin, UserResponse
from utils.auth import get_password_hash, verify_password, create_access_token
from database import get_collection
from config import get_settings


settings = get_settings()

router = APIRouter()

@router.post("/signup", response_model=dict)
async def signup(user: UserCreate):
    """Register a new user"""
    users_collection = get_collection("users")
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user.password)
    
    # Create user document
    user_doc = {
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(),
    
        "subjects": [],
        "goals": [],
        "preferred_study_hours": 8,
        "sleep_target_hours": 8,
        "break_preference": 15
    }
    
    result = await users_collection.insert_one(user_doc)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(result.inserted_id), "name": user.full_name},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(result.inserted_id),
        "name": user.full_name
    }

@router.post("/login", response_model=dict)
async def login(user_credentials: UserLogin):
    """Login user"""
    users_collection = get_collection("users")
    
    # Find user
    user = await users_collection.find_one({"email": user_credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(user_credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user["_id"]), "name": user["full_name"]},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user["_id"]),
        "name": user["full_name"]
    }

@router.post("/google")
async def google_auth():
    """Google OAuth login - To be implemented"""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Google OAuth not yet implemented. Add using google-auth library."
    )

@router.post("/microsoft")
async def microsoft_auth():
    """Microsoft OAuth login - To be implemented"""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Microsoft OAuth not yet implemented. Add using msal library."
    )
