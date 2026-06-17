"use client";

import { useRef } from "react";
import { useLayerWorkspace } from "@/features/layers/layer-workspace";
import { useCesiumViewer } from "./hooks/use-cesium-viewer";

export function MapContainer() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { registerViewer } = useLayerWorkspace();
  const { loaded } = useCesiumViewer(containerRef, registerViewer);

  return (
    <div className="absolute inset-0 overflow-hidden bg-secondary">
      <div ref={containerRef} className="cesium-map-container h-full w-full" />
      {!loaded ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="border border-border bg-secondary/85 px-5 py-2 text-sm text-secondary-foreground">
            正在初始化地图场景...
          </div>
        </div>
      ) : null}
    </div>
  );
}
