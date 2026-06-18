import { ComposerPrimitive } from "@assistant-ui/react";
import { ChevronDown, Send } from "lucide-react";

export function ChatComposer() {
  return (
    <ComposerPrimitive.Root className="border border-input bg-background p-2 shadow-lg backdrop-blur">
      <ComposerPrimitive.Input
        minRows={2}
        maxRows={4}
        className="max-h-24 min-h-10 w-full resize-none bg-transparent text-xs font-normal leading-5 text-foreground outline-none placeholder:text-muted-foreground"
        placeholder="提问......"
        submitMode="enter"
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

        <ComposerPrimitive.Send
          className="grid h-8 w-8 place-items-center bg-foreground text-background transition hover:opacity-80"
          aria-label="发送消息"
          type="submit"
        >
          <Send className="h-3.5 w-3.5 rotate-45" />
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
}
