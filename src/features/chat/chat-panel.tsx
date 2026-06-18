import {
  AssistantRuntimeProvider,
  MessagePartPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAui,
  useAuiState,
  useMessagePartText,
  useSmooth,
} from "@assistant-ui/react";
import { useEffect, useRef, type RefObject } from "react";
import {
  ScrollFade,
  type ScrollFadeHandle,
} from "@/components/ui/scroll-fade";
import { cn } from "@/lib/utils";
import { ChatEmptyState } from "./components/chat-empty-state";
import { ChatPanelCollapseButton } from "./components/chat-panel-collapse-button";
import { ChatPanelFooter } from "./components/chat-panel-footer";
import { MarkdownText } from "./components/markdown-text";
import { useAiChatRuntime } from "./hooks/use-ai-chat-runtime";

type ChatPanelProps = {
  accessToken: string | null;
  isOpen: boolean;
  onClose: () => void;
  onNewThread: () => void;
  onPendingPromptHandled: () => void;
  pendingPrompt: string | null;
  sessionId: string;
};

function MarkdownMessagePart() {
  const part = useMessagePartText();
  const smoothPart = useSmooth(part, {
    drainMs: 900,
    maxCharIntervalMs: 18,
    maxCharsPerFrame: 2,
  });

  return <MarkdownText text={smoothPart.text} />;
}

function ChatMessage() {
  return (
    <MessagePrimitive.Root className="group flex w-full px-3 py-2">
      <MessagePrimitive.If user>
        <div className="ml-auto max-w-[86%] bg-foreground px-3 py-2 text-xs leading-5 text-background">
          <MessagePrimitive.Parts
            components={{
              Text: () => (
                <p className="whitespace-pre-wrap">
                  <MessagePartPrimitive.Text />
                </p>
              ),
            }}
          />
        </div>
      </MessagePrimitive.If>

      <MessagePrimitive.If assistant>
        <div className="max-w-[92%] px-3 py-2 text-xs leading-5 text-foreground">
          <MessagePrimitive.Parts>
            {({ part }) => {
              if (part.type !== "text") return null;

              return (
                <div>
                  <MarkdownMessagePart />
                  <MessagePartPrimitive.InProgress>
                    <AssistantTypingIndicator />
                  </MessagePartPrimitive.InProgress>
                </div>
              );
            }}
          </MessagePrimitive.Parts>
          <MessagePrimitive.Error>
            <p className="text-destructive">消息发送失败，请稍后重试。</p>
          </MessagePrimitive.Error>
        </div>
      </MessagePrimitive.If>
    </MessagePrimitive.Root>
  );
}

function AssistantTypingIndicator() {
  return (
    <span
      aria-label="AI 正在生成回复"
      className="ml-0.5 inline-flex translate-y-px items-center gap-0.5"
      role="status"
    >
      <span className="h-1 w-1 animate-[typing-dot_1.2s_ease-in-out_infinite] bg-foreground/70" />
      <span className="h-1 w-1 animate-[typing-dot_1.2s_ease-in-out_0.15s_infinite] bg-foreground/55" />
      <span className="h-1 w-1 animate-[typing-dot_1.2s_ease-in-out_0.3s_infinite] bg-foreground/40" />
    </span>
  );
}

function ChatPanelContent({
  accessToken,
  onNewThread,
  onPendingPromptHandled,
  pendingPrompt,
  sessionId,
}: Pick<
  ChatPanelProps,
  | "accessToken"
  | "onNewThread"
  | "onPendingPromptHandled"
  | "pendingPrompt"
  | "sessionId"
>) {
  const runtime = useAiChatRuntime({ accessToken, sessionId });
  const scrollFadeRef = useRef<ScrollFadeHandle>(null);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadAutoScroller scrollFadeRef={scrollFadeRef} />
      <PendingPromptSender
        onPendingPromptHandled={onPendingPromptHandled}
        pendingPrompt={pendingPrompt}
      />
      <ThreadPrimitive.Root className="flex min-h-0 flex-1 flex-col">
        <ScrollFade
          ref={scrollFadeRef}
          className="min-h-0 flex-1"
          scrollClassName="flex h-full flex-col py-2"
        >
          <ThreadPrimitive.Empty>
            <ChatEmptyState />
          </ThreadPrimitive.Empty>
          <ThreadPrimitive.Messages components={{ Message: ChatMessage }} />
        </ScrollFade>
        <ChatPanelFooter onNewThread={onNewThread} />
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}

function ThreadAutoScroller({
  scrollFadeRef,
}: {
  scrollFadeRef: RefObject<ScrollFadeHandle | null>;
}) {
  const scrollSignal = useAuiState((state) => {
    const lastMessage = state.thread.messages.at(-1);
    const lastPart = lastMessage?.parts.at(-1);
    const lastText = lastPart?.type === "text" ? lastPart.text : "";

    return `${state.thread.messages.length}:${state.thread.isRunning}:${lastText.length}`;
  });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      scrollFadeRef.current?.scrollToBottom("smooth");
    });

    return () => window.cancelAnimationFrame(frame);
  }, [scrollFadeRef, scrollSignal]);

  return null;
}

function PendingPromptSender({
  onPendingPromptHandled,
  pendingPrompt,
}: Pick<ChatPanelProps, "onPendingPromptHandled" | "pendingPrompt">) {
  const aui = useAui();

  useEffect(() => {
    const prompt = pendingPrompt?.trim();
    if (!prompt) return;

    const composer = aui.thread().composer();
    composer.setText(prompt);
    composer.send();
    onPendingPromptHandled();
  }, [aui, onPendingPromptHandled, pendingPrompt]);

  return null;
}

export function ChatPanel({
  accessToken,
  isOpen,
  onClose,
  onNewThread,
  onPendingPromptHandled,
  pendingPrompt,
  sessionId,
}: ChatPanelProps) {
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
        <ChatPanelContent
          key={sessionId}
          accessToken={accessToken}
          onNewThread={onNewThread}
          onPendingPromptHandled={onPendingPromptHandled}
          pendingPrompt={pendingPrompt}
          sessionId={sessionId}
        />
      </div>
    </aside>
  );
}
