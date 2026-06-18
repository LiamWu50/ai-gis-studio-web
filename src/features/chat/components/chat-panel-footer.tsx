import { Plus } from "lucide-react";
import { ChatComposer } from "./chat-composer";

type ChatPanelFooterProps = {
  onNewThread: () => void;
};

export function ChatPanelFooter({ onNewThread }: ChatPanelFooterProps) {
  return (
    <div className="p-2">
      <ChatComposer />

      <div className="mt-3 flex items-center justify-between text-muted-foreground">
        <button
          className="flex items-center gap-2 text-xs font-normal transition hover:text-foreground"
          onClick={onNewThread}
          type="button"
        >
          <Plus className="h-4 w-4" />
          <span>新帖</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-20 bg-muted" />
          <span>0 ( 0 %)</span>
        </div>
      </div>
    </div>
  );
}
