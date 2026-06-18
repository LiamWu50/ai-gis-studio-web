# 后端 AI 地图工具与返回数据结构规格

本文档面向后端实现，描述 WebGIS 智能体需要提供的 AI tools、事件流协议，以及返回给前端的 `map.command` 数据结构。前端只执行结构化地图命令，不解析自然语言。

## 1. 后端职责

后端作为 AI tools 执行方，负责：

- 理解用户自然语言中的地图意图，例如定位、图层控制、数据集上图、标注、清理临时结果。
- 调用地名解析、图层检索、数据集检索、空间查询等工具。
- 将工具结果转换为稳定、可校验、可回放的 `map.command`。
- 在目标不明确时返回 `clarification`，不要让前端猜测。
- 返回图层 ID、数据集 ID、bbox、坐标等稳定字段，避免只返回展示名称。

## 2. 后端需要实现的 Tools

### geocode_place

用于地名解析。

输入：

```ts
type GeocodePlaceInput = {
  placeName: string;
  countryCode?: string;
  province?: string;
  city?: string;
};
```

输出：

```ts
type GeocodePlaceOutput = {
  name: string;
  normalizedName: string;
  center: [number, number];
  bbox?: [number, number, number, number];
  level?: "country" | "province" | "city" | "district" | "street" | "poi";
  confidence: number;
  candidates?: Array<{
    name: string;
    center: [number, number];
    bbox?: [number, number, number, number];
    level?: string;
    confidence: number;
  }>;
};
```

### search_layers

用于按自然语言查找当前用户可见图层。

输入：

```ts
type SearchLayersInput = {
  query: string;
  userId: string;
  includeHidden?: boolean;
};
```

输出：

```ts
type SearchLayersOutput = {
  layers: Array<{
    layerId: string;
    name: string;
    datasetId?: string;
    geometryType?: string | null;
    bbox?: [number, number, number, number] | null;
    visible: boolean;
    opacity: number;
    score: number;
  }>;
};
```

### search_datasets

用于按自然语言查找数据中心数据集。

输入：

```ts
type SearchDatasetsInput = {
  query: string;
  geometryType?: string;
  fields?: string[];
  limit?: number;
};
```

输出：

```ts
type SearchDatasetsOutput = {
  datasets: InputDataSummary[];
};
```

### query_features

用于按空间范围、当前视野、绘制区域或属性条件查询要素。

输入：

```ts
type QueryFeaturesInput = {
  source:
    | { kind: "layer"; layerId: string }
    | { kind: "dataset"; datasetId: string };
  spatialFilter?:
    | { kind: "bbox"; bbox: [number, number, number, number] }
    | { kind: "geometry"; geometry: GeoJSON.Geometry };
  where?: Record<string, unknown>;
  limit?: number;
};
```

输出：

```ts
type QueryFeaturesOutput = {
  sourceId: string;
  featureCount: number;
  returnedFeatureCount: number;
  bbox?: [number, number, number, number] | null;
  features: Array<{
    id: string;
    properties: Record<string, unknown>;
    geometry?: GeoJSON.Geometry;
    bbox?: [number, number, number, number] | null;
  }>;
};
```

### summarize_map_context

用于让 AI 理解当前地图上下文。

输入：

```ts
type SummarizeMapContextInput = {
  userId: string;
  camera?: {
    center?: [number, number];
    bbox?: [number, number, number, number];
    height?: number;
  };
  loadedLayerIds: string[];
  selectedLayerId?: string;
};
```

输出：

```ts
type SummarizeMapContextOutput = {
  visibleLayers: Array<{
    layerId: string;
    name: string;
    datasetId?: string;
    bbox?: [number, number, number, number] | null;
  }>;
  currentView?: {
    center?: [number, number];
    bbox?: [number, number, number, number];
    height?: number;
  };
  notes: string[];
};
```

### create_map_command

用于把工具结果转换为前端命令。

输入：

```ts
type CreateMapCommandInput = {
  userIntent: string;
  toolOutputs: unknown[];
};
```

输出：

```ts
type CreateMapCommandOutput = {
  commandId: string;
  reason?: string;
  command: MapCommand;
};
```

## 3. 返回给前端的事件流结构

后端建议通过 SSE、流式 JSON 或现有 agent event stream 返回事件。前端按 `type` 分发。

```ts
type AgentEvent =
  | {
      type: "plan.created";
      steps: PlanStep[];
    }
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
  | {
      type: "map.command";
      commandId: string;
      command: MapCommand;
      reason?: string;
    }
  | {
      type: "report.delta";
      text: string;
    }
  | {
      type: "clarification";
      question: string;
      missing: string[];
      options?: Array<{ label: string; value: string }>;
    }
  | {
      type: "error";
      error: AgentError;
    }
  | {
      type: "done";
      payload: Record<string, unknown>;
    };
```

## 4. MapCommand 结构

```ts
type MapCommand =
  | {
      action: "camera.flyTo";
      target:
        | {
            kind: "place";
            name: string;
            center: [number, number];
            bbox?: [number, number, number, number];
            confidence?: number;
          }
        | {
            kind: "coordinate";
            lon: number;
            lat: number;
            height?: number;
          }
        | {
            kind: "bbox";
            bbox: [number, number, number, number];
          }
        | {
            kind: "layer";
            layerId: string;
          }
        | {
            kind: "dataset";
            datasetId: string;
          };
      durationMs?: number;
    }
  | {
      action: "layer.addDataset";
      datasetId: string;
      name?: string;
      visible?: boolean;
      opacity?: number;
      flyTo?: boolean;
    }
  | {
      action: "layer.setVisible";
      layerId: string;
      visible: boolean;
    }
  | {
      action: "layer.setOpacity";
      layerId: string;
      opacity: number;
    }
  | {
      action: "overlay.addMarker";
      id: string;
      position: [number, number];
      label?: string;
      description?: string;
      flyTo?: boolean;
    }
  | {
      action: "map.clearTemporary";
      target?: "markers" | "highlights" | "drawings" | "all";
    };
```

## 5. 典型返回示例

### 定位到成都市

```json
{
  "type": "map.command",
  "commandId": "cmd_locate_chengdu",
  "reason": "已解析到成都市行政范围，准备定位地图视角。",
  "command": {
    "action": "camera.flyTo",
    "target": {
      "kind": "place",
      "name": "成都市",
      "center": [104.0668, 30.5728],
      "bbox": [103.85, 30.45, 104.53, 30.91],
      "confidence": 0.95
    },
    "durationMs": 1200
  }
}
```

### 添加数据集为图层

```json
{
  "type": "map.command",
  "commandId": "cmd_add_dataset_schools",
  "reason": "已匹配到学校点位数据集，准备加入用户图层并定位。",
  "command": {
    "action": "layer.addDataset",
    "datasetId": "dataset_schools_001",
    "name": "学校点位",
    "visible": true,
    "opacity": 1,
    "flyTo": true
  }
}
```

### 显示图层

```json
{
  "type": "map.command",
  "commandId": "cmd_show_layer_schools",
  "command": {
    "action": "layer.setVisible",
    "layerId": "layer_schools_001",
    "visible": true
  }
}
```

### 添加临时标记

```json
{
  "type": "map.command",
  "commandId": "cmd_marker_chengdu_center",
  "command": {
    "action": "overlay.addMarker",
    "id": "chengdu_center",
    "position": [104.0668, 30.5728],
    "label": "成都市中心",
    "description": "地名解析得到的中心点",
    "flyTo": true
  }
}
```

### 清除临时标记

```json
{
  "type": "map.command",
  "commandId": "cmd_clear_markers",
  "command": {
    "action": "map.clearTemporary",
    "target": "markers"
  }
}
```

### 需要用户澄清

```json
{
  "type": "clarification",
  "question": "找到多个名称相近的图层，请选择要操作的图层。",
  "missing": ["layerId"],
  "options": [
    { "label": "学校点位", "value": "layer_schools_001" },
    { "label": "学校服务区", "value": "layer_school_area_001" }
  ]
}
```

## 6. 后端实现要求

- 坐标统一使用 WGS84，经纬度顺序为 `[lon, lat]`。
- bbox 统一为 `[west, south, east, north]`。
- `layerId` 必须是用户图层树中的稳定节点 ID。
- `datasetId` 必须是数据中心返回的稳定数据集 ID。
- 当匹配结果置信度不足或候选项超过一个时，返回 `clarification`。
- 当工具执行失败时返回 `error`，不要返回半结构化文本。
- `map.command` 应只包含前端执行地图动作所需的最小字段。
- 后端可以同时返回 `report.delta` 解释执行原因，但地图动作必须通过 `map.command` 表达。

## 7. 第一阶段范围

必须支持：

- 地名定位：`camera.flyTo` + `place`
- 坐标定位：`camera.flyTo` + `coordinate`
- 范围定位：`camera.flyTo` + `bbox`
- 图层定位：`camera.flyTo` + `layer`
- 数据集定位：`camera.flyTo` + `dataset`
- 数据集上图：`layer.addDataset`
- 图层显隐：`layer.setVisible`
- 图层透明度：`layer.setOpacity`
- 临时标注：`overlay.addMarker`
- 清理临时结果：`map.clearTemporary`

暂不要求：

- 路径规划
- 等时圈
- 复杂缓冲区分析
- 完整绘制编辑器
- 后端直接控制前端 Cesium viewer
