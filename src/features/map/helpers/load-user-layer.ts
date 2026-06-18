import {
  Rectangle,
  type DataSource,
  type Viewer,
} from "cesium";
import { GeoJsonLayerService } from "@/lib/cesium";
import { getDatasetPreview } from "@/services/gis-data";
import type { InputDataSummary } from "@/types/agent";

export type LoadUserLayerResult =
  | { status: "loaded"; dataSource: DataSource }
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

export const loadUserLayerToMap = async (
  viewer: Viewer | null,
  dataset: InputDataSummary,
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

  if (existingDataSource) {
    await flyToDataset(viewer, dataset, existingDataSource);
    return { status: "loaded", dataSource: existingDataSource };
  }

  const preview = await getDatasetPreview(dataset.datasetId, 1000);
  if (!preview.data || typeof preview.data !== "object") {
    return { status: "skipped", reason: "数据预览为空，无法上图" };
  }

  const service = new GeoJsonLayerService({
    viewer,
    id: getLayerDataSourceName(dataset),
    name: dataset.name,
  });
  const { layer: dataSource } = await service.add({
    data: preview.data,
    clampToGround: true,
  });
  await flyToDataset(viewer, dataset, dataSource);

  return { status: "loaded", dataSource };
};

const flyToDataset = async (
  viewer: Viewer,
  dataset: InputDataSummary,
  dataSource: DataSource,
) => {
  if (dataset.bbox) {
    const [west, south, east, north] = dataset.bbox;
    viewer.camera.flyTo({
      destination: Rectangle.fromDegrees(west, south, east, north),
      duration: 1.2,
    });
    return;
  }

  await viewer.flyTo(dataSource, {
    duration: 1.2,
  });
};
