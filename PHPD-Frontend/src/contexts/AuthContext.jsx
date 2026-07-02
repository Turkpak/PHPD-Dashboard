import React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { getAccessToken, clearTokens } from "@/api/client";

const USER_STORAGE_KEY = "safecity_user";
const SESSION_EXPIRES_AT_KEY = "safecity_session_expires_at";
const DEFAULT_SESSION_MS = 60 * 60 * 1000; // 60 minutes (match backend ACCESS_TOKEN_LIFETIME)

/** All localStorage keys used for auth/session — clear every one on logout */
const AUTH_STORAGE_KEYS = [
  "safecity_user",
  "safecity_access_token",
  "safecity_refresh_token",
  "userRole",
  "safecity_session_expires_at",
];

function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e2) {
    return null;
  }
}

function getSessionExpiresAt() {
  const raw = localStorage.getItem(SESSION_EXPIRES_AT_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function isSessionExpired() {
  const token = getAccessToken();
  if (!token) return true;
  const expiresAt = getSessionExpiresAt();
  if (!expiresAt) return false; // backwards compatible for existing logins
  return Date.now() >= expiresAt;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    if (typeof window === "undefined") return null;
    const token = getAccessToken();
    if (token && isSessionExpired()) {
      AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      clearTokens();
      return null;
    }
    const stored = getStoredUser();
    if (!token || !stored) return null;
    return stored;
  });

  const setUser = useCallback((u) => {
    setUserState(u);
    if (u) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  const startSession = useCallback((durationMs = DEFAULT_SESSION_MS) => {
    localStorage.setItem(SESSION_EXPIRES_AT_KEY, String(Date.now() + durationMs));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearTokens();
    AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }, [setUser]);

  useEffect(() => {
    const syncAuthState = () => {
      const token = getAccessToken();
      if (!token || isSessionExpired()) {
        setUserState(null);
        clearTokens();
        AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      }
    };

    syncAuthState();

    const onStorage = (e) => {
      if (!e.key) return;
      if (AUTH_STORAGE_KEYS.includes(e.key)) {
        syncAuthState();
      }
    };
    window.addEventListener("storage", onStorage);

    const interval = window.setInterval(syncAuthState, 1000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(interval);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      // Token is the source of truth for API authentication.
      // User details may load slightly later (or be missing in storage during first login).
      isAuthenticated: !!getAccessToken() && !isSessionExpired(),
      setUser,
      startSession,
      logout,
    }),
    [user, setUser, startSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  // In dev (Fast Refresh / HMR), components can temporarily render outside providers.
  // Returning a safe fallback prevents the entire app from crashing.
  if (!ctx) {
    return {
      user: null,
      isAuthenticated: false,
      setUser: () => {},
      startSession: () => {},
      logout: () => {},
    };
  }
  return ctx;
}
