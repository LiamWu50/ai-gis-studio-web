"use client";

import { useMemo } from "react";
import {
  useLocalRuntime,
  type ChatModelAdapter,
  type ThreadMessage,
} from "@assistant-ui/react";
import {
  AiChatError,
  sendAiChatMessage,
  type AiChatStreamEvent,
} from "@/services/ai-chat";

type UseAiChatRuntimeOptions = {
  accessToken: string | null;
  sessionId: string;
};

const getTextContent = (message: ThreadMessage) =>
  message.content
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();

const getLastUserMessageText = (messages: readonly ThreadMessage[]) => {
  const userMessage = [...messages].reverse().find((message) => {
    return message.role === "user";
  });

  return userMessage ? getTextContent(userMessage) : "";
};

const getErrorEventMessage = (event: AiChatStreamEvent) => {
  if (event.type !== "error") return "聊天请求失败";

  if (
    event.data &&
    typeof event.data === "object" &&
    ("message" in event.data || "detail" in event.data)
  ) {
    const data = event.data as { message?: unknown; detail?: unknown };
    return (
      (typeof data.message === "string" && data.message) ||
      (typeof data.detail === "string" && data.detail) ||
      "聊天请求失败"
    );
  }

  return "聊天请求失败";
};

export function useAiChatRuntime({
  accessToken,
  sessionId,
}: UseAiChatRuntimeOptions) {
  const chatModelAdapter = useMemo<ChatModelAdapter>(
    () => ({
      async *run({ messages, abortSignal }) {
        if (!accessToken) {
          throw new AiChatError("请先登录后再提问", 401);
        }

        const message = getLastUserMessageText(messages);
        if (!message) {
          throw new AiChatError("请输入问题后再发送");
        }

        let content = "";
        let lastDeltaAt = performance.now();

        for await (const event of sendAiChatMessage({
          accessToken,
          sessionId,
          message,
          selectedDatasetIds: [],
          selectedServiceIds: [],
          metadata: { tools: [] },
          abortSignal,
        })) {
          if (event.type === "message.delta") {
            const delta = event.data.delta ?? "";
            if (process.env.NODE_ENV === "development") {
              const now = performance.now();
              console.debug("[ai-chat] message.delta", {
                deltaLength: delta.length,
                elapsedMs: Math.round(now - lastDeltaAt),
              });
              lastDeltaAt = now;
            }

            content += delta;
            yield {
              content: [{ type: "text", text: content }],
            };
          }

          if (event.type === "message.completed") {
            content = event.data.message?.content ?? content;
            yield {
              content: [{ type: "text", text: content }],
              status: { type: "complete", reason: "stop" },
            };
          }

          if (event.type === "error") {
            throw new AiChatError(getErrorEventMessage(event));
          }
        }
      },
    }),
    [accessToken, sessionId],
  );

  return useLocalRuntime(chatModelAdapter, {
    unstable_enableMessageQueue: true,
  });
}
