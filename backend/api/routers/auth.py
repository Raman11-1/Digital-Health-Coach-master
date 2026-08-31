# api/routers/auth.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db.crud import find_user, create_user
from core.auth import hash_password, verify_password, create_jwt

router = APIRouter(tags=["Auth"])

class SignupModel(BaseModel):
    email: str
    password: str

class LoginModel(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(user: SignupModel):
    existing = find_user(user.email)
    if existing:
        raise HTTPException(400, "User already exists")
    hashed_pw = hash_password(user.password)
    create_user({"email": user.email, "password_hash": hashed_pw})
    return {"status": "ok", "message": "Signup successful"}

@router.post("/login")
def login(user: LoginModel):
    db_user = find_user(user.email)
    if not db_user:
        raise HTTPException(401, "Invalid credentials")
    if not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    token = create_jwt({"email": db_user["email"], "id": str(db_user["_id"])})
    return {"access_token": token}
