"use client";

import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { UserProfileForm } from "@/features/user/components/user-profile-form";
import type { UpdateUserProfileRequest, UserProfile } from "@/services/auth";

const PROFILE_FORM_ID = "user-profile-form";

type UserProfileDialogProps = {
  open: boolean;
  user: UserProfile | null;
  error?: string | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: UpdateUserProfileRequest) => Promise<void>;
};

export const UserProfileDialog = ({
  open,
  user,
  error,
  isSubmitting = false,
  onOpenChange,
  onSubmit
}: UserProfileDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-md border-0">
        <DialogHeader>
          <DialogTitle>账号设置</DialogTitle>
          <DialogDescription>
            配置当前账号的昵称、邮箱和头像信息。
          </DialogDescription>
        </DialogHeader>
        {user ? (
          <UserProfileForm
            key={`${user.id}:${user.nickname}:${user.email ?? ""}:${user.avatarUrl ?? ""}`}
            formId={PROFILE_FORM_ID}
            user={user}
            disabled={isSubmitting}
            onSubmit={onSubmit}
          />
        ) : null}
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <DialogFooter className="gap-2 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            type="submit"
            form={PROFILE_FORM_ID}
            disabled={isSubmitting || !user}
          >
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" strokeWidth={1.75} />
            ) : null}
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
