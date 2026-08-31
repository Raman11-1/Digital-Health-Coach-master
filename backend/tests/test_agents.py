# tests/test_agents.py

import pytest # pyright: ignore[reportMissingImports]

from core.agents.monitoring import get_monitoring_summary
from core.agents.reasoning import decide_changes
from core.agents.planner import create_plan

# We provide a dummy dataset of logs and patch get_all_logs
from db import crud

def test_monitoring_summary(monkeypatch):
    dummy_logs = [
        {"date": "2025-12-25", "workout_done": True, "duration": 30, "weight": 78, "mood": 4},
        {"date": "2025-12-26", "workout_done": False, "duration": 0, "weight": 78.5, "mood": 2}
    ]

    # Patch the database fetch to return dummy logs
    monkeypatch.setattr(crud, "get_all_logs", lambda: dummy_logs)

    summary = get_monitoring_summary()
    assert "completion_rate" in summary
    assert "mood_trend" in summary
    assert "weight_trend" in summary

def test_decide_changes(monkeypatch):
    summary = {
        "completion_rate": 50,
        "mood_trend": 2,
        "weight_trend": 0.5
    }
    result = decide_changes(summary)
    assert "reasoning_text" in result
    assert "focus" in result

def test_create_plan():
    reasoning = {"focus": "mix"}
    plan = create_plan(reasoning)
    assert isinstance(plan, list)
    assert len(plan) == 7
    assert all("activity" in day for day in plan)
