"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getToken, clearToken } from "../services/auth";
import { fetchCurrentUser, fetchProfile } from "../services/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      const token = getToken();

      // If no token at all → go to signup
      if (!token) {
        router.push("/signup");
        return;
      }

      try {
        // 1️⃣ Confirm token is valid with backend
        await fetchCurrentUser();

        // 2️⃣ Check if profile exists
        const profileRes = await fetchProfile();
        const profile = profileRes.data;

        // If profile is missing any required field → profile page
        if (
          !profile ||
          !profile.name ||
          !profile.current_weight ||
          !profile.training_preference
        ) {
          router.push("/profile");
        } else {
          // If profile exists → plan page
          router.push("/plan");
        }
      } catch (err) {
        // Anything failed: token invalid or backend error → logout & signup
        clearToken();
        router.push("/signup");
      }
    };

    checkStatus();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-purple-50 to-indigo-100">
      <svg className="animate-spin h-10 w-10 text-purple-600" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-gray-600">
        Loading your dashboard... if this is your first visit in a while, the server may take a few seconds to wake up.
      </p>
    </div>
  );
}
