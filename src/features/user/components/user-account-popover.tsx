"use client";

import { LogOut, Settings, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { UserProfile } from "@/services/auth";

type UserAccountPopoverProps = {
  open: boolean;
  user: UserProfile;
  onOpenSettings: () => void;
  onSignOut: () => void;
};

export const UserAccountPopover = ({
  open,
  user,
  onOpenSettings,
  onSignOut
}: UserAccountPopoverProps) => {
  if (!open) {
    return null;
  }

  return (
    <div
      className="absolute bottom-0 left-12 z-50 w-64 rounded-md bg-card p-3 text-card-foreground shadow-xl"
      role="menu"
      aria-label="用户账号菜单"
    >
      <div className="flex items-center gap-3 px-1 py-1.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <UserRound className="size-4" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {user.nickname || user.username}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user.email ?? user.username}
          </p>
        </div>
      </div>
      <Separator className="my-2" />
      <Button
        type="button"
        variant="ghost"
        className="h-9 w-full justify-start px-2"
        onClick={onOpenSettings}
        role="menuitem"
      >
        <Settings className="size-4" strokeWidth={1.75} />
        账号设置
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-9 w-full justify-start px-2 text-destructive hover:text-destructive"
        onClick={onSignOut}
        role="menuitem"
      >
        <LogOut className="size-4" strokeWidth={1.75} />
        退出登录
      </Button>
    </div>
  );
};
