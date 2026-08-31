def test_insert_log_and_fetch():
    from db.crud import create_daily_log, get_all_logs
    create_daily_log({
        "date": "2025-12-25",
        "workout_done": True,
        "duration": 30,
        "weight": 78,
        "mood": 3,
        "notes": ""
    })
    logs = get_all_logs()
    assert isinstance(logs, list)
