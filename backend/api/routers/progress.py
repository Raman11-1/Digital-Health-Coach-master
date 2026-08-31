from fastapi import APIRouter, Depends
from core.auth import get_current_user
from db.crud import (
    get_logs_by_user,
    get_plans_by_user,
    get_decisions_by_user
)

router = APIRouter()

def sanitize_doc(doc: dict):
    """
    Convert Mongo ObjectId fields to string and remove _id.
    """
    if not doc:
        return doc
    doc["id"] = str(doc.get("_id"))
    doc.pop("_id", None)
    return doc

@router.get("/")
def get_progress(user=Depends(get_current_user)):
    uid = user["id"]

    # READ LOGS
    raw_logs = get_logs_by_user(uid)
    logs_data = []
    for log in raw_logs:
        log = sanitize_doc(log)
        # sanitize nested activities only if needed (dicts only)
        log["activities"] = [
            act if not isinstance(act, dict) else act
            for act in log.get("activities", [])
        ]
        logs_data.append(log)

    # STATS
    # count days with any activities
    total_days = len({log["date"] for log in logs_data})

    # workouts = total number of *activities* logged
    workout_count = sum(len(log.get("activities", [])) for log in logs_data)

    # average duration = sum of all activity durations / total count
    durations = [
        act["duration"]
        for log in logs_data
        for act in log.get("activities", [])
    ]
    avg_duration = int(sum(durations) / len(durations)) if durations else 0

    # average mood (unchanged)
    moods = [log["mood"] for log in logs_data if "mood" in log]
    avg_mood = round(sum(moods) / len(moods), 1) if moods else 0

    stats = {
        "total_days": total_days,
        "workout_count": workout_count,
        "avg_duration": avg_duration,
        "avg_mood": avg_mood,
    }

    # PLANS
    raw_plans = get_plans_by_user(uid)
    plans_data = []
    for plan in raw_plans:
        plan = sanitize_doc(plan)
        plans_data.append(plan)

    # DECISIONS
    raw_decisions = get_decisions_by_user(uid)
    decisions_data = []
    for dec in raw_decisions:
        dec = sanitize_doc(dec)
        decisions_data.append(dec)

    latest_decision = decisions_data[-1] if decisions_data else None

    return {
        "logs": logs_data,
        "plans": plans_data,
        "stats": stats,
        "latest_decision": latest_decision,
    }
