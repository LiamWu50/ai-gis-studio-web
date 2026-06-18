import {
  Cesium3DTileStyle,
  Cesium3DTileset,
  Color,
  type Viewer,
} from "cesium";
import { BaseLayerService } from "./base-layer-service";
import { toCesiumColor, withAlpha } from "./color";
import type {
  FlyToOptions,
  TilesetLayerAddOptions,
  TilesetLayerHandle,
  TilesetLayerStyle,
} from "./types";

export class TilesetLayerService extends BaseLayerService<
  Cesium3DTileset,
  TilesetLayerAddOptions,
  TilesetLayerStyle
> {
  protected readonly kind = "tileset" as const;

  public constructor(options: { viewer: Viewer; id: string; name?: string }) {
    super(options);
  }

  public async add(
    options: TilesetLayerAddOptions,
  ): Promise<TilesetLayerHandle> {
    this.ensureViewer();

    const tileset = await Cesium3DTileset.fromUrl(options.url, {
      maximumScreenSpaceError: options.maximumScreenSpaceError,
      dynamicScreenSpaceError: options.dynamicScreenSpaceError,
      cullRequestsWhileMoving: options.cullRequestsWhileMoving,
      modelMatrix: options.modelMatrix,
    });

    this.layer = this.viewer.scene.primitives.add(tileset) as Cesium3DTileset;
    this.updateStyle(options.style ?? {});

    return this.createHandle(this.layer);
  }

  public remove() {
    const tileset = this.layer;
    if (!tileset) return false;

    const removed = this.viewer.scene.primitives.remove(tileset);
    this.layer = null;
    return removed;
  }

  public updateStyle(style: TilesetLayerStyle) {
    const tileset = this.ensureLayer();

    if (typeof style.style !== "undefined") {
      tileset.style =
        style.style instanceof Cesium3DTileStyle
          ? style.style
          : new Cesium3DTileStyle(style.style);
      tileset.makeStyleDirty();
      return;
    }

    if (style.color || typeof style.opacity === "number") {
      const color = withAlpha(
        toCesiumColor(style.color, Color.WHITE),
        style.opacity,
      );
      tileset.style = new Cesium3DTileStyle({
        color: `color('${color.toCssColorString()}')`,
      });
      tileset.makeStyleDirty();
    }
  }

  public setVisible(visible: boolean) {
    this.ensureLayer().show = visible;
  }

  public setMaximumScreenSpaceError(maximumScreenSpaceError: number) {
    this.ensureLayer().maximumScreenSpaceError = maximumScreenSpaceError;
  }

  public async flyTo(options?: FlyToOptions) {
    await this.viewer.flyTo(this.ensureLayer(), {
      duration: options?.duration ?? 1.2,
      offset: this.toHeadingPitchRange(options),
    });
  }
}
