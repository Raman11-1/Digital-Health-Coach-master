"use client";

import { useApi } from "../../hooks/useApi";
import { analyze } from "../../services/api";
import { useRouter } from "next/navigation";
import ProtectedPage from "../../components/Protected";
import { useState } from "react";

export default function AnalyzePage() {
  return (
    <ProtectedPage>
      <AnalyzeContent />
    </ProtectedPage>
  );
}

function AnalyzeContent() {
  const { callApi, loading } = useApi();
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);

 const handleAnalyze = async () => {
  setAnalyzing(true);
  const res = await callApi(analyze);

  // example: store the returned name if you want
 if (res) {
  const userName = res.data.user?.name;
  console.log("User name:", userName);
}

  setTimeout(() => {
    setAnalyzing(false);
    router.push("/progress");
  }, 1000);
};


  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4 page-transition">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-6 animate-pulse">
            <span className="text-6xl">🤖</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">AI Analysis</h2>
          <p className="text-xl text-gray-600">
            Let our AI coach analyze your progress and create a personalized plan
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="space-y-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Data Analysis</h3>
                <p className="text-gray-600">Review your workout logs and progress metrics</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Goal Assessment</h3>
                <p className="text-gray-600">Evaluate progress toward your fitness goals</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Plan Generation</h3>
                <p className="text-gray-600">Create a customized weekly workout plan</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || analyzing}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading || analyzing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="text-2xl mr-2">✨</span>
                Start AI Analysis
              </span>
            )}
          </button>

          {(loading || analyzing) && (
            <div className="mt-6 text-center text-gray-600 animate-pulse">
              Our AI is working its magic... This may take a moment
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>💡 Tip: Make sure you've logged at least a few days of data for better insights</p>
        </div>
      </div>
    </div>
  );
}