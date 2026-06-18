import { Send, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useChatInput } from "../hooks/use-chat-input";

type SimpleChatInputProps = {
  onSubmit: (message: string) => void;
};

export function SimpleChatInput({ onSubmit }: SimpleChatInputProps) {
  const input = useChatInput({ onSubmit });

  return (
    <div className="relative">
      <Sparkles className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
      <Input
        id="input-demo-api-key"
        type="text"
        placeholder="提问..."
        value={input.value}
        onChange={(event) => input.setValue(event.target.value)}
        onKeyDown={input.handleKeyDown}
        className="h-12 border-none rounded-none bg-background pl-12 pr-12 font-light text-foreground shadow-md placeholder:font-light placeholder:text-foreground focus-visible:border-muted-foreground/40 focus-visible:ring-0"
      />
      <button
        className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center bg-foreground text-background transition-colors duration-200 ease-out hover:bg-foreground/80"
        onClick={input.submit}
        type="button"
        aria-label="发送消息并打开聊天面板"
      >
        <Send className="h-3.5 w-3.5 rotate-45" />
      </button>
    </div>
  );
}
