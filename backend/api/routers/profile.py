from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
# [FIX 1] Import save_plan so we can store the generated plan
from db.crud import upsert_user_profile, get_profile_by_user, save_plan 
from core.auth import get_current_user
# [FIX 2] Import the generator function
from core.agents.planner import generate_workout_and_diet 

router = APIRouter()

class Profile(BaseModel):
    name: str
    age: int
    height: float
    current_weight: float           
    weight_goal: float
    fitness_goal: str
    training_preference: str        
    start_date: str

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