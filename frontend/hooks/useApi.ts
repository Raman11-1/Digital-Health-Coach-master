import { useState } from "react";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  // The raw error from the last failed call, so callers can extract a
  // specific message (e.g. via getErrorMessage) instead of a generic one.
  const [error, setError] = useState<any>(null);

  const callApi = async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn();
      setLoading(false);
      return res;
    } catch (err) {
      console.error("API call failed:", err);
      setError(err);
      setLoading(false);
      return null;
    }
  };

  return { callApi, loading, error };
};
