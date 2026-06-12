export type AgentEvent =
  | { type: "plan.created"; steps: PlanStep[] }
  | { type: "data.summary"; payload: InputDataSummary[] }
  | {
      type: "tool.started";
      toolName: string;
      input: unknown;
      toolCallId?: string;
    }
  | {
      type: "tool.finished";
      toolName: string;
      output: unknown;
      toolCallId?: string;
    }
  | { type: "layer.created"; layer: MapLayerResult }
  | { type: "chart.created"; chart: ChartResult }
  | { type: "scene.action"; action: ThreeSceneAction }
  | { type: "report.delta"; text: string }
  | { type: "clarification"; question: string; missing: string[] }
  | { type: "error"; error: AgentError }
  | { type: "done"; payload: Record<string, unknown> };

export type PlanStep = {
  id: string;
  title: string;
  type: "intent" | "data" | "analysis" | "visualization" | "report";
  status: "pending" | "running" | "completed" | "failed" | "skipped";
};

export type InputDataSummary = {
  datasetId: string;
  name: string;
  sourceType: "upload" | "sample" | "map_service";
  geometryType?: "Point" | "LineString" | "Polygon" | "Mixed";
  crs?: string;
  featureCount?: number;
  bbox?: [number, number, number, number];
  fields: FieldSummary[];
  warnings: string[];
};

export type FieldSummary = {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "unknown";
  sampleValues?: string[];
  nullRatio?: number;
};

export type MapLayerResult = {
  id: string;
  name: string;
  geometryType: "Point" | "LineString" | "Polygon" | "Raster" | "Mixed";
  source: {
    type: "generated" | "input" | "service";
    datasetId?: string;
    serviceId?: string;
    toolCallId?: string;
  };
  dataRef: string;
  bbox?: [number, number, number, number];
  style?: Record<string, unknown>;
  legend?: Array<Record<string, unknown>>;
  metadata: Record<string, unknown>;
};

export type ToolCallRecord = {
  id: string;
  toolName: string;
  status: "running" | "completed" | "failed";
  input: unknown;
  output?: unknown;
  error?: AgentError;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
};

export type ChartResult = {
  id: string;
  title: string;
  chartType: "table" | "bar" | "pie" | "metric";
  data: unknown;
  sourceToolCallId?: string;
  sourceLayerId?: string;
};

export type ThreeSceneAction = {
  id: string;
  actionType: string;
  payload: Record<string, unknown>;
};

export type AnalysisReport = {
  id: string;
  title: string;
  content: string;
  referencedDatasetIds: string[];
  referencedServiceIds: string[];
  referencedLayerIds: string[];
  referencedToolCallIds: string[];
};

export type AgentError = {
  code: string;
  message: string;
  recoverable: boolean;
  details?: unknown;
};
