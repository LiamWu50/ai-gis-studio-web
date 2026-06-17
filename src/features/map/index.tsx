"use client";

import { useEffect, useRef, useState } from "react";

import type { Viewer } from "cesium";

import {
  destroyViewer,
  initializeViewer
} from "@/features/map/helpers/cesium-scene-helper";

export function MapContainer() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    let cancelled = false;

    const setupViewer = async () => {
      const viewer = await initializeViewer(containerRef.current as HTMLElement);

      if (cancelled) {
        destroyViewer(viewer);
        return;
      }

      viewerRef.current = viewer;
      setLoaded(true);
    };

    void setupViewer();

    return () => {
      cancelled = true;
      destroyViewer(viewerRef.current);
      viewerRef.current = null;
    };
  }, []);

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
