"use client";

import { useState } from "react";
import { saveProfile } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { useRouter } from "next/navigation";
import Toast from "../../components/Toast"; // toast component we will use
import axios from "axios";

export default function ProfileForm() {
  const { callApi, loading } = useApi();
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);

  const [form, setForm] = useState({
    name: "",
    age: 0,
    height: 0,
    current_weight: 0,          
    weight_goal: 0,
    fitness_goal: "mix",
    training_preference: "",     
    start_date: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1️⃣ Save profile
      await callApi(() => saveProfile(form));

      // 2️⃣ Show toast
      setShowToast(true);

      // 3️⃣ Call backend to generate plan
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/plan_diet/`
      );

      // 4️⃣ After little delay, redirect to plan page
      setTimeout(() => {
        setShowToast(false);
        router.push("/plan");
      }, 1200);

    } catch (error) {
      console.error("Profile save or plan generation failed:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 page-transition">
      {showToast && <Toast message="Profile saved successfully!" />}
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-4">
          <span className="text-4xl">👤</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h2>
        <p className="text-gray-600">Tell us about yourself to personalize your experience</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                name="age"
                type="number"
                value={form.age || ""}
                onChange={handleChange}
                required
                placeholder="25"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                name="height"
                type="number"
                value={form.height || ""}
                onChange={handleChange}
                required
                placeholder="170"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Current Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Weight (kg)
              </label>
              <input
                name="current_weight"
                type="number"
                step="0.1"
                value={form.current_weight || ""}
                onChange={handleChange}
                required
                placeholder="75.3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Weight Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight Goal (kg)
              </label>
              <input
                name="weight_goal"
                type="number"
                value={form.weight_goal || ""}
                onChange={handleChange}
                required
                placeholder="70"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Fitness Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fitness Goal
              </label>
              <select
                name="fitness_goal"
                value={form.fitness_goal}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="mix">🎯 Mix (Balanced)</option>
                <option value="weight_loss">⚡ Weight Loss</option>
                <option value="strength">💪 Strength Building</option>
              </select>
            </div>

            {/* Training Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Preference
              </label>
              <select
                name="training_preference"
                value={form.training_preference}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="">Select Preference</option>
                <option value="strength">💪 Strength</option>
                <option value="fat_loss">⚡ Fat Loss</option>
                <option value="mixed">🎯 Mix</option>
                <option value="endurance">🏃 Endurance</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                name="start_date"
                type="date"
                value={form.start_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "Saving..." : "Save Profile & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
