from typing import Dict, Any
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

from core.llm_client import generate_text
from db.crud import get_logs_by_user, save_decision, get_profile_by_user, save_plan
from core.agents.planner import generate_workout_and_diet

def run_analyze_adapt(user_id: str) -> Dict[str, Any]:
    """
    Full analysis orchestrator:
    - Analyze recent logs
    - Generate reasoning / insights
    - Optionally update user plan if needed
    - Save results
    """

    # 1) Fetch user profile & logs
    profile = get_profile_by_user(user_id)
    logs = get_logs_by_user(user_id)

    if not profile:
        return {"error": "Profile not found"}

    # Convert logs to simple summary text
    log_summary = summarize_logs(logs)

    # 2) Build LLM prompt for reasoning
    prompt = build_reasoning_prompt(profile, log_summary)

    # 3) Reasoning text and workout/diet plan are independent LLM calls —
    # run them concurrently instead of back-to-back to roughly halve latency.
    plan_data = None
    with ThreadPoolExecutor(max_workers=2) as executor:
        reasoning_future = executor.submit(generate_text, prompt)
        plan_future = executor.submit(generate_workout_and_diet, profile)

        reasoning_output = reasoning_future.result()
        try:
            plan_data = plan_future.result()
        except Exception as e:
            print("Plan adaptation failed:", str(e))

    # 4) Save the decision to DB
    decision_doc = {
        "user_id": user_id,
        "reasoning": reasoning_output,
        "created_at": datetime.utcnow().isoformat(),
    }
    save_decision(decision_doc)

    if plan_data is not None:
        save_plan({"user_id": user_id, "plan": plan_data})

    return {
        "reasoning": reasoning_output,
        "plan": plan_data,
    }


def build_reasoning_prompt(profile: Dict[str, Any], log_summary: str) -> str:
    """
    Build a prompt to send to the LLM for reasoning/insights.
    """
    return f"""
You are a high-performance AI fitness coach.

User Profile:
- Name: {profile.get("name")}
- Current Weight: {profile.get("current_weight")}
- Weight Goal: {profile.get("weight_goal")}
- Goal: {profile.get("fitness_goal")}

Recent logs summary:
{log_summary}

Task: Provide a concise progress analysis.
Format:
- Use bullet points ONLY.
- NO "Dear User" or letter introductions.
- Keep it strict, motivating, and actionable.

Structure your response as:
1. 📊 **Progress Check:** (1-2 bullets on weight/consistency)
2. 💡 **Insight:** (What went well vs what needs work)
3. 🚀 **Next Steps:** (Specific advice for the next week)
"""


def summarize_logs(logs: list) -> str:
    """
    Build a simple text summary of logs for use in the LLM prompt.
    """
    if not logs:
        return "No logs available yet."

    lines = []
    for log in logs[-7:]:
        date = log.get("date")
        weight = log.get("weight")
        mood = log.get("mood")
        workout_done = log.get("workout_done")
        lines.append(
            f"Date: {date}, Workout Done: {workout_done}, Weight: {weight}, Mood: {mood}."
        )

    return "\n".join(lines)