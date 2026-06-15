import { ChevronDown, PanelRightClose, Plus, Send } from "lucide-react";

type ChatPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  return (
    <>
      <aside
        className={`relative z-10 h-full shrink-0 bg-background p-2 text-foreground shadow-lg backdrop-blur transition-all duration-300 ${
          isOpen ? "w-[320px]" : "w-0 p-0"
        }`}
      >
        <div
          className={`flex h-full flex-col overflow-hidden transition-opacity duration-200 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            className="absolute -left-4 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center border border-border bg-background text-foreground shadow-lg backdrop-blur transition-colors duration-200 ease-out hover:bg-muted"
            onClick={onClose}
            aria-label="折叠聊天面板"
            type="button"
          >
            <PanelRightClose className="h-3.5 w-3.5" />
          </button>

          <div className="flex flex-1 items-center justify-center px-4 pb-24">
            <p className="text-center text-xs font-normal leading-6 text-muted-foreground">
              关于 Assistant UI，有什么问题都可以问我。
            </p>
          </div>

          <div className="p-2">
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

            <div className="mt-3 flex items-center justify-between text-muted-foreground">
              <button
                className="flex items-center gap-2 text-xs font-normal transition hover:text-foreground"
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
        </div>
      </aside>

    </>
  );
}
