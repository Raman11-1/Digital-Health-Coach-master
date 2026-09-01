import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
LLM_API_KEY = os.getenv("LLM_API_KEY")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "mistral")
MODEL_NAME = os.getenv("MODEL_NAME", "open-mistral-7b")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret")
JWT_ALGORITHM = "HS256"

# Comma-separated list of allowed frontend origins, e.g.
# "https://frontend-two-rust-82.vercel.app,http://localhost:3000"
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "https://frontend-two-rust-82.vercel.app,http://localhost:3000",
    ).split(",")
    if origin.strip()
]
