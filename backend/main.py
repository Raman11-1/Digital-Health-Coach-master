from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers.auth import router as auth_router
from api.routers.profile import router as profile_router
from api.routers.logs import router as logs_router
from api.routers.analyze import router as analyze_router
from api.routers.progress import router as progress_router
from api.routers.plan_diet import router as plan_diet_router
from api.routers.users import router as users_router
from config import ALLOWED_ORIGINS
from db.indexes import ensure_indexes

app = FastAPI()

# CORS (important for frontend communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    ensure_indexes()


# Lightweight endpoint for uptime pings — keeps the free-tier instance from
# spinning down, and doesn't touch Mongo so it stays fast even if the DB is slow.
@app.get("/health")
def health():
    return {"status": "ok"}


# include all routers
app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(plan_diet_router, prefix="/api/plan_diet", tags=["plan_diet"])
app.include_router(auth_router, prefix="/api/auth")
app.include_router(profile_router, prefix="/api/profile")
app.include_router(logs_router, prefix="/api/logs")
app.include_router(analyze_router, prefix="/api/analyze")
app.include_router(progress_router, prefix="/api/progress")
