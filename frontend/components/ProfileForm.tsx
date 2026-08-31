"use client";

import { useState } from "react";
import { Profile } from "../types";
import { saveProfile } from "../services/api";
import { useApi } from "../hooks/useApi";

export default function ProfileForm() {
  const { callApi, loading } = useApi();
  const [form, setForm] = useState<Profile>({
    name: "",
    age: 0,
    height: 0,
    weight_goal: 0,
    fitness_goal: "mix",
    start_date: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    callApi(() => saveProfile(form));
  };

  return (
    <div>
      <h2>Set Your Profile</h2>
      <form>
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} />

        <label>Age</label>
        <input
          name="age"
          type="number"
          value={form.age}
          onChange={handleChange}
        />

        <label>Height (cm)</label>
        <input
          name="height"
          type="number"
          value={form.height}
          onChange={handleChange}
        />

        <label>Weight Goal (kg)</label>
        <input
          name="weight_goal"
          type="number"
          value={form.weight_goal}
          onChange={handleChange}
        />

        <label>Fitness Goal</label>
        <select name="fitness_goal" onChange={handleChange}>
          <option value="mix">Mix</option>
          <option value="weight_loss">Weight Loss</option>
          <option value="strength">Strength</option>
        </select>

        <label>Start Date</label>
        <input
          name="start_date"
          type="date"
          value={form.start_date}
          onChange={handleChange}
        />

        <button type="button" onClick={handleSubmit} disabled={loading}>
          Save Profile
        </button>
      </form>
    </div>
  );
}
