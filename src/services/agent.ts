import type { AgentEvent } from "@/types/agent";

export async function* startAgentRun(): AsyncIterable<AgentEvent> {
  yield {
    type: "done",
    payload: {}
  };
}
