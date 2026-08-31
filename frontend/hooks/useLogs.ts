// src/hooks/useLogs.ts
import { useState } from "react";
import { submitLog } from "../services/api";

export const useLogs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLog = async (logData: any) => {
    try {
      setLoading(true);
      setError(null);
      const res = await submitLog(logData);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setLoading(false);
      if (err.response && err.response.data) {
        setError(err.response.data.detail || "Failed to save log");
      } else {
        setError("Failed to save log");
      }
      throw err;
    }
  };

  return { addLog, loading, error };
};
