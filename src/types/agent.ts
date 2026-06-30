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
  | { type: "map.command"; commandId: string; command: MapCommand; reason?: string }
  | { type: "scene.action"; action: ThreeSceneAction }
  | { type: "report.delta"; text: string }
  | {
      type: "clarification";
      question: string;
      missing: string[];
      options?: ClarificationOption[];
    }
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
  sourceType:
    | "upload"
    | "url"
    | "database"
    | "sample"
    | "map_service"
    | "generated";
  geometryType?:
    | "Point"
    | "LineString"
    | "Polygon"
    | "MultiPoint"
    | "MultiLineString"
    | "MultiPolygon"
    | "Mixed"
    | "Raster"
    | null;
  crs?: string | null;
  featureCount?: number | null;
  bbox?: [number, number, number, number] | null;
  fields: FieldSummary[];
  warnings: string[];
  dataRef: string;
};

export type FieldSummary = {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "unknown";
  sampleValues?: string[];
  nullRatio?: number | null;
  uniqueCount?: number | null;
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

export type MapCommand =
  | CameraFlyToCommand
  | LayerAddDatasetCommand
  | LayerSetVisibleCommand
  | LayerSetOpacityCommand
  | OverlayAddMarkerCommand
  | MapClearTemporaryCommand;

export type CameraFlyToCommand = {
  action: "camera.flyTo";
  target:
    | {
        kind: "place";
        name: string;
        center: [number, number];
        bbox?: [number, number, number, number];
        confidence?: number;
      }
    | { kind: "coordinate"; lon: number; lat: number; height?: number }
    | { kind: "bbox"; bbox: [number, number, number, number] }
    | { kind: "layer"; layerId: string }
    | { kind: "dataset"; datasetId: string };
  durationMs?: number;
};

export type LayerAddDatasetCommand = {
  action: "layer.addDataset";
  datasetId: string;
  name?: string;
  visible?: boolean;
  opacity?: number;
  flyTo?: boolean;
};

export type LayerSetVisibleCommand = {
  action: "layer.setVisible";
  layerId: string;
  visible: boolean;
};

export type LayerSetOpacityCommand = {
  action: "layer.setOpacity";
  layerId: string;
  opacity: number;
};

export type OverlayAddMarkerCommand = {
  action: "overlay.addMarker";
  id: string;
  position: [number, number];
  label?: string;
  description?: string;
  flyTo?: boolean;
};

export type MapClearTemporaryCommand = {
  action: "map.clearTemporary";
  target?: "markers" | "highlights" | "drawings" | "all";
};

export type MapCommandResult = {
  ok: boolean;
  action: MapCommand["action"];
  message: string;
};

export type MapCommandError = {
  code:
    | "VIEWER_UNAVAILABLE"
    | "DATASET_NOT_FOUND"
    | "LAYER_NOT_FOUND"
    | "UNSUPPORTED_COMMAND"
    | "INVALID_COMMAND"
    | "EXECUTION_FAILED";
  message: string;
  recoverable: boolean;
};

export type ClarificationOption = {
  label: string;
  value: string;
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
