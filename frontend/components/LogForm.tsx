"use client";

import { useState } from "react";
import { Log } from "../types";
import { saveLog } from "../services/api";
import { useApi } from "../hooks/useApi";

export default function LogForm() {
  const { callApi, loading } = useApi();
  const [log, setLog] = useState<Log>({
    date: "",
    workout_done: false,
    duration: 0,
    weight: 0,
    mood: 3,
    notes: "",
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setLog({
      ...log,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = () => {
    callApi(() => saveLog(log));
  };

  return (
    <div>
      <h2>Daily Log</h2>
      <form>
        <label>Date</label>
        <input name="date" type="date" onChange={handleChange} />

        <label>
          <input
            name="workout_done"
            type="checkbox"
            onChange={handleChange}
          />
          Workout Done
        </label>

        <label>Duration (min)</label>
        <input name="duration" type="number" onChange={handleChange} />

        <label>Weight (kg)</label>
        <input name="weight" type="number" onChange={handleChange} />

        <label>Mood (1-5)</label>
        <input name="mood" type="number" min="1" max="5" onChange={handleChange} />

        <label>Notes</label>
        <textarea name="notes" onChange={handleChange} />

        <button type="button" onClick={handleSubmit} disabled={loading}>
          Save Log
        </button>
      </form>
    </div>
  );
}
