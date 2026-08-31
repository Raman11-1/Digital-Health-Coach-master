"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "../../components/Protected";
import { useRouter } from "next/navigation";
import { fetchPlanDiet } from "../../services/api";

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

  const router = useRouter();

  useEffect(() => {
    const getPlan = async () => {
      try {
        const res = await fetchPlanDiet();
        const data = res.data || {};
        console.log("Plan Data:", data);

        // 1. Handle Workout
        if (data.plan && Array.isArray(data.plan)) {
          setWorkoutPlan(data.plan);
        }

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
        }
      } catch (err) {
        console.error("Failed to fetch plan", err);
      } finally {
        setLoading(false);
      }
    };

    getPlan();
  }, []);

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
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Your Weekly Plan & Diet
        </h1>

        {/* --- Workout Section --- */}
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

        {/* --- Diet Section (Fixed Display) --- */}
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

        <button
          onClick={() => router.push("/log")}
          className="block mx-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-8 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          Continue to Log
        </button>
      </div>
    </ProtectedPage>
  );
}