import { cn } from "@/lib/utils";
import { ChatEmptyState } from "./components/chat-empty-state";
import { ChatPanelCollapseButton } from "./components/chat-panel-collapse-button";
import { ChatPanelFooter } from "./components/chat-panel-footer";

type ChatPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  return (
    <aside
      className={cn(
        "relative z-50 h-full shrink-0 overflow-visible text-foreground transition-all duration-300",
        isOpen
          ? "w-[320px] bg-background p-2 shadow-lg backdrop-blur"
          : "w-0 p-0"
      )}
    >
      <ChatPanelCollapseButton isOpen={isOpen} onClose={onClose} />

      <div
        className={cn(
          "flex h-full flex-col overflow-hidden transition-opacity duration-200",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <ChatEmptyState />
        <ChatPanelFooter />
      </div>
    </aside>
  );
}
