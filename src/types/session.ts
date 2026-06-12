import type {
  AnalysisReport,
  ChartResult,
  InputDataSummary,
  MapLayerResult,
  PlanStep,
  ThreeSceneAction,
  ToolCallRecord
} from "@/types/agent";

export type AgentSessionStatus =
  | "idle"
  | "running"
  | "waiting_confirmation"
  | "waiting_clarification"
  | "completed"
  | "failed";

export type AgentMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  status?: "streaming" | "completed" | "failed";
};

export type AgentSession = {
  id: string;
  title: string;
  status: AgentSessionStatus;
  messages: AgentMessage[];
  selectedDatasetIds: string[];
  selectedServiceIds: string[];
  dataSummaries: InputDataSummary[];
  plan: PlanStep[];
  toolCalls: ToolCallRecord[];
  layers: MapLayerResult[];
  charts: ChartResult[];
  sceneActions: ThreeSceneAction[];
  report?: AnalysisReport;
  createdAt: string;
  updatedAt: string;
};
