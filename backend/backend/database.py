from motor.motor_asyncio import AsyncIOMotorClient
from config import get_settings
settings = get_settings() 
from typing import Optional

class Database:
    client: Optional[AsyncIOMotorClient] = None
    
db = Database()

async def connect_to_mongo():
    """Connect to MongoDB Atlas"""
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    print("Connected to MongoDB Atlas")

async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        print("Closed MongoDB connection")

def get_database():
    """Get database instance"""
    return db.client[settings.DATABASE_NAME]

def get_collection(collection_name: str):
    """Get specific collection"""
    database = get_database()
    return database[collection_name]
