"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AuthError,
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  updateCurrentUser,
  type UpdateUserProfileRequest,
  type UserProfile
} from "@/services/auth";

const ACCESS_TOKEN_KEY = "geo-agent.access-token";

const readStoredToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

const storeToken = (accessToken: string) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};

const removeStoredToken = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const useAuthSession = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const clearSession = useCallback(() => {
    removeStoredToken();
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      const storedToken = readStoredToken();

      if (!storedToken) {
        if (isMounted) {
          setIsInitializing(false);
        }
        return;
      }

      try {
        const nextUser = await getCurrentUser(storedToken);
        if (!isMounted) return;

        setAccessToken(storedToken);
        setUser(nextUser);
      } catch {
        if (!isMounted) return;
        clearSession();
      } finally {
        if (!isMounted) return;
        setIsInitializing(false);
      }
    };

    void initializeSession();

    return () => {
      isMounted = false;
    };
  }, [clearSession]);

  const login = useCallback(async (username: string, password: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const session = await loginRequest({ username, password });
      storeToken(session.accessToken);
      setAccessToken(session.accessToken);
      setUser(session.user);
      setProfileError(null);
      return session.user;
    } catch (loginError) {
      const message =
        loginError instanceof Error ? loginError.message : "登录失败，请重试。";
      setError(message);
      throw loginError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const token = accessToken ?? readStoredToken();

    if (token) {
      try {
        await logoutRequest(token);
      } catch {
        // 本地会话仍需清理，服务端 401 代表 token 已不可用。
      }
    }

    clearSession();
    setError(null);
    setProfileError(null);
  }, [accessToken, clearSession]);

  const updateProfile = useCallback(
    async (payload: UpdateUserProfileRequest) => {
      const token = accessToken ?? readStoredToken();

      if (!token) {
        clearSession();
        const message = "登录已失效，请重新登录。";
        setProfileError(message);
        throw new Error(message);
      }

      setIsUpdatingProfile(true);
      setProfileError(null);

      try {
        const nextUser = await updateCurrentUser(token, payload);
        setAccessToken(token);
        setUser(nextUser);
        return nextUser;
      } catch (profileUpdateError) {
        if (
          profileUpdateError instanceof AuthError &&
          profileUpdateError.status === 401
        ) {
          clearSession();
        }

        const message =
          profileUpdateError instanceof Error
            ? profileUpdateError.message
            : "保存失败，请重试。";
        setProfileError(message);
        throw profileUpdateError;
      } finally {
        setIsUpdatingProfile(false);
      }
    },
    [accessToken, clearSession]
  );

  return useMemo(
    () => ({
      user,
      error,
      profileError,
      isLoggedIn: Boolean(user),
      isInitializing,
      isSubmitting,
      isUpdatingProfile,
      login,
      logout,
      updateProfile
    }),
    [
      error,
      isInitializing,
      isSubmitting,
      isUpdatingProfile,
      login,
      logout,
      profileError,
      updateProfile,
      user
    ]
  );
};
