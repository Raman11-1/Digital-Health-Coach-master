import { useState } from "react";

export const useApi = () => {
  const [loading, setLoading] = useState(false);

  const callApi = async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    try {
      const res = await fn();
      setLoading(false);
      return res;
    } catch (err) {
      console.error("API call failed:", err);
      setLoading(false);
      return null;
    }
  };

  return { callApi, loading };
};
