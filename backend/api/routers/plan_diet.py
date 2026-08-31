from fastapi import APIRouter, Depends
from core.auth import get_current_user
from core.agents.planner import generate_workout_and_diet
from db.crud import save_plan, get_latest_plan_by_user

router = APIRouter()

# POST to generate plan + diet
@router.post("/")
def generate_plan_route(user=Depends(get_current_user)):
    # get profile
    from db.crud import get_profile_by_user
    profile = get_profile_by_user(user["id"])
    
    # generate using planner only
    plan_data = generate_workout_and_diet(profile or {})

    # save in DB
    save_plan({"user_id": user["id"], "plan": plan_data})

    return {"plan": plan_data.get("workout", []), "diet": plan_data.get("diet_text", "")}

# GET to fetch existing plan
@router.get("/")
def get_plan_route(user=Depends(get_current_user)):
    plan_doc = get_latest_plan_by_user(user["id"])
    if not plan_doc:
        return {"plan": [], "diet": {}}
    
    plan = plan_doc.get("plan", {})
    
    # FIX: Send BOTH the structured dictionary AND the text
    # This ensures the frontend receives the Object for the 'diet' key
    return {
        "plan": plan.get("workout", []),
        "diet": plan.get("diet", {}),       # Send the actual JSON object
        "diet_text": plan.get("diet_text", "") # Send text as backup
    }
