from core.agents.monitoring import get_monitoring_summary
from core.rules import detect_inconsistency, detect_burnout
from core.llm_client import generate_text

def decide_changes(summary):
    completion = summary["completion_rate"]
    mood_trend = summary["mood_trend"]

    rules_suggestions = []
    if detect_inconsistency(completion):
        rules_suggestions.append("reduce intensity and simplify plan")
    if detect_burnout(mood_trend):
        rules_suggestions.append("add rest days")

    prompt = f"""
    SYSTEM: You are a fitness coach reasoning agent.
    CONTEXT: {summary}
    RULES: {rules_suggestions}
    Please produce analysis & plan focus.
    """

    reasoning_text = generate_text(prompt)

    focus = "mix"
    if "consistency" in reasoning_text.lower():
        focus = "focus_consistency"

    return {
        "reasoning_text": reasoning_text,
        "focus": focus,
        "rules": rules_suggestions
    }
