import { ChevronDown, Send } from "lucide-react";

export function ChatComposer() {
  return (
    <div className="border border-input bg-background p-2 shadow-lg backdrop-blur">
      <textarea
        className="min-h-[48px] w-full resize-none bg-transparent text-xs font-normal leading-5 text-foreground outline-none placeholder:text-muted-foreground"
        placeholder="提问......"
      />

      <div className="mt-2 flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-xs font-normal text-foreground transition hover:text-foreground"
          type="button"
        >
          <span className="grid h-5 w-5 place-items-center">
            <span className="text-sm leading-none">◎</span>
          </span>
          <span>GPT-5.4 Nano</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        <button
          className="grid h-8 w-8 place-items-center bg-foreground text-background transition hover:opacity-80"
          aria-label="发送消息"
          type="button"
        >
          <Send className="h-3.5 w-3.5 rotate-45" />
        </button>
      </div>
    </div>
  );
}
