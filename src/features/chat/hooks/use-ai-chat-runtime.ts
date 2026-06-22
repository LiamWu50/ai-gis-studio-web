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
import type { MapCommand } from "@/types/agent";
import { useLayerWorkspace } from "@/features/layers/layer-workspace";
import { buildChatContext } from "../utils/build-chat-context";

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

const appendStatusLine = (content: string, status: string) =>
  `${content}${content ? "\n\n" : ""}${status}`;

const getToolName = (data: unknown) => {
  if (!data || typeof data !== "object") return "工具";

  const record = data as {
    toolName?: unknown;
    name?: unknown;
    tool?: unknown;
  };

  return (
    (typeof record.toolName === "string" && record.toolName) ||
    (typeof record.name === "string" && record.name) ||
    (typeof record.tool === "string" && record.tool) ||
    "工具"
  );
};

const getToolErrorMessage = (data: unknown) => {
  if (!data || typeof data !== "object") return "执行失败";

  const record = data as {
    message?: unknown;
    detail?: unknown;
    error?: unknown;
  };

  if (typeof record.message === "string") return record.message;
  if (typeof record.detail === "string") return record.detail;

  if (record.error && typeof record.error === "object") {
    const error = record.error as { message?: unknown };
    if (typeof error.message === "string") return error.message;
  }

  return "执行失败";
};

const getMapCommand = (event: AiChatStreamEvent): MapCommand | null => {
  if (event.type !== "map.command") return null;

  return event.data.command ?? null;
};

export function useAiChatRuntime({
  accessToken,
  sessionId,
}: UseAiChatRuntimeOptions) {
  const { executeMapCommand, getViewer, selectedLayerIds, userLayers } =
    useLayerWorkspace();

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
        const chatContext = buildChatContext({
          userLayers,
          selectedLayerIds,
          viewer: getViewer(),
        });

        for await (const event of sendAiChatMessage({
          accessToken,
          sessionId,
          message,
          selectedDatasetIds: chatContext.selectedDatasetIds,
          selectedServiceIds: chatContext.selectedServiceIds,
          metadata: chatContext.metadata,
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

          if (event.type === "data.summary") {
            const summaries =
              event.data.datasets ??
              event.data.payload ??
              event.data.summaries ??
              [];
            if (summaries.length > 0) {
              content = appendStatusLine(
                content,
                `已读取 ${summaries.length} 个数据上下文。`,
              );
              yield {
                content: [{ type: "text", text: content }],
              };
            }

            if (event.data.missingDatasetIds?.length) {
              content = appendStatusLine(
                content,
                `有 ${event.data.missingDatasetIds.length} 个选中数据集暂不可用。`,
              );
              yield {
                content: [{ type: "text", text: content }],
              };
            }
          }

          if (event.type === "tool.started") {
            content = appendStatusLine(
              content,
              `正在调用 ${getToolName(event.data)}...`,
            );
            yield {
              content: [{ type: "text", text: content }],
            };
          }

          if (event.type === "tool.completed") {
            content = appendStatusLine(
              content,
              `${getToolName(event.data)} 已完成。`,
            );
            yield {
              content: [{ type: "text", text: content }],
            };
          }

          if (event.type === "tool.failed") {
            content = appendStatusLine(
              content,
              `${getToolName(event.data)} 执行失败：${getToolErrorMessage(
                event.data,
              )}`,
            );
            yield {
              content: [{ type: "text", text: content }],
            };
          }

          if (event.type === "map.command") {
            const command = getMapCommand(event);
            if (!command) continue;

            try {
              const result = await executeMapCommand(command);
              content = appendStatusLine(content, result.message);
              yield {
                content: [{ type: "text", text: content }],
              };
            } catch (error) {
              content = appendStatusLine(
                content,
                error instanceof Error ? error.message : "地图命令执行失败",
              );
              yield {
                content: [{ type: "text", text: content }],
              };
            }
          }

          if (event.type === "clarification" && event.data.question) {
            content = appendStatusLine(content, event.data.question);
            yield {
              content: [{ type: "text", text: content }],
            };
          }

          if (event.type === "error") {
            throw new AiChatError(getErrorEventMessage(event));
          }
        }
      },
    }),
    [
      accessToken,
      executeMapCommand,
      getViewer,
      selectedLayerIds,
      sessionId,
      userLayers,
    ],
  );

  return useLocalRuntime(chatModelAdapter, {
    unstable_enableMessageQueue: true,
  });
}
