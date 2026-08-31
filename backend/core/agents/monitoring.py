from db.crud import get_recent_logs_by_user

def get_monitoring_summary(user_id: str):
    logs = get_recent_logs_by_user(user_id)

    if not logs:
        return {
            "completion_rate": 0,
            "mood_trend": 0,
            "weight_trend": 0
        }

    total = len(logs)
    completed = sum(1 for l in logs if l.get("workout_done"))
    completion_rate = int((completed / total) * 100)

    moods = [l.get("mood", 3) for l in logs]
    mood_trend = round(sum(moods) / len(moods), 2)

    weights = [l.get("weight") for l in logs if l.get("weight") is not None]
    weight_trend = 0
    if len(weights) > 1:
        weight_trend = round(weights[-1] - weights[0], 2)

    return {
        "completion_rate": completion_rate,
        "mood_trend": mood_trend,
        "weight_trend": weight_trend
    }
