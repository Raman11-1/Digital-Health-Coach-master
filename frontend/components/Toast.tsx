"use client";
import { useEffect, useState } from "react";

export default function Toast({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
      {message}
    </div>
  );
}
