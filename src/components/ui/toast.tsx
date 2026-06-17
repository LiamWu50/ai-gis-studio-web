"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "info" | "warning" | "error";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_TIMEOUT_MS = 3600;

const toastIcons = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  error: TriangleAlert,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }, []);

  const toast = useCallback(
    (nextToast: ToastInput) => {
      const id = crypto.randomUUID();
      setToasts((currentToasts) => [
        {
          ...nextToast,
          id,
          variant: nextToast.variant ?? "info",
        },
        ...currentToasts,
      ]);

      window.setTimeout(() => removeToast(id), TOAST_TIMEOUT_MS);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed left-1/2 top-4 z-[100] flex w-[360px] max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col gap-2">
        {toasts.map((toastItem) => (
          <ToastCard
            key={toastItem.id}
            toast={toastItem}
            onClose={() => removeToast(toastItem.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: () => void;
}) {
  const Icon = toastIcons[toast.variant];

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 border px-3 py-3 text-sm shadow-lg",
        toast.variant === "success" &&
          "border-emerald-600 bg-emerald-600 text-white",
        toast.variant === "info" && "border-border bg-background text-foreground",
        toast.variant === "warning" &&
          "border-amber-600 bg-amber-600 text-white",
        toast.variant === "error" &&
          "border-destructive bg-destructive text-destructive-foreground",
      )}
      role="status"
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          toast.variant === "success" && "text-white",
          toast.variant === "info" && "text-muted-foreground",
          toast.variant === "warning" && "text-white",
          toast.variant === "error" && "text-destructive-foreground",
        )}
      />
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "font-medium",
            toast.variant === "info" ? "text-foreground" : "text-current",
          )}
        >
          {toast.title}
        </div>
        {toast.description ? (
          <div
            className={cn(
              "mt-0.5 line-clamp-2 text-xs",
              toast.variant === "info"
                ? "text-muted-foreground"
                : "text-current/80",
            )}
          >
            {toast.description}
          </div>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 shrink-0",
          toast.variant === "info"
            ? "text-muted-foreground hover:bg-muted hover:text-foreground"
            : "text-current/80 hover:bg-white/15 hover:text-current",
        )}
        aria-label="关闭提示"
        onClick={onClose}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
