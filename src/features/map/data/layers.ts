import type { LayerItem } from "@/features/map/components/layer-panel";

export const mapLayers: LayerItem[] = [
  { name: "城市底图", meta: "WebMercator / Vector", active: true },
  { name: "道路网络", meta: "交通分析图层", active: true },
  { name: "行政边界", meta: "区县级 GeoJSON", active: false },
  { name: "POI 热力", meta: "商业活跃度", active: true }
];
