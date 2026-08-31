"use client";
import { PlanItem } from "../types";

export default function PlanCard({ day, activity }: PlanItem) {
  const dayIcons: { [key: string]: string } = {
    Monday: "1️⃣",
    Tuesday: "2️⃣",
    Wednesday: "3️⃣",
    Thursday: "4️⃣",
    Friday: "5️⃣",
    Saturday: "6️⃣",
    Sunday: "7️⃣",
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all transform hover:scale-105 border border-purple-100 card-transition">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
          {dayIcons[day] || "📅"}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{day}</h4>
          <p className="text-gray-600 leading-relaxed">{activity}</p>
        </div>
        <div className="flex-shrink-0">
          <span className="text-2xl">💪</span>
        </div>
      </div>
    </div>
  );
}