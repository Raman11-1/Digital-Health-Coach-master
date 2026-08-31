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

  return null;
}
