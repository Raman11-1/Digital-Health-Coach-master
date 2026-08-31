from fastapi import APIRouter, Depends
from core.auth import get_current_user

router = APIRouter()

@router.get("/me")
def get_current_user_info(current_user=Depends(get_current_user)):
    # Just return user info
    return {
        "id": current_user["id"],
        "email": current_user["email"],
    }
