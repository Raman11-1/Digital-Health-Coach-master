from fastapi import APIRouter, Depends
from core.agents.orchestrator import run_analyze_adapt
from core.auth import get_current_user

router = APIRouter()

@router.post("/")
def analyze(user = Depends(get_current_user)):
    user_id = user["id"]
    result = run_analyze_adapt(user_id)
    return result
