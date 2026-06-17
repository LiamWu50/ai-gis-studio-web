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

type SignOutConfirmDialogProps = {
  open: boolean;
  isSubmitting?: boolean;
  onConfirm: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
};

export const SignOutConfirmDialog = ({
  open,
  isSubmitting = false,
  onConfirm,
  onOpenChange
}: SignOutConfirmDialogProps) => {
  const handleConfirm = async () => {
    if (isSubmitting) {
      return;
    }

    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-md border-0">
        <DialogHeader>
          <DialogTitle>确认退出登录？</DialogTitle>
          <DialogDescription>
            退出后需要重新登录才能继续使用当前账号。
          </DialogDescription>
        </DialogHeader>
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
            type="button"
            variant="destructive"
            disabled={isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" strokeWidth={1.75} />
            ) : null}
            {isSubmitting ? "退出中..." : "确认退出"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
