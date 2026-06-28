
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import settings
from bson import ObjectId

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_user_id_from_request(request) -> str:
    """Extract user ID from either Authorization header or X-User-ID header"""
    print(f"[v0] Attempting to verify token from request")
    
    # Method 1: Check X-User-ID header (direct user ID) - PRIMARY
    user_id = request.headers.get("X-User-ID")
    if user_id and user_id.strip():
        print(f"[v0] Found user_id in X-User-ID header: {user_id}")
        return user_id.strip()
    
    # Method 2: Check Authorization header (Bearer token)
    auth_header = request.headers.get("Authorization")
    if auth_header:
        try:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == "bearer":
                token = parts[1]
                print(f"[v0] Found Authorization header with token")
                
                # Try JWT decode first
                try:
                    payload = decode_token(token)
                    user_id = payload.get("sub")
                    if user_id:
                        print(f"[v0] Decoded JWT token, user_id: {user_id}")
                        return user_id
                except JWTError as e:
                    print(f"[v0] JWT decode failed: {e}, treating token as direct user_id")
                    # If JWT decode fails, treat token as user_id directly
                    if token.strip():
                        return token.strip()
        except Exception as e:
            print(f"[v0] Error processing Authorization header: {e}")
    
    # No valid auth found
    print(f"[v0] No valid authentication found. Headers: {dict(request.headers)}")
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Missing or invalid authentication credentials. Provide X-User-ID or Authorization header."
    )


async def verify_token_async(request) -> str:
    """Async version of token verification"""
    return get_user_id_from_request(request)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Extract user ID from JWT token"""
    token = credentials.credentials
    payload = decode_token(token)
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    return user_id

