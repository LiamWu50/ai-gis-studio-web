"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FileJson, TriangleAlert } from "lucide-react";
import type { Viewer } from "cesium";
import type { FileTreeElement } from "@/components/unlumen-ui/file-tree";
import { loadUserLayerToMap } from "@/features/map/helpers/load-user-layer";
import { saveUserLayer } from "@/services/user-layers";
import type { InputDataSummary } from "@/types/agent";

export type UserLayerLoadStatus = "pending" | "loaded" | "skipped" | "failed";

export type UserLayer = {
  id: string;
  name: string;
  dataset: InputDataSummary;
  loadStatus: UserLayerLoadStatus;
  loadMessage?: string;
};

type LayerWorkspaceContextValue = {
  addUserLayerFromDataset: (dataset: InputDataSummary) => Promise<UserLayer>;
  registerViewer: (viewer: Viewer | null) => void;
  userLayerElements: FileTreeElement[];
  userLayers: UserLayer[];
};

const LayerWorkspaceContext =
  createContext<LayerWorkspaceContextValue | null>(null);

const getUserLayerId = (datasetId: string) => `user-layer:${datasetId}`;

const toUserLayer = (
  dataset: InputDataSummary,
  loadStatus: UserLayerLoadStatus = "pending",
): UserLayer => ({
  id: getUserLayerId(dataset.datasetId),
  name: dataset.name,
  dataset,
  loadStatus,
});

const upsertLayer = (layers: UserLayer[], nextLayer: UserLayer) => [
  nextLayer,
  ...layers.filter((layer) => layer.id !== nextLayer.id),
];

const toUserLayerElement = (layer: UserLayer): FileTreeElement => ({
  id: layer.id,
  name:
    layer.loadStatus === "skipped" || layer.loadStatus === "failed"
      ? `${layer.name}（未上图）`
      : layer.name,
  icon:
    layer.loadStatus === "skipped" || layer.loadStatus === "failed"
      ? TriangleAlert
      : FileJson,
  highlight: layer.loadStatus === "loaded",
});

export function LayerWorkspaceProvider({ children }: { children: ReactNode }) {
  const viewerRef = useRef<Viewer | null>(null);
  const [userLayers, setUserLayers] = useState<UserLayer[]>([]);

  const registerViewer = useCallback((viewer: Viewer | null) => {
    viewerRef.current = viewer;
  }, []);

  const addUserLayerFromDataset = useCallback(
    async (dataset: InputDataSummary) => {
      const draftLayer = toUserLayer(dataset);
      const savedLayer = await saveUserLayer(draftLayer);
      setUserLayers((currentLayers) => upsertLayer(currentLayers, savedLayer));

      try {
        const loadResult = await loadUserLayerToMap(viewerRef.current, dataset);
        const loadedLayer: UserLayer =
          loadResult.status === "loaded"
            ? { ...savedLayer, loadStatus: "loaded" }
            : {
                ...savedLayer,
                loadStatus: "skipped",
                loadMessage: loadResult.reason,
              };

        setUserLayers((currentLayers) =>
          upsertLayer(currentLayers, loadedLayer),
        );
        return loadedLayer;
      } catch (error) {
        const failedLayer: UserLayer = {
          ...savedLayer,
          loadStatus: "failed",
          loadMessage: error instanceof Error ? error.message : "图层加载失败",
        };
        setUserLayers((currentLayers) =>
          upsertLayer(currentLayers, failedLayer),
        );
        return failedLayer;
      }
    },
    [],
  );

  const userLayerElements = useMemo(
    () => userLayers.map(toUserLayerElement),
    [userLayers],
  );

  const value = useMemo(
    () => ({
      addUserLayerFromDataset,
      registerViewer,
      userLayerElements,
      userLayers,
    }),
    [addUserLayerFromDataset, registerViewer, userLayerElements, userLayers],
  );

  return (
    <LayerWorkspaceContext.Provider value={value}>
      {children}
    </LayerWorkspaceContext.Provider>
  );
}

export function useLayerWorkspace() {
  const context = useContext(LayerWorkspaceContext);

  if (!context) {
    throw new Error(
      "useLayerWorkspace must be used within LayerWorkspaceProvider",
    );
  }

  return context;
}
