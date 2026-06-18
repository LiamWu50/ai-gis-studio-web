# WebGIS 智能体地图命令接口

本文档描述后端 AI tools 与前端地图执行器之间的协议。后端负责理解自然语言、调用工具并生成结构化地图命令；前端只校验并执行 `map.command`，不再解析自然语言。

## 后端工具职责

第一阶段建议实现以下 tools：

| Tool | 输入 | 输出 | 说明 |
| --- | --- | --- | --- |
| `geocode_place` | `placeName` | 地名、中心点、bbox、行政级别、置信度 | 用于“定位到成都市”等地名定位 |
| `search_layers` | `query`、当前用户 | 图层 ID、名称、bbox、可见性 | 用于按自然语言匹配当前用户图层 |
| `search_datasets` | `query`、几何类型、字段条件 | 数据集摘要列表 | 用于把数据中心数据集加入地图 |
| `query_features` | 图层/数据集、空间范围、属性条件 | 要素 ID、属性、bbox | 用于查询和高亮 |
| `summarize_map_context` | 当前视图、已加载图层、选中对象 | 上下文摘要 | 用于让 AI 理解当前地图状态 |
| `create_map_command` | 工具结果和用户意图 | `MapCommand` | 将工具结果转换为前端可执行命令 |

## AgentEvent

```ts
type AgentEvent =
  | { type: "report.delta"; text: string }
  | {
      type: "tool.started";
      toolName: string;
      input: unknown;
      toolCallId: string;
    }
  | {
      type: "tool.finished";
      toolName: string;
      output: unknown;
      toolCallId: string;
    }
  | {
      type: "map.command";
      commandId: string;
      command: MapCommand;
      reason?: string;
    }
  | {
      type: "clarification";
      question: string;
      missing: string[];
      options?: Array<{ label: string; value: string }>;
    }
  | {
      type: "error";
      error: {
        code: string;
        message: string;
        recoverable: boolean;
        details?: unknown;
      };
    }
  | { type: "done"; payload: Record<string, unknown> };
```

## MapCommand

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
        | { kind: "coordinate"; lon: number; lat: number; height?: number }
        | { kind: "bbox"; bbox: [number, number, number, number] }
        | { kind: "layer"; layerId: string }
        | { kind: "dataset"; datasetId: string };
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

## 示例

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
  "commandId": "cmd_add_schools",
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

## 错误与澄清

- 地名、图层名、数据集名无法唯一匹配时，后端返回 `clarification`。
- 前端执行失败时，只反馈可恢复错误，不抛出未捕获异常。
- 后端返回稳定 ID 和空间范围，避免前端根据展示名称猜测目标。
