"use client";

import { LoginDialog } from "@/features/user/components/login-dialog";
import { SignOutConfirmDialog } from "@/features/user/components/sign-out-confirm-dialog";
import { UserAccountPopover } from "@/features/user/components/user-account-popover";
import { UserMenuButton } from "@/features/user/components/user-menu-button";
import { UserProfileDialog } from "@/features/user/components/user-profile-dialog";
import { useUserMenuController } from "./hooks/use-user-menu-controller";

const User = () => {
  const controller = useUserMenuController();

  return (
    <div className="absolute bottom-3 left-3">
      {controller.user ? (
        <UserAccountPopover
          open={controller.isAccountMenuOpen}
          user={controller.user}
          onOpenSettings={controller.handleOpenSettings}
          onSignOut={controller.handleRequestSignOut}
        />
      ) : null}
      <UserMenuButton onClick={controller.handleUserClick} />
      <LoginDialog
        error={controller.error}
        isSubmitting={controller.isLoginSubmitting}
        open={controller.isLoginOpen}
        onLogin={controller.handleLogin}
        onOpenChange={controller.setIsLoginOpen}
      />
      <SignOutConfirmDialog
        open={controller.isSignOutConfirmOpen}
        isSubmitting={controller.isSigningOut}
        onConfirm={controller.handleConfirmSignOut}
        onOpenChange={controller.setIsSignOutConfirmOpen}
      />
      <UserProfileDialog
        open={controller.isProfileOpen}
        user={controller.user}
        error={controller.profileError}
        isSubmitting={controller.isProfileSubmitting}
        onSubmit={controller.handleUpdateProfile}
        onOpenChange={controller.setIsProfileOpen}
      />
    </div>
  );
};

export default User;
