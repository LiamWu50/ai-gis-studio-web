import { PanelRightClose } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatPanelCollapseButtonProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ChatPanelCollapseButton({
  isOpen,
  onClose,
}: ChatPanelCollapseButtonProps) {
  return (
    <button
      className={cn(
        "absolute -left-4 top-1/2 z-50 flex h-7 w-7 -translate-y-1/2 items-center justify-center border border-border bg-background text-foreground shadow-lg backdrop-blur transition-colors duration-200 ease-out hover:bg-muted",
        !isOpen && "pointer-events-none opacity-0",
      )}
      onClick={onClose}
      aria-label="折叠聊天面板"
      type="button"
    >
      <PanelRightClose className="h-3.5 w-3.5" />
    </button>
  );
}
