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
  type AiChatDataSummaryEventData,
  type AiChatLayerCreatedEventData,
  type AiChatMapCommandEventData,
} from "@/services/ai-chat";
import type { InputDataSummary, MapCommand, MapLayerResult } from "@/types/agent";
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object";

const readString = (
  record: Record<string, unknown>,
  keys: string[],
): string | null => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  return null;
};

const readNestedString = (
  record: Record<string, unknown>,
  key: string,
  nestedKeys: string[],
) => {
  const value = record[key];
  if (!isRecord(value)) return null;

  return readString(value, nestedKeys);
};

const getToolName = (data: unknown) => {
  if (!isRecord(data)) return "工具";

  return (
    readString(data, ["toolName", "name", "tool"]) ??
    readNestedString(data, "input", ["toolName", "name", "tool", "operation"]) ??
    readNestedString(data, "output", ["toolName", "name", "tool", "operation"]) ??
    "工具"
  );
};

const getToolErrorMessage = (data: unknown) => {
  if (!isRecord(data)) return "执行失败";

  const message = readString(data, ["message", "detail"]);
  if (message) return message;

  if (isRecord(data.error)) {
    const errorMessage = readString(data.error, ["message", "detail", "code"]);
    if (errorMessage) return errorMessage;
  }

  return "执行失败";
};

const isMapCommand = (value: unknown): value is MapCommand =>
  isRecord(value) && typeof value.action === "string";

const getMapCommand = (event: AiChatStreamEvent): MapCommand | null => {
  if (event.type !== "map.command") return null;

  const data: AiChatMapCommandEventData = event.data;
  if (isMapCommand(data)) return data;
  if (isRecord(data) && isMapCommand(data.command)) return data.command;

  return null;
};

const getLayerCreatedData = (
  data: AiChatLayerCreatedEventData,
): MapLayerResult | null => {
  const record: Record<string, unknown> = data;

  if (isRecord(record.layer)) {
    return record.layer as MapLayerResult;
  }

  if (typeof record.id === "string") {
    return record as MapLayerResult;
  }

  return null;
};

const getDataSummaries = (
  data: AiChatDataSummaryEventData,
): InputDataSummary[] => data.datasets ?? data.payload ?? data.summaries ?? [];

const getCompletedMessageContent = (event: AiChatStreamEvent) => {
  if (event.type !== "message.completed") return null;

  return event.data.message?.content ?? event.data.content ?? null;
};

export function useAiChatRuntime({
  accessToken,
  sessionId,
}: UseAiChatRuntimeOptions) {
  const { executeMapCommand, getViewer, userLayers } = useLayerWorkspace();

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
            content = getCompletedMessageContent(event) ?? content;
            yield {
              content: [{ type: "text", text: content }],
              status: { type: "complete", reason: "stop" },
            };
          }

          if (event.type === "data.summary") {
            const summaries = getDataSummaries(event.data);
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

          if (event.type === "layer.created") {
            const layer = getLayerCreatedData(event.data);
            if (!layer) continue;

            content = appendStatusLine(
              content,
              `已生成结果图层：${layer.name}。`,
            );
            yield {
              content: [{ type: "text", text: content }],
            };
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
      sessionId,
      userLayers,
    ],
  );

  return useLocalRuntime(chatModelAdapter, {
    unstable_enableMessageQueue: true,
  });
}
