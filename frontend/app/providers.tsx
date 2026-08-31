"use client";

import "./globals.css";
import Navbar from "../components/Navbar";
import axios from "axios";
import { getToken } from "../services/auth";

export default function Providers({ children }: { children: React.ReactNode }) {
  // set axios auth header once
  const token = getToken();
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
