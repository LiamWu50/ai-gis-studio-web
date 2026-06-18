import type { AgentEvent } from "@/types/agent";

export async function* startAgentRun(prompt = ""): AsyncIterable<AgentEvent> {
  const normalizedPrompt = prompt.trim();

  if (normalizedPrompt.includes("成都")) {
    yield {
      type: "tool.started",
      toolName: "geocode_place",
      input: { placeName: "成都市" },
      toolCallId: "tool_geocode_chengdu",
    };

    yield {
      type: "tool.finished",
      toolName: "geocode_place",
      output: {
        name: "成都市",
        center: [104.0668, 30.5728],
        bbox: [103.85, 30.45, 104.53, 30.91],
        confidence: 0.95,
      },
      toolCallId: "tool_geocode_chengdu",
    };

    yield {
      type: "map.command",
      commandId: "cmd_locate_chengdu",
      reason: "已解析到成都市行政范围，准备定位地图视角。",
      command: {
        action: "camera.flyTo",
        target: {
          kind: "place",
          name: "成都市",
          center: [104.0668, 30.5728],
          bbox: [103.85, 30.45, 104.53, 30.91],
          confidence: 0.95,
        },
        durationMs: 1200,
      },
    };
  } else if (normalizedPrompt) {
    yield {
      type: "clarification",
      question: "当前前端已接入地图命令协议。请尝试输入“定位到成都市”验证链路。",
      missing: ["map_intent"],
    };
  }

  yield {
    type: "done",
    payload: {}
  };
}
