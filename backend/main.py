from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers.auth import router as auth_router
from api.routers.profile import router as profile_router
from api.routers.logs import router as logs_router
from api.routers.analyze import router as analyze_router
from api.routers.progress import router as progress_router
from api.routers.plan_diet import router as plan_diet_router
from api.routers.users import router as users_router

app = FastAPI()

# CORS (important for frontend communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include all routers
app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(plan_diet_router, prefix="/api/plan_diet", tags=["plan_diet"])
app.include_router(auth_router, prefix="/api/auth")
app.include_router(profile_router, prefix="/api/profile")
app.include_router(logs_router, prefix="/api/logs")
app.include_router(analyze_router, prefix="/api/analyze")
app.include_router(progress_router, prefix="/api/progress")
