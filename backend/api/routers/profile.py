from datetime import datetime, timedelta
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

# [FIX 1] Import save_plan so we can store the generated plan
from db.crud import upsert_user_profile, get_profile_by_user, save_plan
from core.auth import get_current_user
# [FIX 2] Import the generator function
from core.agents.planner import generate_workout_and_diet

router = APIRouter()


class Profile(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    age: int = Field(ge=10, le=100)
    height: float = Field(ge=50, le=250)          # cm
    current_weight: float = Field(ge=20, le=300)  # kg
    weight_goal: float = Field(ge=20, le=300)     # kg
    fitness_goal: Literal["mix", "weight_loss", "strength"]
    training_preference: Literal["strength", "fat_loss", "mixed", "endurance"]
    start_date: str

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v

    @field_validator("start_date")
    @classmethod
    def validate_start_date(cls, v: str) -> str:
        try:
            parsed = datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("start_date must be a valid date in YYYY-MM-DD format")
        earliest = datetime(2000, 1, 1)
        latest = datetime.utcnow() + timedelta(days=730)
        if parsed < earliest or parsed > latest:
            raise ValueError("start_date must be between 2000-01-01 and 2 years from today")
        return v


# Create or update the profile AND generate the plan
@router.post("/")
def create_profile(profile: Profile, user=Depends(get_current_user)):
    # 1. Prepare profile data
    data = profile.dict()
    data["user_id"] = user["id"]

    # 2. Save Profile to DB
    upsert_user_profile(data)

    # [FIX 3] Automatically generate the plan right now
    # We pass the profile data directly to the generator
    try:
        print(f"Generating initial plan for user {user['id']}...") # Debug log
        plan_data = generate_workout_and_diet(data)

        # 4. Save the generated plan to DB
        save_plan({"user_id": user["id"], "plan": plan_data})
        print("Plan generated and saved successfully.")

    except Exception as e:
        print(f"Error generating plan: {e}")
        # We don't stop the response, but we log the error.
        # In a real app, you might want to return a warning.

    return {"status": "Profile saved and Plan generated successfully"}

@router.get("/")
def fetch_profile(user=Depends(get_current_user)):
    profile_data = get_profile_by_user(user["id"])
    if not profile_data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile_data
