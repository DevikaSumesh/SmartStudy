from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from bson import ObjectId
from utils.auth import get_current_user
from database import get_collection

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(user_id: str = Depends(get_current_user)):
    """Get comprehensive dashboard statistics"""
    
    # Task statistics
    tasks_collection = get_collection("tasks")
    total_tasks = await tasks_collection.count_documents({"user_id": ObjectId(user_id)})
    completed_tasks = await tasks_collection.count_documents({
        "user_id": ObjectId(user_id),
        "completed": True
    })
    pending_tasks = total_tasks - completed_tasks
    
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Sleep statistics (last 7 days)
    sleep_collection = get_collection("sleep_logs")
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    sleep_pipeline = [
        {"$match": {
            "user_id": ObjectId(user_id),
            "date": {"$gte": week_ago}
        }},
        {"$group": {
            "_id": None,
            "avg_hours": {"$avg": "$hours_slept"},
            "avg_quality": {"$avg": "$quality_rating"}
        }}
    ]
    
    sleep_stats = await sleep_collection.aggregate(sleep_pipeline).to_list(length=1)
    avg_sleep_hours = sleep_stats[0]["avg_hours"] if sleep_stats else 0
    avg_sleep_quality = sleep_stats[0]["avg_quality"] if sleep_stats else 0
    
    # Mood statistics (last 7 days)
    mood_collection = get_collection("mood_entries")
    
    mood_pipeline = [
        {"$match": {
            "user_id": ObjectId(user_id),
            "date": {"$gte": week_ago}
        }},
        {"$group": {
            "_id": None,
            "avg_mood": {"$avg": "$mood_score"},
            "avg_energy": {"$avg": "$energy_level"},
            "avg_stress": {"$avg": "$stress_level"}
        }}
    ]
    
    mood_stats = await mood_collection.aggregate(mood_pipeline).to_list(length=1)
    avg_mood = mood_stats[0]["avg_mood"] if mood_stats else 0
    avg_energy = mood_stats[0]["avg_energy"] if mood_stats else 0
    avg_stress = mood_stats[0]["avg_stress"] if mood_stats else 0
    
    # Pomodoro statistics
    pomodoro_collection = get_collection("pomodoro_sessions")
    total_pomodoros = await pomodoro_collection.count_documents({
        "user_id": ObjectId(user_id),
        "completed": True
    })
    
    pomodoro_pipeline = [
        {"$match": {
            "user_id": ObjectId(user_id),
            "completed": True
        }},
        {"$group": {
            "_id": None,
            "total_minutes": {"$sum": "$actual_duration_minutes"}
        }}
    ]
    
    pomodoro_stats = await pomodoro_collection.aggregate(pomodoro_pipeline).to_list(length=1)
    total_focus_minutes = pomodoro_stats[0]["total_minutes"] if pomodoro_stats else 0
    
    return {
        "tasks": {
            "total": total_tasks,
            "completed": completed_tasks,
            "pending": pending_tasks,
            "completion_rate": round(completion_rate, 2)
        },
        "sleep": {
            "avg_hours": round(avg_sleep_hours, 2),
            "avg_quality": round(avg_sleep_quality, 2)
        },
        "mood": {
            "avg_mood": round(avg_mood, 2),
            "avg_energy": round(avg_energy, 2),
            "avg_stress": round(avg_stress, 2)
        },
        "pomodoro": {
            "total_sessions": total_pomodoros,
            "total_minutes": total_focus_minutes
        }
    }

@router.get("/subject-performance")
async def get_subject_performance(user_id: str = Depends(get_current_user)):
    """Get performance by subject"""
    tasks_collection = get_collection("tasks")
    
    pipeline = [
        {"$match": {"user_id": ObjectId(user_id)}},
        {"$group": {
            "_id": "$subject",
            "total": {"$sum": 1},
            "completed": {
                "$sum": {"$cond": ["$completed", 1, 0]}
            }
        }},
        {"$project": {
            "subject": "$_id",
            "total": 1,
            "completed": 1,
            "completion_rate": {
                "$multiply": [
                    {"$divide": ["$completed", "$total"]},
                    100
                ]
            }
        }}
    ]
    
    results = await tasks_collection.aggregate(pipeline).to_list(length=50)
    
    for result in results:
        result["subject"] = result.pop("_id")
        result["completion_rate"] = round(result["completion_rate"], 2)
    
    return results

@router.get("/trends")
async def get_trends(days: int = 7, user_id: str = Depends(get_current_user)):
    """Get trend data for charts"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Task completion trend
    tasks_collection = get_collection("tasks")
    task_pipeline = [
        {"$match": {
            "user_id": ObjectId(user_id),
            "updated_at": {"$gte": start_date}
        }},
        {"$group": {
            "_id": {
                "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": "$updated_at"
                }
            },
            "completed": {
                "$sum": {"$cond": ["$completed", 1, 0]}
            }
        }},
        {"$sort": {"_id": 1}}
    ]
    
    task_trends = await tasks_collection.aggregate(task_pipeline).to_list(length=days)
    
    # Sleep trend
    sleep_collection = get_collection("sleep_logs")
    sleep_pipeline = [
        {"$match": {
            "user_id": ObjectId(user_id),
            "date": {"$gte": start_date}
        }},
        {"$group": {
            "_id": {
                "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": "$date"
                }
            },
            "hours_slept": {"$avg": "$hours_slept"},
            "quality": {"$avg": "$quality_rating"}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    sleep_trends = await sleep_collection.aggregate(sleep_pipeline).to_list(length=days)
    
    # Mood trend
    mood_collection = get_collection("mood_entries")
    mood_pipeline = [
        {"$match": {
            "user_id": ObjectId(user_id),
            "date": {"$gte": start_date}
        }},
        {"$group": {
            "_id": {
                "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": "$date"
                }
            },
            "mood": {"$avg": "$mood_score"},
            "energy": {"$avg": "$energy_level"}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    mood_trends = await mood_collection.aggregate(mood_pipeline).to_list(length=days)
    
    return {
        "tasks": task_trends,
        "sleep": sleep_trends,
        "mood": mood_trends
    }
