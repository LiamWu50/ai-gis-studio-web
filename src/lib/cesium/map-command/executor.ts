import type { Viewer } from "cesium";
import type { MapCommand, MapCommandResult } from "@/types/agent";
import { CameraCommandHandler } from "./camera-command-handler";
import { LayerCommandHandler } from "./layer-command-handler";
import { OverlayCommandHandler } from "./overlay-command-handler";
import type { MapCommandExecutorDependencies } from "./types";

export class MapCommandExecutor {
  private readonly dependencies: MapCommandExecutorDependencies;
  private readonly cameraCommandHandler: CameraCommandHandler;
  private readonly layerCommandHandler: LayerCommandHandler;
  private readonly overlayCommandHandler: OverlayCommandHandler;

  public constructor(dependencies: MapCommandExecutorDependencies) {
    this.dependencies = dependencies;
    this.cameraCommandHandler = new CameraCommandHandler(dependencies);
    this.layerCommandHandler = new LayerCommandHandler(
      dependencies,
      this.cameraCommandHandler,
    );
    this.overlayCommandHandler = new OverlayCommandHandler();
  }

  public async execute(command: MapCommand): Promise<MapCommandResult> {
    const viewer = this.getReadyViewer();

    switch (command.action) {
      case "camera.flyTo":
        return this.cameraCommandHandler.flyToTarget(viewer, command);
      case "layer.addDataset":
        return this.layerCommandHandler.addDatasetLayer(viewer, command);
      case "layer.setVisible":
        this.layerCommandHandler.setLayerVisibility(
          viewer,
          command.layerId,
          command.visible,
        );
        return {
          ok: true,
          action: command.action,
          message: command.visible ? "图层已显示" : "图层已隐藏",
        };
      case "layer.setOpacity":
        this.layerCommandHandler.setLayerOpacity(
          viewer,
          command.layerId,
          command.opacity,
        );
        return {
          ok: true,
          action: command.action,
          message: "图层透明度已更新",
        };
      case "overlay.addMarker":
        this.overlayCommandHandler.addTemporaryMarker(viewer, command);
        if (command.flyTo) {
          this.cameraCommandHandler.flyToCoordinate(
            viewer,
            command.position[0],
            command.position[1],
          );
        }
        return {
          ok: true,
          action: command.action,
          message: command.label ? `已添加标记：${command.label}` : "已添加标记",
        };
      case "map.clearTemporary":
        this.overlayCommandHandler.clearTemporary(viewer, command.target ?? "all");
        return {
          ok: true,
          action: command.action,
          message: "临时地图结果已清除",
        };
      default:
        return this.assertNever(command);
    }
  }

  private getReadyViewer(): Viewer {
    const viewer = this.dependencies.getViewer();

    if (!viewer || viewer.isDestroyed()) {
      throw new Error("地图尚未初始化");
    }

    return viewer;
  }

  private assertNever(value: never): never {
    throw new Error(`不支持的地图命令：${JSON.stringify(value)}`);
  }
}
