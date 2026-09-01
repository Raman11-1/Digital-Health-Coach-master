"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "../../components/Protected";
import { useRouter } from "next/navigation";
import { fetchPlanDiet, regeneratePlanDiet } from "../../services/api";

// --- Interfaces ---
interface Exercise {
  name?: string;
  sets?: string | number;
  reps?: string | number;
  duration?: string | number;
  [key: string]: any;
}

interface WorkoutDay {
  day: string;
  exercise?: Exercise[] | string;
  exercises?: Exercise[] | string;
  activity?: string;
}

export default function PlanDietPage() {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([]);
  const [dietObject, setDietObject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState("");

  const router = useRouter();

  const loadPlan = async () => {
    const res = await fetchPlanDiet();
    const data = res.data || {};

    // 1. Handle Workout
    setWorkoutPlan(Array.isArray(data.plan) ? data.plan : []);

    // 2. Handle Diet
    if (data.diet && typeof data.diet === 'object' && Object.keys(data.diet).length > 0) {
      setDietObject(data.diet);
    } else if (data.diet_text) {
      try {
        // Try parsing text as JSON, otherwise use as note
        const parsed = JSON.parse(data.diet_text);
        setDietObject(typeof parsed === 'object' ? parsed : { "notes": data.diet_text });
      } catch {
        setDietObject({ "notes": data.diet_text });
      }
    } else {
      setDietObject(null);
    }
  };

  useEffect(() => {
    loadPlan()
      .catch((err) => console.error("Failed to fetch plan", err))
      .finally(() => setLoading(false));
  }, []);

  // A plan the AI failed to generate looks like real data (no error status),
  // but has no workout days — treat that as "not really a plan" so users get
  // a way to retry instead of a permanently broken page.
  const hasRealPlan = workoutPlan.length > 0;

  const handleRegenerate = async () => {
    setRegenerating(true);
    setRegenError("");
    try {
      await regeneratePlanDiet();
      await loadPlan();
    } catch (err) {
      console.error("Failed to regenerate plan", err);
      setRegenError(
        "Couldn't generate your plan right now — the AI service may be busy or the server is waking up. Please try again in a moment."
      );
    } finally {
      setRegenerating(false);
    }
  };

  // --- HELPER: Smart Rendering for Diet Items ---
  const renderDietItem = (item: any) => {
    // Case 1: The structure seen in your image { "meal": "Breakfast", "foods": [...] }
    if (typeof item === 'object' && item.meal) {
      const foodText = Array.isArray(item.foods) ? item.foods.join(", ") : item.foods;
      return (
        <span>
          <strong className="text-indigo-700">{item.meal}:</strong> <span className="text-gray-700">{foodText}</span>
        </span>
      );
    }
    
    // Case 2: Object with 'food' key { "food": "Chicken", "calories": 300 }
    if (typeof item === 'object' && item.food) {
      return (
        <span>
          <span className="font-medium text-gray-800">{item.food}</span>
          {item.calories && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{item.calories} kcal</span>}
        </span>
      );
    }

    // Case 3: Simple String
    return <span className="text-gray-700">{String(item)}</span>;
  };

  // --- HELPER: Render Macros specifically ---
  const renderMacros = (macrosObj: any) => {
    return (
      <div className="flex flex-wrap gap-4 mt-2">
        {Object.entries(macrosObj).map(([k, v], i) => (
          <div key={i} className="bg-purple-50 px-3 py-2 rounded-lg text-sm border border-purple-100">
            <span className="capitalize font-semibold text-purple-700">{k}:</span> {String(v)}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <ProtectedPage>
        <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-gray-700">
          Loading Plan...
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 px-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl font-bold text-center sm:text-left text-gray-900">
            Your Weekly Plan & Diet
          </h1>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="whitespace-nowrap bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-5 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {regenerating ? "Generating..." : hasRealPlan ? "🔄 Regenerate Plan" : "✨ Generate My Plan"}
          </button>
        </div>

        {regenError && (
          <div className="max-w-5xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <span>{regenError}</span>
          </div>
        )}

        {!hasRealPlan && !regenerating && (
          <div className="max-w-5xl mx-auto mb-8 bg-white rounded-2xl shadow-xl p-10 text-center">
            <span className="text-5xl mb-4 inline-block">🤖</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No plan yet</h2>
            <p className="text-gray-600">
              Click <strong>Generate My Plan</strong> above and our AI coach will build a 7-day
              workout and diet plan based on the goals from your profile.
            </p>
          </div>
        )}

        {regenerating && (
          <div className="max-w-5xl mx-auto mb-8 bg-white rounded-2xl shadow-xl p-10 text-center">
            <svg className="animate-spin h-8 w-8 text-purple-600 mx-auto mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-600">Our AI coach is building your plan... this can take up to 30 seconds.</p>
          </div>
        )}

        {/* --- Workout Section --- */}
        {hasRealPlan && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Weekly Workout Plan</h2>
          {workoutPlan.length > 0 ? (
            <div className="space-y-6">
              {workoutPlan.map((dayPlan, idx) => {
                const exercisesData = dayPlan.exercise || dayPlan.exercises || dayPlan.activity;
                return (
                  <div key={idx} className="border-b border-gray-100 pb-4 last:border-0">
                    <h3 className="text-xl font-bold text-purple-700 mb-2">{dayPlan.day}</h3>
                    <div className="pl-4">
                      {Array.isArray(exercisesData) ? (
                        <ul className="list-disc space-y-1 text-gray-700">
                          {exercisesData.map((ex, i) => (
                            <li key={i}>
                              {typeof ex === 'object' ? (
                                <>
                                  <span className="font-semibold">{ex.name || "Exercise"}</span>
                                  {ex.sets && ex.reps && <span className="text-sm text-gray-500"> - {ex.sets} sets x {ex.reps} reps</span>}
                                  {ex.duration && <span className="text-sm text-gray-500"> - {ex.duration} mins</span>}
                                </>
                              ) : (
                                <span>{String(ex)}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">{String(exercisesData || "Rest / Activity")}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600">No workout plan available.</p>
          )}
        </div>
        )}

        {/* --- Diet Section (Fixed Display) --- */}
        {hasRealPlan && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Diet Recommendation</h2>
          {dietObject ? (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {Object.entries(dietObject).map(([key, val], idx) => (
                <div key={idx} className="bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="capitalize text-lg font-bold text-indigo-600 mb-3 border-b border-gray-200 pb-2">
                    {key.replace(/_/g, " ")}
                  </h3>
                  
                  {/* Logic 1: If it's the Macros object */}
                  {key.toLowerCase().includes('macro') && typeof val === 'object' && !Array.isArray(val) ? (
                    renderMacros(val)
                  ) : 
                  /* Logic 2: If it's a List (Meal Plan) */
                  Array.isArray(val) ? (
                    <ul className="space-y-3">
                      {val.map((item: any, i: number) => (
                        <li key={i} className="text-sm flex items-start">
                          <span className="text-indigo-400 mr-2 mt-1">•</span>
                          {renderDietItem(item)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                  /* Logic 3: Fallback for strings (Calorie Intake) */
                    <p className="text-gray-700 font-medium">
                      {typeof val === 'string' ? val : JSON.stringify(val)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No diet recommendation available.</p>
          )}
        </div>
        )}

        {hasRealPlan && (
        <button
          onClick={() => router.push("/log")}
          className="block mx-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-8 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          Continue to Log
        </button>
        )}
      </div>
    </ProtectedPage>
  );
}