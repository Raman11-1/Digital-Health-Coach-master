from db.connection import db

users = db["users"]         # auth
profiles = db["profiles"]   # user profiles
logs = db["daily_logs"]
plans = db["weekly_plans"]
decisions = db["decisions"]
