"use client";

import { useState } from "react";
import { login, fetchProfile } from "../../services/api";
import { setToken, clearToken } from "../../services/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Login and get token
      const res = await login(form);
      const token = res.data.access_token;

      // 2. Save token
      setToken(token);

      // 3. Set axios default header for future calls
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 4. Try to get profile from backend
      try {
        const profileRes = await fetchProfile();

        // If profile exists and has required fields → go to plan
        const profile = profileRes.data;
        if (
          profile &&
          profile.name &&
          profile.current_weight !== undefined &&
          profile.training_preference
        ) {
          router.push("/plan");
        } else {
          // Profile exists but missing fields → send to profile
          router.push("/profile");
        }
      } catch (profileErr: any) {
        // If 404 or profile not found → send to profile
        if (profileErr.response?.status === 404) {
          router.push("/profile");
        } else {
          // Other errors: clear token + show error
          clearToken();
          setError("Error checking profile. Try logging in again.");
        }
      }
    } catch (loginErr: any) {
      clearToken(); // ensure no token left
      setError(
        loginErr.response?.data?.detail || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center pb-4">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{" "}
          <Link href="/signup" className="text-purple-600 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
