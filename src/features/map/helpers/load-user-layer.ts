import {
  Rectangle,
  type DataSource,
  type Viewer,
} from "cesium";
import { GeoJsonLayerService } from "@/lib/cesium/layers/geojson-layer-service";
import {
  findPrimitiveGeoJsonLayer,
  isPrimitiveGeoJsonLayer,
  PrimitiveGeoJsonLayerService,
} from "@/lib/cesium/layers/primitive-geojson-layer-service";
import type { PrimitiveGeoJsonLayerContainer } from "@/lib/cesium/layers/types";
import { getDatasetPreview } from "@/services/gis-data";
import type { InputDataSummary } from "@/types/agent";

export type LoadUserLayerResult =
  | { status: "loaded"; layer: DataSource | PrimitiveGeoJsonLayerContainer }
  | { status: "skipped"; reason: string };

const GEOJSON_GEOMETRY_TYPES = new Set<InputDataSummary["geometryType"]>([
  "Point",
  "LineString",
  "Polygon",
  "MultiPoint",
  "MultiLineString",
  "MultiPolygon",
  "Mixed",
]);

const isGeoJsonDataset = (dataset: InputDataSummary) =>
  dataset.sourceType !== "map_service" &&
  dataset.geometryType !== "Raster" &&
  GEOJSON_GEOMETRY_TYPES.has(dataset.geometryType ?? null);

const getLayerDataSourceName = (dataset: InputDataSummary) =>
  `user-layer:${dataset.datasetId}`;

const getPreviewLimit = (dataset: InputDataSummary) =>
  dataset.sourceType === "sample"
    ? Math.min(dataset.featureCount ?? 300, 300)
    : 1000;

export const loadUserLayerToMap = async (
  viewer: Viewer | null,
  dataset: InputDataSummary,
  options?: { flyTo?: boolean },
): Promise<LoadUserLayerResult> => {
  if (!viewer || viewer.isDestroyed()) {
    return { status: "skipped", reason: "地图尚未初始化" };
  }

  if (!isGeoJsonDataset(dataset)) {
    return { status: "skipped", reason: "暂不支持该数据类型上图" };
  }

  const existingDataSource = viewer.dataSources
    .getByName(getLayerDataSourceName(dataset))
    .at(0);
  const existingPrimitiveLayer = findPrimitiveGeoJsonLayer(
    viewer,
    getLayerDataSourceName(dataset),
  );

  if (existingDataSource) {
    if (options?.flyTo) {
      await flyToDataset(viewer, dataset, existingDataSource);
    }
    return { status: "loaded", layer: existingDataSource };
  }

  if (existingPrimitiveLayer) {
    if (options?.flyTo) {
      await flyToDataset(viewer, dataset, existingPrimitiveLayer);
    }
    return { status: "loaded", layer: existingPrimitiveLayer };
  }

  const preview = await getDatasetPreview(
    dataset.datasetId,
    getPreviewLimit(dataset),
  );
  if (!preview.data || typeof preview.data !== "object") {
    return { status: "skipped", reason: "数据预览为空，无法上图" };
  }

  const { layer } =
    dataset.sourceType === "sample"
      ? await new PrimitiveGeoJsonLayerService({
          viewer,
          id: getLayerDataSourceName(dataset),
          name: dataset.name,
        }).add({
          data: preview.data,
          bbox: preview.bbox ?? dataset.bbox,
          clampToGround: true,
        })
      : await new GeoJsonLayerService({
          viewer,
          id: getLayerDataSourceName(dataset),
          name: dataset.name,
        }).add({
          data: preview.data,
          clampToGround: true,
        });
  if (options?.flyTo) {
    await flyToDataset(viewer, dataset, layer);
  }

  return { status: "loaded", layer };
};

const flyToDataset = async (
  viewer: Viewer,
  dataset: InputDataSummary,
  layer: DataSource | PrimitiveGeoJsonLayerContainer,
) => {
  if (dataset.bbox) {
    const [west, south, east, north] = dataset.bbox;
    viewer.camera.flyTo({
      destination: Rectangle.fromDegrees(west, south, east, north),
      duration: 1.2,
    });
    return;
  }

  if (isPrimitiveGeoJsonLayer(layer)) {
    const primitiveService = layer.__primitiveGeoJsonService;
    await primitiveService?.flyTo({ duration: 1.2 });
    return;
  }

  await viewer.flyTo(layer, {
    duration: 1.2,
  });
};
