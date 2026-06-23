import {
  Cartesian3,
  Rectangle,
  type DataSource,
  type Viewer,
} from "cesium";
import { findPrimitiveGeoJsonLayer } from "@/lib/cesium/layers/primitive-geojson-layer-service";
import type {
  InputDataSummary,
  MapCommand,
  MapCommandResult,
} from "@/types/agent";
import type { MapCommandExecutorDependencies } from "./types";

type CameraFlyToCommand = Extract<MapCommand, { action: "camera.flyTo" }>;

export class CameraCommandHandler {
  private readonly dependencies: MapCommandExecutorDependencies;

  public constructor(dependencies: MapCommandExecutorDependencies) {
    this.dependencies = dependencies;
  }

  public async flyToTarget(
    viewer: Viewer,
    command: CameraFlyToCommand,
  ): Promise<MapCommandResult> {
    const duration = this.toDurationSeconds(command.durationMs);

    switch (command.target.kind) {
      case "place":
        if (command.target.bbox) {
          this.flyToBbox(viewer, command.target.bbox, duration);
        } else {
          this.flyToCoordinate(
            viewer,
            command.target.center[0],
            command.target.center[1],
            undefined,
            duration,
          );
        }
        return {
          ok: true,
          action: command.action,
          message: `已定位到${command.target.name}`,
        };
      case "coordinate":
        this.flyToCoordinate(
          viewer,
          command.target.lon,
          command.target.lat,
          command.target.height,
          duration,
        );
        return { ok: true, action: command.action, message: "已定位到坐标" };
      case "bbox":
        this.flyToBbox(viewer, command.target.bbox, duration);
        return { ok: true, action: command.action, message: "已定位到指定范围" };
      case "dataset": {
        const dataset = await this.resolveDataset(command.target.datasetId);
        await this.flyToDataset(viewer, dataset, duration);
        return {
          ok: true,
          action: command.action,
          message: `已定位到${dataset.name}`,
        };
      }
      case "layer": {
        const layer = this.findUserLayer(command.target.layerId);
        if (!layer) {
          throw new Error(`未找到图层：${command.target.layerId}`);
        }

        await this.flyToDataset(viewer, layer.dataset, duration);
        return {
          ok: true,
          action: command.action,
          message: `已定位到${layer.name}`,
        };
      }
    }
  }

  public async flyToDataset(
    viewer: Viewer,
    dataset: InputDataSummary,
    duration = 1.2,
  ) {
    if (dataset.bbox) {
      this.flyToBbox(viewer, dataset.bbox, duration);
      return;
    }

    const dataSource = this.getDataSourceByDatasetId(viewer, dataset.datasetId);
    if (dataSource) {
      await viewer.flyTo(dataSource, { duration });
      return;
    }

    const primitiveLayer = findPrimitiveGeoJsonLayer(
      viewer,
      `user-layer:${dataset.datasetId}`,
    );
    if (primitiveLayer?.__primitiveGeoJsonService) {
      await primitiveLayer.__primitiveGeoJsonService.flyTo({ duration });
      return;
    }

    throw new Error(`数据集缺少空间范围：${dataset.name}`);
  }

  public flyToCoordinate(
    viewer: Viewer,
    lon: number,
    lat: number,
    height = 1800,
    duration = 1.2,
  ) {
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(lon, lat, height),
      duration,
    });
  }

  private toDurationSeconds(durationMs?: number) {
    return durationMs === undefined ? 1.2 : Math.max(durationMs, 0) / 1000;
  }

  private flyToBbox(
    viewer: Viewer,
    bbox: [number, number, number, number],
    duration = 1.2,
  ) {
    const [west, south, east, north] = bbox;
    viewer.camera.flyTo({
      destination: Rectangle.fromDegrees(west, south, east, north),
      duration,
    });
  }

  private async resolveDataset(datasetId: string) {
    const layerDataset = this.dependencies
      .getUserLayers()
      .find((layer) => layer.dataset.datasetId === datasetId)?.dataset;

    return layerDataset ?? this.dependencies.getDataset(datasetId);
  }

  private getDataSourceByDatasetId(
    viewer: Viewer,
    datasetId: string,
  ): DataSource | undefined {
    return viewer.dataSources.getByName(`user-layer:${datasetId}`).at(0);
  }

  private findUserLayer(layerId: string) {
    return this.dependencies
      .getUserLayers()
      .find(
        (layer) => layer.id === layerId || layer.dataset.datasetId === layerId,
      );
  }
}
