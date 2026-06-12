import { ChevronLeft, ChevronRight } from "lucide-react";

export type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type ChatDockProps = {
  isOpen: boolean;
  messages: ChatMessage[];
  onClose: () => void;
  onOpen: () => void;
};

export function ChatDock({
  isOpen,
  messages,
  onClose,
  onOpen
}: ChatDockProps) {
  return (
    <>
      <aside
        className={`relative z-10 h-full shrink-0 border-l border-line bg-panel shadow-[0_0_40px_rgba(0,0,0,0.24)] transition-all duration-300 ${
          isOpen ? "w-[320px]" : "w-0"
        }`}
      >
        <div
          className={`flex h-full flex-col overflow-hidden transition-opacity duration-200 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground">AI Chat</p>
              <h2 className="mt-1 text-lg font-semibold text-panel-foreground">
                分析对话
              </h2>
            </div>
            <button
              className="border border-border bg-secondary p-2 text-secondary-foreground transition hover:bg-muted"
              onClick={onClose}
              aria-label="折叠聊天面板"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`px-4 py-3 text-sm leading-6 ${
                  message.role === "assistant"
                    ? "mr-6 border border-line bg-secondary text-secondary-foreground"
                    : "ml-6 border border-border bg-inverse text-inverse-foreground"
                }`}
              >
                <p className="mb-1 text-[11px] uppercase text-muted-foreground">
                  {message.role === "assistant" ? "Assistant" : "You"}
                </p>
                <p>{message.content}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-line px-4 py-4">
            <textarea
              className="min-h-[110px] w-full resize-none border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
              placeholder="右侧完整会话输入框，可继续追问、追加约束或要求导出结果。"
              defaultValue=""
            />
          </div>
        </div>
      </aside>

      {!isOpen ? (
        <button
          className="absolute right-4 top-1/2 z-20 flex h-14 w-10 -translate-y-1/2 items-center justify-center border border-border bg-secondary text-secondary-foreground shadow-[0_12px_26px_rgba(0,0,0,0.22)] transition hover:bg-muted"
          onClick={onOpen}
          aria-label="展开聊天面板"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : null}
    </>
  );
}
