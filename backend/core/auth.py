# core/auth.py
import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import JWT_SECRET, JWT_ALGORITHM

# --- PASSWORD HELPERS ---

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

# --- JWT HELPERS ---

def create_jwt(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + expires_delta})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None

# --- DEPENDENCY ---

auth_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    token = credentials.credentials
    payload = decode_jwt(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return payload
