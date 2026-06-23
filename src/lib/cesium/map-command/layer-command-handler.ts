import {
  Color,
  ColorMaterialProperty,
  ConstantProperty,
  type DataSource,
  type Viewer,
} from "cesium";
import {
  findPrimitiveGeoJsonLayer,
  isPrimitiveGeoJsonLayer,
  setPrimitiveGeoJsonLayerOpacity,
} from "@/lib/cesium/layers/primitive-geojson-layer-service";
import type { PrimitiveGeoJsonLayerContainer } from "@/lib/cesium/layers/types";
import type { MapCommand, MapCommandResult } from "@/types/agent";
import type { CameraCommandHandler } from "./camera-command-handler";
import type { MapCommandExecutorDependencies } from "./types";

type LayerAddDatasetCommand = Extract<MapCommand, { action: "layer.addDataset" }>;

export class LayerCommandHandler {
  private readonly dependencies: MapCommandExecutorDependencies;
  private readonly cameraCommandHandler: CameraCommandHandler;

  public constructor(
    dependencies: MapCommandExecutorDependencies,
    cameraCommandHandler: CameraCommandHandler,
  ) {
    this.dependencies = dependencies;
    this.cameraCommandHandler = cameraCommandHandler;
  }

  public async addDatasetLayer(
    viewer: Viewer,
    command: LayerAddDatasetCommand,
  ): Promise<MapCommandResult> {
    const dataset = await this.dependencies.getDataset(command.datasetId);
    await this.dependencies.addUserLayerFromDataset(dataset, {
      name: command.name,
      opacity: command.opacity,
      visible: command.visible,
    });

    if (command.flyTo ?? true) {
      await this.cameraCommandHandler.flyToDataset(viewer, dataset);
    }

    return {
      ok: true,
      action: command.action,
      message: `已添加图层：${command.name ?? dataset.name}`,
    };
  }

  public setLayerVisibility(
    viewer: Viewer,
    layerId: string,
    visible: boolean,
  ) {
    const layer = this.getLoadedLayer(viewer, layerId);
    layer.show = visible;
  }

  public setLayerOpacity(viewer: Viewer, layerId: string, opacity: number) {
    const layer = this.getLoadedLayer(viewer, layerId);
    const clampedOpacity = Math.min(Math.max(opacity, 0), 1);

    if (isPrimitiveGeoJsonLayer(layer)) {
      setPrimitiveGeoJsonLayerOpacity(layer, clampedOpacity);
      return;
    }

    layer.entities.values.forEach((entity) => {
      if (entity.point) {
        entity.point.color = new ConstantProperty(
          Color.YELLOW.withAlpha(clampedOpacity),
        );
      }
      if (entity.polygon) {
        entity.polygon.material = new ColorMaterialProperty(
          Color.BLUE.withAlpha(clampedOpacity * 0.35),
        );
      }
      if (entity.polyline) {
        entity.polyline.material = new ColorMaterialProperty(
          Color.CYAN.withAlpha(clampedOpacity),
        );
      }
    });
  }

  private getLoadedLayer(
    viewer: Viewer,
    layerId: string,
  ): DataSource | PrimitiveGeoJsonLayerContainer {
    const userLayerDatasetId = this.findUserLayer(layerId)?.dataset.datasetId;
    const layer =
      viewer.dataSources.getByName(layerId).at(0) ??
      viewer.dataSources.getByName(`user-layer:${layerId}`).at(0) ??
      (userLayerDatasetId
        ? viewer.dataSources.getByName(`user-layer:${userLayerDatasetId}`).at(0)
        : undefined) ??
      findPrimitiveGeoJsonLayer(viewer, layerId) ??
      findPrimitiveGeoJsonLayer(viewer, `user-layer:${layerId}`) ??
      (userLayerDatasetId
        ? findPrimitiveGeoJsonLayer(viewer, `user-layer:${userLayerDatasetId}`)
        : undefined);

    if (!layer) {
      throw new Error(`未找到已加载图层：${layerId}`);
    }

    return layer;
  }

  private findUserLayer(layerId: string) {
    return this.dependencies
      .getUserLayers()
      .find(
        (layer) => layer.id === layerId || layer.dataset.datasetId === layerId,
      );
  }
}
