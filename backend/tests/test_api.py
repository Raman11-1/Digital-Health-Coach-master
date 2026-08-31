# tests/test_api.py

import pytest # pyright: ignore[reportMissingImports]
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_profile_endpoint():
    response = client.post("/api/profile/", json={
        "name": "TestUser",
        "age": 30,
        "height": 170,
        "weight_goal": 65,
        "fitness_goal": "mix",
        "start_date": "2025-12-30"
    })
    assert response.status_code == 200
    assert response.json()["status"] == "profile saved"

def test_log_endpoint():
    response = client.post("/api/logs/", json={
        "date": "2025-12-30",
        "workout_done": True,
        "duration": 30,
        "weight": 78.0,
        "mood": 4,
        "notes": "Felt good"
    })
    assert response.status_code == 200
    assert response.json()["status"] == "log saved"

def test_analyze_endpoint():
    response = client.post("/api/analyze/")
    assert response.status_code == 200
    data = response.json()
    assert "plan" in data
    assert "reasoning" in data
    assert "motivation" in data

def test_progress_endpoint():
    response = client.get("/api/progress/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data.get("logs"), list)
    assert isinstance(data.get("plans"), list)
    assert isinstance(data.get("decisions"), list)
