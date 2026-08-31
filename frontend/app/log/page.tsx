"use client";

import { useState } from "react";
import { useLogs } from "../../hooks/useLogs"; // new hook
import { useRouter } from "next/navigation";

export default function LogForm() {
  const { addLog, loading, error } = useLogs();
  const router = useRouter();

  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [weight, setWeight] = useState<number>(0);
  const [mood, setMood] = useState<number>(3);
  const [notes, setNotes] = useState<string>("");

  // multiple activities
  const [activities, setActivities] = useState([
    { type: "", duration: 0, intensity: 0 },
  ]);
  const [success, setSuccess] = useState(false);

  const moodEmojis = ["😢", "😕", "😐", "🙂", "😄"];

  const handleActivityChange = (index: number, field: string, val: any) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: val };
    setActivities(updated);
  };

  const addActivityRow = () => {
    setActivities([...activities, { type: "", duration: 0, intensity: 0 }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addLog({
        date: logDate,
        weight,
        mood,
        activities,
        notes,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // reset
        setLogDate(new Date().toISOString().split("T")[0]);
        setWeight(0);
        setMood(3);
        setNotes("");
        setActivities([{ type: "", duration: 0, intensity: 0 }]);
      }, 2000);
    } catch (err) {
      // error message comes from hook
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 page-transition">
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-4">
          <span className="text-4xl">📝</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Daily Log</h2>
        <p className="text-gray-600">Track your progress and stay motivated</p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg flex items-center card-transition">
          <span className="text-2xl mr-3">✅</span>
          <span>Log saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center card-transition">
          <span className="text-2xl mr-3">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* DATE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* ACTIVITIES */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activities
            </label>
            {activities.map((act, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Activity Type */}
                <select
                  value={act.type}
                  onChange={(e) => handleActivityChange(idx, "type", e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Activity</option>
                  <option value="running">Running</option>
                  <option value="cycling">Cycling</option>
                  <option value="swimming">Swimming</option>
                  <option value="walking">Walking</option>
                  <option value="gym">Gym</option>
                  <option value="yoga">Yoga</option>
                </select>

                {/* Duration */}
                <input
                  type="number"
                  placeholder="Duration (min)"
                  value={act.duration || ""}
                  onChange={(e) => handleActivityChange(idx, "duration", Number(e.target.value))}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />

                {/* Intensity */}
                <input
                  type="number"
                  placeholder="Intensity"
                  value={act.intensity || ""}
                  onChange={(e) => handleActivityChange(idx, "intensity", Number(e.target.value))}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addActivityRow}
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              + Add Another Activity
            </button>
          </div>

          {/* WEIGHT & MOOD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight || ""}
                onChange={(e) => setWeight(Number(e.target.value))}
                required
                placeholder="70.5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Mood (1-5)
              </label>
              <div className="flex justify-between items-center">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="mood"
                      value={value}
                      checked={mood === value}
                      onChange={() => setMood(value)}
                      className="sr-only"
                    />
                    <div
                      className={`text-4xl transition-all transform hover:scale-110 ${
                        mood === value ? "scale-125" : "opacity-50"
                      }`}
                    >
                      {moodEmojis[value - 1]}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* NOTES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="How did you feel today? Any observations?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "Saving..." : "Save Log Entry"}
          </button>
        </form>
      </div>

      {/* NAV TO ANALYZE */}
      <div className="mt-6 text-center">
        <button
          onClick={() => router.push("/analyze")}
          className="text-purple-600 hover:text-purple-700 font-semibold"
        >
          Ready to analyze your progress? →
        </button>
      </div>
    </div>
  );
}
