import type { FileTreeElement } from "@/components/unlumen-ui/file-tree";
import {
  Activity,
  Building2,
  Camera,
  Layers,
  Map,
  MapPinned,
  Route,
  Satellite,
  SquareDashedMousePointer,
  Tags,
  TrafficCone,
  UserRound,
} from "lucide-react";

export const LAYER_ELEMENTS: FileTreeElement[] = [
  {
    id: "basemap",
    name: "底图",
    type: "folder",
    icon: Map,
    children: [
      { id: "basemap-imagery", name: "谷歌影像", icon: Satellite },
      { id: "basemap-annotation", name: "影像注记", icon: Tags },
    ],
  },
  {
    id: "business-layers",
    name: "业务图层",
    type: "folder",
    icon: Layers,
    children: [
      { id: "road-network", name: "道路网络", icon: Route },
      { id: "traffic-hub", name: "交通枢纽", icon: TrafficCone },
      { id: "poi", name: "兴趣点位", icon: MapPinned },
      { id: "building", name: "建筑轮廓", icon: Building2 },
    ],
  },
  {
    id: "user-layers",
    name: "用户图层",
    type: "folder",
    icon: UserRound,
    children: [],
  },
  {
    id: "analysis-layers",
    name: "分析结果",
    type: "folder",
    icon: SquareDashedMousePointer,
    children: [
      { id: "heatmap", name: "客流热力", icon: Activity },
      { id: "camera", name: "监控点位", icon: Camera },
    ],
  },
];

export const DEFAULT_OPEN_FOLDER_IDS = [
  "basemap",
  "business-layers",
  "user-layers",
];
