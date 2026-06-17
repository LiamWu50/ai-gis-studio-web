"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Activity,
  Building2,
  Camera,
  FileJson,
  Layers,
  Map as MapIcon,
  MapPinned,
  Route,
  Satellite,
  SquareDashedMousePointer,
  Tags,
  TrafficCone,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import type { Viewer } from "cesium";
import type { FileTreeElement } from "@/components/unlumen-ui/file-tree";
import { loadUserLayerToMap } from "@/features/map/helpers/load-user-layer";
import { useAuthSession } from "@/features/user/hooks/use-auth-session";
import {
  createDatasetLayer,
  getLayerTree,
  type LayerTreeNode,
} from "@/services/user-layers";
import type { InputDataSummary } from "@/types/agent";
import { LAYER_ELEMENTS } from "./layer-data";

export type UserLayerLoadStatus = "pending" | "loaded" | "skipped" | "failed";

export type UserLayer = {
  id: string;
  name: string;
  node: LayerTreeNode;
  dataset: InputDataSummary;
  loadStatus: UserLayerLoadStatus;
  loadMessage?: string;
};

type LayerWorkspaceContextValue = {
  addUserLayerFromDataset: (dataset: InputDataSummary) => Promise<UserLayer>;
  layerElements: FileTreeElement[];
  registerViewer: (viewer: Viewer | null) => void;
  userLayers: UserLayer[];
};

const LayerWorkspaceContext =
  createContext<LayerWorkspaceContextValue | null>(null);

const toUserLayer = (
  node: LayerTreeNode,
  dataset: InputDataSummary,
  loadStatus: UserLayerLoadStatus = "pending",
): UserLayer => ({
  id: node.id,
  name: node.name,
  node,
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

const iconByKey = {
  activity: Activity,
  building: Building2,
  "building-2": Building2,
  camera: Camera,
  layers: Layers,
  map: MapIcon,
  "map-pinned": MapPinned,
  route: Route,
  satellite: Satellite,
  "square-dashed-mouse-pointer": SquareDashedMousePointer,
  tags: Tags,
  "traffic-cone": TrafficCone,
  "user-round": UserRound,
};

const resolveLayerIcon = (iconKey: string | null) =>
  iconKey ? iconByKey[iconKey as keyof typeof iconByKey] : undefined;

const toLayerTreeElement = (node: LayerTreeNode): FileTreeElement => ({
  id: node.id,
  name: node.name,
  type: node.type === "folder" ? "folder" : "file",
  icon: resolveLayerIcon(node.iconKey),
  children: node.children.map(toLayerTreeElement),
});

const hasNode = (nodes: LayerTreeNode[], nodeId: string): boolean =>
  nodes.some((node) => node.id === nodeId || hasNode(node.children, nodeId));

const replaceNode = (
  nodes: LayerTreeNode[],
  nextNode: LayerTreeNode,
): LayerTreeNode[] =>
  nodes.map((node) => {
    if (node.id === nextNode.id) return nextNode;

    return {
      ...node,
      children: replaceNode(node.children, nextNode),
    };
  });

const appendNodeToParent = (
  nodes: LayerTreeNode[],
  nextNode: LayerTreeNode,
): LayerTreeNode[] =>
  nodes.map((node) => {
    if (node.id === nextNode.parentId) {
      return {
        ...node,
        children: [
          ...node.children.filter((child) => child.id !== nextNode.id),
          nextNode,
        ],
      };
    }

    return {
      ...node,
      children: appendNodeToParent(node.children, nextNode),
    };
  });

const upsertNode = (
  nodes: LayerTreeNode[],
  nextNode: LayerTreeNode,
): LayerTreeNode[] => {
  if (hasNode(nodes, nextNode.id)) {
    return replaceNode(nodes, nextNode);
  }

  return appendNodeToParent(nodes, nextNode);
};

const toFallbackDataset = (node: LayerTreeNode): InputDataSummary => ({
  datasetId: node.datasetId ?? node.id,
  name: node.name,
  sourceType: node.sourceType === "url" ? "url" : "upload",
  geometryType:
    node.geometryType === "Point" ||
    node.geometryType === "LineString" ||
    node.geometryType === "Polygon" ||
    node.geometryType === "MultiPoint" ||
    node.geometryType === "MultiLineString" ||
    node.geometryType === "MultiPolygon" ||
    node.geometryType === "Mixed" ||
    node.geometryType === "Raster"
      ? node.geometryType
      : null,
  featureCount: null,
  bbox: node.bbox,
  fields: [],
  warnings: [],
  dataRef: `dataset:${node.datasetId ?? node.id}`,
});

const collectUserLayers = (
  nodes: LayerTreeNode[],
  existingLayers: UserLayer[],
): UserLayer[] => {
  const existingById = new Map(existingLayers.map((layer) => [layer.id, layer]));

  return nodes.flatMap((node) => {
    const childLayers = collectUserLayers(node.children, existingLayers);

    if (!node.datasetId) return childLayers;

    const existing = existingById.get(node.id);
    const dataset = existing?.dataset ?? toFallbackDataset(node);

    return [
      {
        id: node.id,
        name: node.name,
        node,
        dataset,
        loadStatus: existing?.loadStatus ?? "pending",
        loadMessage: existing?.loadMessage,
      },
      ...childLayers,
    ];
  });
};

export function LayerWorkspaceProvider({ children }: { children: ReactNode }) {
  const { accessToken, isLoggedIn } = useAuthSession();
  const viewerRef = useRef<Viewer | null>(null);
  const activeTreeTokenRef = useRef<string | null>(null);
  const [layerTreeNodes, setLayerTreeNodes] = useState<LayerTreeNode[] | null>(
    null,
  );
  const [userLayers, setUserLayers] = useState<UserLayer[]>([]);

  const registerViewer = useCallback((viewer: Viewer | null) => {
    viewerRef.current = viewer;
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !accessToken) {
      activeTreeTokenRef.current = null;
      return;
    }

    activeTreeTokenRef.current = accessToken;
    let isMounted = true;

    const initializeLayerTree = async () => {
      try {
        const response = await getLayerTree(accessToken);
        if (!isMounted || activeTreeTokenRef.current !== accessToken) return;

        setLayerTreeNodes(response.nodes);
        setUserLayers((currentLayers) =>
          collectUserLayers(response.nodes, currentLayers),
        );
      } catch {
        if (!isMounted || activeTreeTokenRef.current !== accessToken) return;

        setLayerTreeNodes(null);
        setUserLayers([]);
      }
    };

    void initializeLayerTree();

    return () => {
      isMounted = false;
    };
  }, [accessToken, isLoggedIn]);

  const addUserLayerFromDataset = useCallback(
    async (dataset: InputDataSummary) => {
      if (!accessToken) {
        throw new Error("请先登录后再添加图层");
      }

      const node = await createDatasetLayer(accessToken, {
        datasetId: dataset.datasetId,
        name: dataset.name,
        visible: true,
        opacity: 1,
      });
      const savedLayer = toUserLayer(node, dataset);

      setLayerTreeNodes((currentNodes) =>
        currentNodes ? upsertNode(currentNodes, node) : currentNodes,
      );
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
    [accessToken],
  );

  const layerElements = useMemo(
    () => {
      if (isLoggedIn && layerTreeNodes) {
        return layerTreeNodes.map(toLayerTreeElement);
      }

      const userLayerElements = userLayers.map(toUserLayerElement);

      return LAYER_ELEMENTS.map((element) =>
        element.id === "user-layers"
          ? {
              ...element,
              children: userLayerElements,
            }
          : element,
      );
    },
    [isLoggedIn, layerTreeNodes, userLayers],
  );

  const value = useMemo(
    () => ({
      addUserLayerFromDataset,
      layerElements,
      registerViewer,
      userLayers,
    }),
    [addUserLayerFromDataset, layerElements, registerViewer, userLayers],
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
