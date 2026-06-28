from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from routes import auth, users, tasks, sleep, mood, calendar, pomodoro, chat, analytics, rl_scheduler, focus, syllabus
from database import connect_to_mongo, close_mongo_connection
from config import get_settings

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    print("✅ Connected to MongoDB Atlas")
    yield
    # Shutdown
    await close_mongo_connection()
    print("❌ Closed MongoDB connection")

app = FastAPI(
    title="SmartStudy API",
    description="AI-Powered Study Planner with PPO-based RL Scheduler and RAG Chatbot",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "SmartStudy API is running",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(sleep.router, prefix="/api/sleep", tags=["Sleep Tracking"])
app.include_router(mood.router, prefix="/api/mood", tags=["Mood Tracking"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["Calendar"])
app.include_router(pomodoro.router, prefix="/api/pomodoro", tags=["Pomodoro"])
app.include_router(chat.router, prefix="/api/chat", tags=["RAG Chatbot"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(rl_scheduler.router, prefix="/api/rl-scheduler", tags=["RL Scheduler"])
app.include_router(focus.router, prefix="/api/focus", tags=["Focus Management"])
app.include_router(syllabus.router, prefix="/api/syllabus", tags=["Syllabus"])

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )