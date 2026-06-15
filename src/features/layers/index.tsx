"use client";

import { useState } from "react";
import { FileTree, type FileTreeElement } from "@/components/unlumen-ui/file-tree";
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
} from "lucide-react";

const initElements = (): FileTreeElement[] => [
  {
    id: "basemap",
    name: "底图",
    type: "folder",
    icon: Map,
    children: [
      { id: "basemap-imagery", name: "天地图影像", icon: Satellite },
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

const LayerPanel = () => {
  const [elements, setElements] = useState(initElements());

  return (
    <div className="absolute top-3 left-3 bg-background p-2 shadow-lg backdrop-blur">
      <FileTree
        elements={elements}
        defaultOpenIds={["basemap", "business-layers"]}
      />
    </div>
  );
};

export default LayerPanel;
