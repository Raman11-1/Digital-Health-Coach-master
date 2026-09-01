import os
from dotenv import load_dotenv

load_dotenv()


def _clean_env(value: str) -> str:
    """
    Strip accidental surrounding quotes from an env var value. python-dotenv
    strips quotes from KEY="value" lines automatically, but hosting
    dashboards (Render, etc.) store whatever literal text is pasted in —
    copying a .env line's quoted value there leaves the quote characters
    embedded in the actual value, which silently breaks anything that
    compares it exactly (e.g. an LLM provider rejecting an unrecognized
    model id like '"open-mistral-7b"').
    """
    if value and len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
        return value[1:-1]
    return value


MONGO_URI = os.getenv("MONGO_URI")
LLM_API_KEY = os.getenv("LLM_API_KEY")
LLM_PROVIDER = _clean_env(os.getenv("LLM_PROVIDER", "mistral"))
MODEL_NAME = _clean_env(os.getenv("MODEL_NAME") or os.getenv("MISTRAL_MODEL", "open-mistral-7b"))
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
