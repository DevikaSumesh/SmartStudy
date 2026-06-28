from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache  # Added this import

class Settings(BaseSettings):
    
    MONGODB_URL: str = "mongodb+srv://sonalsuresh2004_db_user:ZxuD7TJJpvq0OwL4@cluster0.9acxo3m.mongodb.net/?appName=Cluster0"
    DATABASE_NAME: str = "smartstudy_db"
    
    # JWT
    SECRET_KEY: str = "d57ccd4aaa3f4f53d43f05d6a2ad05659009fcaeffdec5dc945b621190376c96"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "[http://127.0.0.1:3000](http://127.0.0.1:3000)",
        "[https://your-frontend-domain.vercel.app](https://your-frontend-domain.vercel.app)"
    ]
    
    # Google Gemini API
    GEMINI_API_KEY: str = "AIzaSyA2tNr8j0qyVTICX7R5XyYczBVTlg0fhDI"
    # Updated to the new working model to prevent 404s
    GEMINI_MODEL: str = "gemini-1.5-flash" 
    
    # Feature Flags
    DEMO_MODE: bool = False
    
    # FAISS
    FAISS_INDEX_PATH: str = "./faiss_indexes"
    EMBEDDING_DIMENSION: int = 768
    
    # PPO RL Model
    PPO_MODEL_PATH: str = "./models/ppo_scheduler"
    RL_TRAINING_TIMESTEPS: int = 100000
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024 
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".txt", ".doc", ".docx"]
    UPLOAD_DIR: str = "./uploads"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        # Added extra="ignore" so unused .env variables don't crash your app
        extra = "ignore"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()