import { useState } from "react";
import type { UpdateUserProfileRequest } from "@/services/auth";
import { useAuthSession } from "./use-auth-session";

export function useUserMenuController() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const session = useAuthSession();

  const handleUserClick = () => {
    if (!session.isLoggedIn || !session.user) {
      setIsLoginOpen(true);
      setIsAccountMenuOpen(false);
      return;
    }

    setIsAccountMenuOpen((open) => !open);
  };

  const handleLogin = async (username: string, password: string) => {
    await session.login(username, password);
    setIsLoginOpen(false);
    setIsAccountMenuOpen(true);
  };

  const handleRequestSignOut = () => {
    setIsAccountMenuOpen(false);
    setIsSignOutConfirmOpen(true);
  };

  const handleOpenSettings = () => {
    setIsAccountMenuOpen(false);
    setIsProfileOpen(true);
  };

  const handleUpdateProfile = async (payload: UpdateUserProfileRequest) => {
    await session.updateProfile(payload);
    setIsProfileOpen(false);
  };

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);

    try {
      await session.logout();
      setIsAccountMenuOpen(false);
      setIsLoginOpen(false);
      setIsSignOutConfirmOpen(false);
    } finally {
      setIsSigningOut(false);
    }
  };

  return {
    error: session.error,
    isAccountMenuOpen,
    isLoginOpen,
    isLoginSubmitting: session.isInitializing || session.isSubmitting,
    isProfileOpen,
    isProfileSubmitting: session.isUpdatingProfile,
    isSignOutConfirmOpen,
    isSigningOut,
    profileError: session.profileError,
    user: session.user,
    handleConfirmSignOut,
    handleLogin,
    handleOpenSettings,
    handleRequestSignOut,
    handleUpdateProfile,
    handleUserClick,
    setIsLoginOpen,
    setIsProfileOpen,
    setIsSignOutConfirmOpen,
  };
}
