"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Log } from "../types";

type DashboardProps = {
  logs: Log[];
  stats: {
    total_days: number;
    workout_count: number;
    avg_duration: number;
    avg_mood: number;
  } | null;
};

export default function Dashboard({ logs, stats }: DashboardProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <span className="text-6xl mb-4 inline-block">📊</span>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Yet</h3>
        <p className="text-gray-600">Start logging your workouts to see your progress here!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 card-transition">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Weight Progress</h3>
        <span className="text-3xl">📈</span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={logs}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ fill: '#8b5cf6', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="📅"
          label="Total Days"
          value={stats?.total_days ?? 0}
        />
        <StatCard
          icon="💪"
          label="Workouts"
          value={stats?.workout_count ?? 0}
        />
        <StatCard
          icon="⏱️"
          label="Avg Duration"
          value={`${stats?.avg_duration ?? 0}m`}
        />
        <StatCard
          icon="😊"
          label="Avg Mood"
          value={`${stats?.avg_mood ?? 0}/5`}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
}
