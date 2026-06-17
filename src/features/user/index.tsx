"use client";

import { useState } from "react";

import { useAuthSession } from "@/features/user/hooks/use-auth-session";
import { LoginDialog } from "@/features/user/components/login-dialog";
import { SignOutConfirmDialog } from "@/features/user/components/sign-out-confirm-dialog";
import { UserAccountPopover } from "@/features/user/components/user-account-popover";
import { UserMenuButton } from "@/features/user/components/user-menu-button";
import { UserProfileDialog } from "@/features/user/components/user-profile-dialog";
import type { UpdateUserProfileRequest } from "@/services/auth";

const User = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const {
    user,
    error,
    profileError,
    isInitializing,
    isLoggedIn,
    isSubmitting,
    isUpdatingProfile,
    login,
    logout,
    updateProfile
  } = useAuthSession();

  const handleUserClick = () => {
    if (!isLoggedIn || !user) {
      setIsLoginOpen(true);
      setIsAccountMenuOpen(false);
      return;
    }

    setIsAccountMenuOpen((open) => !open);
  };

  const handleLogin = async (username: string, password: string) => {
    await login(username, password);
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
    await updateProfile(payload);
    setIsProfileOpen(false);
  };

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);

    try {
      await logout();
      setIsAccountMenuOpen(false);
      setIsLoginOpen(false);
      setIsSignOutConfirmOpen(false);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="absolute bottom-3 left-3">
      {user ? (
        <UserAccountPopover
          open={isAccountMenuOpen}
          user={user}
          onOpenSettings={handleOpenSettings}
          onSignOut={handleRequestSignOut}
        />
      ) : null}
      <UserMenuButton onClick={handleUserClick} />
      <LoginDialog
        error={error}
        isSubmitting={isInitializing || isSubmitting}
        open={isLoginOpen}
        onLogin={handleLogin}
        onOpenChange={setIsLoginOpen}
      />
      <SignOutConfirmDialog
        open={isSignOutConfirmOpen}
        isSubmitting={isSigningOut}
        onConfirm={handleConfirmSignOut}
        onOpenChange={setIsSignOutConfirmOpen}
      />
      <UserProfileDialog
        open={isProfileOpen}
        user={user}
        error={profileError}
        isSubmitting={isUpdatingProfile}
        onSubmit={handleUpdateProfile}
        onOpenChange={setIsProfileOpen}
      />
    </div>
  );
};

export default User;
