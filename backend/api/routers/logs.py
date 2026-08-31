from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List

from core.auth import get_current_user
from db.crud import get_log_for_date, create_daily_log, update_daily_log

router = APIRouter()

class Activity(BaseModel):
    type: str
    duration: int
    intensity: int = 0

class LogEntry(BaseModel):
    date: str
    weight: float
    mood: int
    activities: List[Activity]
    notes: str = ""

@router.post("/")
def create_log(entry: LogEntry, user=Depends(get_current_user)):
    user_id = user["id"]
    existing = get_log_for_date(user_id, entry.date)

    # Convert incoming activities to plain dicts
    new_activities = [act.dict() for act in entry.activities]

    if existing:
        existing_activities = existing.get("activities", [])

        # Prevent duplicate types
        existing_types = [a.get("type") for a in existing_activities]
        for act in new_activities:
            if act["type"] in existing_types:
                raise HTTPException(
                    status_code=400,
                    detail=f"Activity '{act['type']}' has already been logged for this date."
                )

        # merge
        merged = existing_activities + new_activities

        updated_log = {
            "activities": merged,
            "weight": entry.weight,
            "mood": entry.mood,
            "notes": entry.notes,
        }

        update_daily_log(user_id, entry.date, updated_log)
        return {"status": "Activities added successfully"}
    else:
        # first log for this date
        log_data = {
            "user_id": user_id,
            "date": entry.date,
            "weight": entry.weight,
            "mood": entry.mood,
            "notes": entry.notes,
            "activities": new_activities,
        }
        create_daily_log(log_data)
        return {"status": "Log saved successfully!"}
