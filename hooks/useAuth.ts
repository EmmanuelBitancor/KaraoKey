"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface UseAuthOptions {
  onAuthSuccess?: () => void;
}

export function useAuth(options: UseAuthOptions = {}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const prevAuthRef = useRef<{ storedAuth: string | null }>({
    storedAuth: null,
  });
  const hasRestoredAuth = useRef(false);

  const checkAuth = useCallback(async () => {
    if (hasRestoredAuth.current) return;

    const storedAuth = sessionStorage.getItem("karaokey-admin-auth");
    if (storedAuth !== prevAuthRef.current.storedAuth) {
      prevAuthRef.current = { storedAuth };
    }

    if (storedAuth === "true") {
      hasRestoredAuth.current = true;
      setIsAuthenticated(true);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "")) {
      setIsAuthenticated(true);
      setAuthError(false);
      setPasswordInput("");
      sessionStorage.setItem("karaokey-admin-auth", "true");
      options.onAuthSuccess?.();
    } else {
      setAuthError(true);
    }
  }, [passwordInput, options]);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("karaokey-admin-auth");
  }, []);

  return {
    isAuthenticated,
    mounted,
    authError,
    passwordInput,
    showPassword,
    setPasswordInput,
    setShowPassword,
    handleLogin,
    handleLogout,
  };
}
