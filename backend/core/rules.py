def detect_inconsistency(completion_rate: float) -> bool:
    return completion_rate < 60

def detect_burnout(mood_trend: float) -> bool:
    return mood_trend < 2
