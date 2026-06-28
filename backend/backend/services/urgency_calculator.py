from datetime import datetime, timezone
from typing import List, Dict, Any

class UrgencyCalculator:
    """Calculate dynamic urgency scores for tasks, supporting optional due dates"""
    
    @staticmethod
    def calculate_urgency(
        task: Dict[str, Any],
        current_time: datetime = None
    ) -> float:
        if current_time is None:
            current_time = datetime.now(timezone.utc)
        
        due_date = task.get("due_date")
        estimated_minutes = task.get("estimated_minutes", 30)
        created_at = task.get("created_at") or current_time

        # CASE 1: Hard Deadline (Exponential Urgency)
        if due_date:
            # Ensure due_date is offset-aware for comparison
            if due_date.tzinfo is None:
                due_date = due_date.replace(tzinfo=timezone.utc)

            time_remaining_hours = (due_date - current_time).total_seconds() / 3600
            
            if time_remaining_hours <= 0:
                return 10.0  # Cap overdue tasks at a high priority value
            
            # Minimum threshold to avoid massive spikes (30 mins)
            time_remaining_hours = max(0.5, time_remaining_hours)
            urgency = estimated_minutes / time_remaining_hours
            
        # CASE 2: No Deadline (Linear "Heat" Urgency)
        else:
            # For tasks with no due date, urgency is based on task size 
            # and "staleness" (how long it has been in the system)
            age_in_days = (current_time - created_at).days
            
            # Formula: (Size Factor) + (Days Waiting * 0.1)
            # A 2-hour task (120 min) starts at 1.2 and gains 0.1 per day.
            urgency = (estimated_minutes / 100) + (age_in_days * 0.1)

        return round(urgency, 2)
    
    @staticmethod
    def normalize_urgencies(tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # This keeps the Neural Network input in the 0.0 - 1.0 range
        urgencies = [t.get("urgency_score", 0) for t in tasks]
        
        if not urgencies or max(urgencies) == 0:
            for t in tasks: t["normalized_urgency"] = 0.0
            return tasks
        
        max_urg = max(urgencies)
        min_urg = min(urgencies)
        range_val = max_urg - min_urg
        
        for task in tasks:
            raw = task.get("urgency_score", 0)
            task["normalized_urgency"] = round((raw - min_urg) / range_val, 4) if range_val > 0 else 0.5
            
        return tasks