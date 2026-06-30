import type {
  ChartResult,
  ClarificationOption,
  InputDataSummary,
  MapCommand,
  MapLayerResult,
  PlanStep,
} from "@/types/agent";

const AI_CHAT_BASE_PATH = "/api/ai-chat";

export type AiChatMessageRole = "user" | "assistant" | "system";

export type AiChatMessage = {
  id: string;
  role: AiChatMessageRole;
  content: string;
  createdAt?: string;
  created_at?: string;
  status?: "streaming" | "completed" | "failed";
};

type AiChatStreamEventBase = {
  sessionId?: string;
  messageId?: string | null;
  toolCallId?: string | null;
};

export type AiChatDataSummaryEventData = {
  datasets?: InputDataSummary[];
  selectedDatasetIds?: string[];
  missingDatasetIds?: string[];
  payload?: InputDataSummary[];
  summaries?: InputDataSummary[];
};

export type AiChatLayerCreatedEventData =
  | { layer?: MapLayerResult }
  | MapLayerResult;

export type AiChatMapCommandEventData =
  | {
      commandId?: string;
      command?: MapCommand;
      reason?: string;
    }
  | MapCommand;

export type AiChatStreamEvent =
  | (AiChatStreamEventBase & {
      type: "message.delta";
      data: { delta?: string };
    })
  | (AiChatStreamEventBase & {
      type: "message.completed";
      data: { message?: AiChatMessage; content?: string };
    })
  | (AiChatStreamEventBase & {
      type: "tool.started" | "tool.completed" | "tool.failed";
      data: unknown;
    })
  | (AiChatStreamEventBase & {
      type: "data.summary";
      data: AiChatDataSummaryEventData;
    })
  | (AiChatStreamEventBase & {
      type: "plan.created";
      data: { steps?: PlanStep[] };
    })
  | (AiChatStreamEventBase & {
      type: "layer.created";
      data: AiChatLayerCreatedEventData;
    })
  | (AiChatStreamEventBase & {
      type: "map.command";
      data: AiChatMapCommandEventData;
    })
  | (AiChatStreamEventBase & {
      type: "chart.created";
      data: { chart?: ChartResult };
    })
  | (AiChatStreamEventBase & {
      type: "clarification";
      data: {
        question?: string;
        missing?: string[];
        options?: ClarificationOption[];
      };
    })
  | (AiChatStreamEventBase & {
      type: "error";
      data?: { message?: string; detail?: string } | unknown;
    })
  | (AiChatStreamEventBase & {
      type: "done";
      data?: Record<string, unknown>;
    });

export type SendAiChatMessageOptions = {
  accessToken: string;
  sessionId: string;
  message: string;
  selectedDatasetIds?: string[];
  selectedServiceIds?: string[];
  metadata?: Record<string, unknown>;
  abortSignal?: AbortSignal;
};

export class AiChatError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AiChatError";
    this.status = status;
  }
}

const readErrorMessage = async (response: Response) => {
  try {
    const body = (await response.json()) as { detail?: string };
    return body.detail ?? response.statusText;
  } catch {
    return response.statusText;
  }
};

const parseSseEvent = (rawEvent: string): AiChatStreamEvent | null => {
  const dataLines = rawEvent
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice("data:".length).trimStart());

  if (!dataLines.length) return null;

  try {
    return JSON.parse(dataLines.join("\n")) as AiChatStreamEvent;
  } catch {
    throw new AiChatError("聊天流响应解析失败");
  }
};

async function* readSseStream(
  stream: ReadableStream<Uint8Array>,
): AsyncIterable<AiChatStreamEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });

      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";

      for (const rawEvent of events) {
        const event = parseSseEvent(rawEvent.trim());
        if (event) yield event;
      }

      if (done) break;
    }

    const trailingEvent = parseSseEvent(buffer.trim());
    if (trailingEvent) yield trailingEvent;
  } finally {
    reader.releaseLock();
  }
}

export async function* sendAiChatMessage({
  accessToken,
  sessionId,
  message,
  selectedDatasetIds = [],
  selectedServiceIds = [],
  metadata = {},
  abortSignal,
}: SendAiChatMessageOptions): AsyncIterable<AiChatStreamEvent> {
  const response = await fetch(
    `${AI_CHAT_BASE_PATH}/sessions/${encodeURIComponent(sessionId)}/messages`,
    {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        selectedDatasetIds,
        selectedServiceIds,
        metadata,
      }),
      signal: abortSignal,
    },
  );

  if (!response.ok) {
    throw new AiChatError(await readErrorMessage(response), response.status);
  }

  if (!response.body) {
    throw new AiChatError("聊天接口未返回流式响应");
  }

  yield* readSseStream(response.body);
}
