"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { LoginForm } from "@/features/user/components/login-form";

type LoginDialogProps = {
  error?: string | null;
  isSubmitting?: boolean;
  open: boolean;
  onLogin: (username: string, password: string) => Promise<void>;
  onOpenChange: (open: boolean) => void;
};

export const LoginDialog = ({
  error,
  isSubmitting,
  open,
  onLogin,
  onOpenChange
}: LoginDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-none bg-transparent p-0 shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>登录</DialogTitle>
          <DialogDescription>登录 AI GIS Studio 账号</DialogDescription>
        </DialogHeader>
        <LoginForm
          error={error}
          isSubmitting={isSubmitting}
          onLogin={onLogin}
        />
      </DialogContent>
    </Dialog>
  );
};
