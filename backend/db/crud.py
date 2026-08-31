from db.collections import users, logs, plans, decisions, profiles
from datetime import datetime

# ---------- USERS (Auth) ----------

def find_user(email: str):
    return users.find_one({"email": email})

def create_user(user: dict):
    return users.insert_one(user)

# ---------- PROFILES ----------

def upsert_user_profile(profile: dict):
    # create or update profile by user_id
    return profiles.update_one(
        {"user_id": profile["user_id"]},
        {"$set": profile},
        upsert=True
    )

def get_profile_by_user(user_id):
    prof = profiles.find_one({"user_id": user_id})
    return sanitize_doc(prof)

# ---------- LOGS ----------

def create_daily_log(log: dict):
    return logs.insert_one(log)

def get_logs_by_user(user_id: str):
    return list(logs.find({"user_id": user_id}))

def get_recent_logs_by_user(user_id: str):
    raw_logs = list(logs.find({"user_id": user_id}))
    clean_logs = []
    for log in raw_logs:
        log["id"] = str(log["_id"])
        log.pop("_id", None)
        clean_logs.append(log)
    return clean_logs

def get_log_for_date(user_id: str, date: str):
    return logs.find_one({"user_id": user_id, "date": date})

def update_daily_log(user_id: str, date: str, data: dict):
    return logs.update_one(
        {"user_id": user_id, "date": date},
        {"$set": data}
    )

# ---------- PLANS ----------

def save_plan(plan: dict):
    """
    Saves the plan. 
    FIX: Uses replace_one with upsert=True to overwrite the user's existing plan 
    instead of creating duplicates.
    """
    return plans.replace_one(
        {"user_id": plan["user_id"]},  # 1. Look for a plan with this user_id
        plan,                          # 2. Replace it with the new data
        upsert=True                    # 3. If it doesn't exist, create it
    )

def get_plans_by_user(user_id: str):
    raw_plans = list(plans.find({"user_id": user_id}))
    clean_plans = []
    for plan in raw_plans:
        plan["id"] = str(plan["_id"])
        plan.pop("_id", None)
        clean_plans.append(plan)
    return clean_plans

def get_latest_plan_by_user(user_id: str):
    doc = plans.find_one({"user_id": user_id}, sort=[("_id", -1)])
    if doc:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
    return doc

# ---------- DECISIONS (AI Reasoning) ----------

def save_decision(decision: dict):
    return decisions.insert_one(decision)

def get_decisions_by_user(user_id: str):
    raw_decisions = list(decisions.find({"user_id": user_id}))
    clean_decisions = []
    for dec in raw_decisions:
        dec["id"] = str(dec["_id"])
        dec.pop("_id", None)
        clean_decisions.append(dec)
    return clean_decisions

# Sanitizer

def sanitize_doc(doc: dict):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc
