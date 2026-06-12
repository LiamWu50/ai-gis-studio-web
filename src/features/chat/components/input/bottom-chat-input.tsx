import { Bot } from "lucide-react";

export function BottomChatInput() {
  return (
    <div className="absolute bottom-6 left-1/2 w-[min(760px,calc(100%-12rem))] -translate-x-1/2">
      <div className="border border-line bg-panel/95 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
        <div className="flex items-end gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-border bg-card text-card-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <label className="flex-1">
            <span className="sr-only">AI 输入框</span>
            <textarea
              className="min-h-[76px] w-full resize-none border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
              placeholder="输入你的空间分析问题，例如：对比 3 公里范围内的商业热度和交通可达性。"
              defaultValue=""
            />
          </label>
          <button className="h-12 bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-muted hover:text-foreground">
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
