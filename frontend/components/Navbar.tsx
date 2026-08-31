"use client";

import Link from "next/link";
import { getToken, clearToken } from "../services/auth";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setToken(getToken());
  }, [pathname]);

  const logout = () => {
    clearToken();
    setToken(null);
    router.push("/login");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={token ? "/log" : "/login"} className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">💪</span>
              </div>
              <span className="text-white text-xl font-bold hidden sm:block">
                AI Fitness Coach
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {token ? (
              <>
                <NavLink href="/profile" isActive={isActive("/profile")}>
                  <span className="text-lg mr-1">👤</span>
                  Profile
                </NavLink>
                <NavLink href="/plan" isActive={isActive("/plan")}>
                  <span className="text-lg mr-1">📅</span>
                  Weekly Plan
                </NavLink>
                <NavLink href="/log" isActive={isActive("/log")}>
                  <span className="text-lg mr-1">📝</span>
                  Log
                </NavLink>
                <NavLink href="/progress" isActive={isActive("/progress")}>
                  <span className="text-lg mr-1">📊</span>
                  Progress
                </NavLink>
                <NavLink href="/analyze" isActive={isActive("/analyze")}>
                  <span className="text-lg mr-1">🤖</span>
                  Analyze
                </NavLink>
                <button
                  onClick={logout}
                  className="ml-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink href="/login" isActive={isActive("/login")}>
                  Login
                </NavLink>
                <NavLink href="/signup" isActive={isActive("/signup")}>
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ 
  href, 
  children, 
  isActive 
}: { 
  href: string; 
  children: React.ReactNode; 
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-white text-purple-600 shadow-md"
          : "text-white hover:bg-white/10"
      }`}
    >
      {children}
    </Link>
  );
}