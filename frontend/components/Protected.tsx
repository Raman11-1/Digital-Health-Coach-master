"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getToken } from "../services/auth";

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
    }
  }, []);

  return <>{children}</>;
}
