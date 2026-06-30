import type { Viewer } from "cesium";
import { Cartesian2, Cartographic, Math as CesiumMath } from "cesium";
import type { UserLayer } from "@/features/layers/layer-workspace";

export type AiChatMetadata = {
  mapView?: {
    center?: [number, number];
    height?: number;
    bbox?: [number, number, number, number];
    crs?: "EPSG:4326";
  };
  layers: Array<{
    id: string;
    layerId: string;
    datasetId: string;
    name: string;
    visible: boolean;
    opacity: number;
    geometryType?: string | null;
    bbox?: [number, number, number, number] | null;
    dataRef?: string;
  }>;
  activeDatasetIds: string[];
  clientCapabilities: {
    mapCommands: string[];
  };
};

export type BuildChatContextOptions = {
  userLayers: UserLayer[];
  viewer: Viewer | null;
};

export type BuildChatContextResult = {
  selectedDatasetIds: string[];
  selectedServiceIds: string[];
  metadata: AiChatMetadata;
};

const MAP_COMMAND_CAPABILITIES = [
  "camera.flyTo",
  "layer.addDataset",
  "layer.setVisible",
  "layer.setOpacity",
  "overlay.addMarker",
  "map.clearTemporary",
];

const uniqueStrings = (values: string[]) => Array.from(new Set(values));

const hasDatasetId = (
  layer: UserLayer,
): layer is UserLayer & { dataset: UserLayer["dataset"] & { datasetId: string } } =>
  Boolean(layer.dataset.datasetId.trim());

const isLayerVisible = (layer: UserLayer) => layer.node.visible;

const toLayerMetadata = (layer: UserLayer) => ({
  id: layer.id,
  layerId: layer.id,
  datasetId: layer.dataset.datasetId,
  name: layer.name,
  visible: layer.node.visible,
  opacity: layer.node.opacity,
  geometryType: layer.dataset.geometryType ?? layer.node.geometryType,
  bbox: layer.dataset.bbox ?? layer.node.bbox,
  dataRef: layer.dataset.dataRef,
});

const getCameraCenter = (viewer: Viewer): [number, number] | undefined => {
  const scene = viewer.scene;
  const canvas = scene.canvas;
  const centerCartesian = viewer.camera.pickEllipsoid(
    new Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2),
    scene.globe.ellipsoid,
  );

  if (!centerCartesian) return undefined;

  const cartographic = Cartographic.fromCartesian(centerCartesian);
  return [
    Number(CesiumMath.toDegrees(cartographic.longitude).toFixed(6)),
    Number(CesiumMath.toDegrees(cartographic.latitude).toFixed(6)),
  ];
};

const getCameraBbox = (
  viewer: Viewer,
): [number, number, number, number] | undefined => {
  const rectangle = viewer.camera.computeViewRectangle(
    viewer.scene.globe.ellipsoid,
  );

  if (!rectangle) return undefined;

  return [
    Number(CesiumMath.toDegrees(rectangle.west).toFixed(6)),
    Number(CesiumMath.toDegrees(rectangle.south).toFixed(6)),
    Number(CesiumMath.toDegrees(rectangle.east).toFixed(6)),
    Number(CesiumMath.toDegrees(rectangle.north).toFixed(6)),
  ];
};

const getMapView = (viewer: Viewer | null): AiChatMetadata["mapView"] => {
  if (!viewer || viewer.isDestroyed()) return undefined;

  return {
    center: getCameraCenter(viewer),
    height: Number(viewer.camera.positionCartographic.height.toFixed(2)),
    bbox: getCameraBbox(viewer),
    crs: "EPSG:4326",
  };
};

export const buildChatContext = ({
  userLayers,
  viewer,
}: BuildChatContextOptions): BuildChatContextResult => {
  const validLayers = userLayers.filter(hasDatasetId);
  const activeLayers = validLayers.filter(isLayerVisible);

  const selectedDatasetIds = uniqueStrings(
    activeLayers.map((layer) => layer.dataset.datasetId),
  );

  return {
    selectedDatasetIds,
    selectedServiceIds: [],
    metadata: {
      mapView: getMapView(viewer),
      layers: validLayers.map(toLayerMetadata),
      activeDatasetIds: selectedDatasetIds,
      clientCapabilities: {
        mapCommands: MAP_COMMAND_CAPABILITIES,
      },
    },
  };
};
