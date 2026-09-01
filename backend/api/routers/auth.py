# api/routers/auth.py
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field, field_validator

from db.crud import find_user, create_user
from core.auth import hash_password, verify_password, create_jwt

router = APIRouter(tags=["Auth"])


class SignupModel(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must contain at least one letter and one number")
        return v


class LoginModel(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


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
