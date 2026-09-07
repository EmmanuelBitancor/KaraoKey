"use client";

import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";

interface AdminLoginProps {
  passwordInput: string;
  setPasswordInput: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  authError: boolean;
  onLogin: (e: React.FormEvent) => void;
}

export default function AdminLogin({
  passwordInput,
  setPasswordInput,
  showPassword,
  setShowPassword,
  authError,
  onLogin,
}: AdminLoginProps) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "'Ayaha', sans-serif" }}
          >
            Karao<span className="text-[#FF6B00]">KEY</span>
          </Link>
          <p className="text-white/50 mt-2">Admin Portal</p>
        </div>

        {!isSupabaseConfigured() && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 text-sm font-semibold mb-1">Supabase Not Configured</p>
            <p className="text-yellow-400/70 text-xs">
              Please set <code className="bg-yellow-500/20 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="bg-yellow-500/20 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your{" "}
              <code className="bg-yellow-500/20 px-1">.env.local</code> file.
            </p>
          </div>
        )}

        <form onSubmit={onLogin} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter admin password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
              }}
              className="w-full rounded-lg bg-white/10 px-4 py-3 pr-12 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c3.857 3.857 10.132 3.857 13.99 0A10.495 10.495 0 0 0 20.031 12m-16.053 0a10.477 10.477 0 0 0 2.046-2.777M3.98 15.774a10.477 10.477 0 0 0 2.046 2.777m16.053 0a10.477 10.477 0 0 0-2.046-2.777M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              )}
            </button>
          </div>
          {authError && (
            <p className="text-red-500 text-sm mt-2">
              Incorrect password. Try again.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold py-3 rounded-lg transition"
          >
            Login
          </button>
        </form>

        <p className="text-white/30 text-xs text-center mt-6">
          Contact your administrator for access
        </p>
      </div>
    </div>
  );
}
