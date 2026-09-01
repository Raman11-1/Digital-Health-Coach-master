from db.collections import users, logs, plans, decisions, profiles


def ensure_indexes():
    """
    Create indexes used by db/crud.py lookups. Safe to call on every startup —
    Mongo no-ops if an equivalent index already exists.
    """
    users.create_index("email", unique=True)
    profiles.create_index("user_id", unique=True)
    logs.create_index([("user_id", 1), ("date", 1)])
    plans.create_index("user_id")
    decisions.create_index("user_id")
