"use client";
import ProtectedPage from "../../components/Protected";
import { useProgress } from "../../hooks/useProgress";
import Dashboard from "../../components/Dashboard";
import DecisionCard from "../../components/DecisionCard";

export default function ProgressPage() {
  return (
    <ProtectedPage>
      <ProgressContent />
    </ProtectedPage>
  );
}

function ProgressContent() {
  const { logs, plans, loading, latestDecision, stats } = useProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4 loading-pulse">
            <span className="text-6xl">💪</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading your progress...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4 page-transition">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-4">
            <span className="text-5xl">📊</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Progress</h1>
          <p className="text-xl text-gray-600">Keep up the great work! Here's how you're doing.</p>
        </div>

        {/* Dashboard (Graphs) */}
        <div className="mb-8">
          <Dashboard logs={logs} stats={stats} />
        </div>

        {/* AI Insights Section */}
        {latestDecision && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">AI Insights</h2>
              <span className="text-3xl">🤖</span>
            </div>
            
            {/* We pass the text directly. Since the AI now outputs Markdown/Bullets, 
                DecisionCard should render it cleanly (usually with whitespace-pre-wrap). */}
            <DecisionCard reasoning={latestDecision.reasoning} />
          </div>
        )}

        {/* Empty State (Only shows if there is literally NO data) */}
        {(!logs || logs.length === 0) && !latestDecision && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <span className="text-6xl mb-4 inline-block">🚀</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Your Journey</h3>
            <p className="text-gray-600 mb-6">
              Log your workouts to generate your first AI Analysis!
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="/log"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105"
              >
                Log Workout
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}