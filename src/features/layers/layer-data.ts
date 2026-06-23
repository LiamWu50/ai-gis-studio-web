import type { FileTreeElement } from "@/components/unlumen-ui/file-tree";
import {
  Activity,
  Camera,
  Layers,
  Map,
  Satellite,
  SquareDashedMousePointer,
  Tags,
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
    children: [],
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
