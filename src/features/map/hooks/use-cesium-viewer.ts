import { useEffect, useRef, useState } from "react";
import type { Viewer } from "cesium";
import {
  destroyViewer,
  initializeViewer,
} from "@/features/map/helpers/cesium-scene-helper";

export function useCesiumViewer(
  containerRef: React.RefObject<HTMLDivElement | null>,
  onViewerChange?: (viewer: Viewer | null) => void,
) {
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
      onViewerChange?.(viewer);
      setLoaded(true);
    };

    void setupViewer();

    return () => {
      cancelled = true;
      onViewerChange?.(null);
      destroyViewer(viewerRef.current);
      viewerRef.current = null;
    };
  }, [containerRef, onViewerChange]);

  return {
    loaded,
    viewerRef,
  };
}
