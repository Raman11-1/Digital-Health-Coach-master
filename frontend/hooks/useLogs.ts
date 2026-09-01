// src/hooks/useLogs.ts
import { useState } from "react";
import { submitLog } from "../services/api";
import { getErrorMessage } from "../utils/errors";

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
      setError(getErrorMessage(err, "Failed to save log"));
      throw err;
    }
  };

  return { addLog, loading, error };
};
