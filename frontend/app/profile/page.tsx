"use client";

import { useEffect, useState } from "react";
import { saveProfile, fetchProfile } from "../../services/api";
import { useRouter } from "next/navigation";
import Toast from "../../components/Toast"; // toast component we will use
import ProtectedPage from "../../components/Protected";
import { getErrorMessage } from "../../utils/errors";

const emptyForm = {
  name: "",
  age: 0,
  height: 0,
  current_weight: 0,
  weight_goal: 0,
  fitness_goal: "mix",
  training_preference: "",
  start_date: "",
};

// Mirrors the backend's Profile validation (api/routers/profile.py) so the
// browser blocks obviously-invalid values before a round trip.
const LIMITS = {
  age: { min: 10, max: 100 },
  height: { min: 50, max: 250 },
  weight: { min: 20, max: 300 },
};
const MIN_START_DATE = "2000-01-01";
const MAX_START_DATE = new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

export default function ProfilePage() {
  return (
    <ProtectedPage>
      <ProfileForm />
    </ProtectedPage>
  );
}

function ProfileForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);

  // Load whatever profile is already saved so the form is editable, not
  // blank, every time the user comes back to this page.
  useEffect(() => {
    const loadExisting = async () => {
      try {
        const res = await fetchProfile();
        const p = res.data || {};
        setForm({
          name: p.name ?? emptyForm.name,
          age: p.age ?? emptyForm.age,
          height: p.height ?? emptyForm.height,
          current_weight: p.current_weight ?? emptyForm.current_weight,
          weight_goal: p.weight_goal ?? emptyForm.weight_goal,
          fitness_goal: p.fitness_goal ?? emptyForm.fitness_goal,
          training_preference: p.training_preference ?? emptyForm.training_preference,
          start_date: p.start_date ?? emptyForm.start_date,
        });
      } catch (err: any) {
        // 404 just means this user hasn't created a profile yet — that's
        // the normal new-user case, not an error.
        if (err.response?.status !== 404) {
          console.error("Failed to load existing profile:", err);
        }
      } finally {
        setInitialLoading(false);
      }
    };
    loadExisting();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Saving the profile already generates and saves the initial plan on
      // the backend (see api/routers/profile.py) — no second request needed.
      await saveProfile(form);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push("/plan");
      }, 1200);
    } catch (err: any) {
      // A response means the server validated the request and rejected it
      // (e.g. an out-of-range value) — show that reason specifically.
      // No response means the request never completed (cold start/timeout).
      setError(
        err.response
          ? getErrorMessage(err, "Couldn't save your profile.")
          : "Couldn't save your profile. The server may be waking up from idle — please try again in a few seconds."
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-purple-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const isEditing = !!form.name;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 page-transition">
      {showToast && <Toast message="Profile saved successfully!" />}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center">
          <span className="text-2xl mr-3">⚠️</span>
          <span>{error}</span>
        </div>
      )}
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-4">
          <span className="text-4xl">👤</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h2>
        <p className="text-gray-600">
          {isEditing
            ? "Update your details any time — your AI plan adapts to changes."
            : "Tell us about yourself to personalize your experience"}
        </p>
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
                min={LIMITS.age.min}
                max={LIMITS.age.max}
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
                min={LIMITS.height.min}
                max={LIMITS.height.max}
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
                min={LIMITS.weight.min}
                max={LIMITS.weight.max}
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
                step="0.1"
                min={LIMITS.weight.min}
                max={LIMITS.weight.max}
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
                min={MIN_START_DATE}
                max={MAX_START_DATE}
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
            {loading ? "Saving..." : isEditing ? "Update Profile & Continue" : "Save Profile & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
