from datetime import datetime
from typing import List, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from core.auth import get_current_user
from db.crud import (
    get_log_for_date,
    create_daily_log,
    update_daily_log,
    get_latest_log_before,
    get_profile_by_user,
)

router = APIRouter()

ActivityType = Literal["running", "cycling", "swimming", "walking", "gym", "yoga"]


class Activity(BaseModel):
    type: ActivityType
    duration: int = Field(ge=1, le=300)          # minutes — 5 hours is a generous ceiling
    intensity: int = Field(default=0, ge=0, le=10)


class LogEntry(BaseModel):
    date: str
    weight: float = Field(ge=20, le=300)         # kg
    mood: int = Field(ge=1, le=5)
    activities: List[Activity] = Field(min_length=1)
    notes: str = Field(default="", max_length=1000)

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        try:
            parsed = datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("date must be a valid date in YYYY-MM-DD format")
        if parsed.date() > datetime.utcnow().date():
            raise ValueError("date cannot be in the future")
        if parsed < datetime(2000, 1, 1):
            raise ValueError("date is too far in the past")
        return v


def _check_weight_consistency(user_id: str, entry: LogEntry):
    """
    Guardrails against implausible weight entries:
    - Anyone: a huge jump vs. the last known weight is almost always a typo,
      not real physiology — scale the allowed change by how many days have
      passed since the last data point.
    - Weight-loss goal specifically: reject an unexplained increase beyond a
      small day-to-day tolerance, since that contradicts the stated goal.
    """
    profile = get_profile_by_user(user_id)
    baseline_log = get_latest_log_before(user_id, entry.date)

    if baseline_log:
        baseline_weight = baseline_log["weight"]
        baseline_date_str = baseline_log["date"]
    elif profile and profile.get("current_weight") is not None:
        baseline_weight = profile["current_weight"]
        baseline_date_str = profile.get("start_date") or entry.date
    else:
        return  # first-ever data point for this user — nothing to compare against

    try:
        entry_date = datetime.strptime(entry.date, "%Y-%m-%d")
        baseline_date = datetime.strptime(baseline_date_str, "%Y-%m-%d")
        day_gap = abs((entry_date - baseline_date).days)
    except ValueError:
        day_gap = 1

    diff = entry.weight - baseline_weight

    # General implausibility guard (either direction), scaled by elapsed time.
    max_plausible_change = max(3.0, day_gap * 0.35)
    if abs(diff) > max_plausible_change:
        raise HTTPException(
            status_code=400,
            detail=(
                f"A change of {abs(diff):.1f}kg from your last recorded weight "
                f"({baseline_weight}kg, {day_gap} day(s) ago) isn't realistic. "
                "Please double-check the value you entered."
            ),
        )

    # Goal-specific directional guard.
    fitness_goal = profile.get("fitness_goal") if profile else None
    if fitness_goal == "weight_loss" and diff > 0.5:
        raise HTTPException(
            status_code=400,
            detail=(
                f"This entry ({entry.weight}kg) is {diff:.1f}kg higher than your last "
                f"recorded weight ({baseline_weight}kg). Your goal is set to weight loss — "
                "if this increase is correct, update your goal on the Profile page."
            ),
        )


@router.post("/")
def create_log(entry: LogEntry, user=Depends(get_current_user)):
    user_id = user["id"]

    _check_weight_consistency(user_id, entry)

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
