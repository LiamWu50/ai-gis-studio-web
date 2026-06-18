import {
  Color,
  ColorBlendMode,
  Matrix4,
  Model,
  Transforms,
  type Viewer,
} from "cesium";
import { BaseLayerService } from "./base-layer-service";
import { toCesiumColor } from "./color";
import type {
  FlyToOptions,
  GltfModelLayerAddOptions,
  GltfModelLayerHandle,
  GltfModelStyle,
} from "./types";

export class GltfModelLayerService extends BaseLayerService<
  Model,
  GltfModelLayerAddOptions,
  GltfModelStyle
> {
  protected readonly kind = "gltf-model" as const;

  public constructor(options: { viewer: Viewer; id: string; name?: string }) {
    super(options);
  }

  public async add(
    options: GltfModelLayerAddOptions,
  ): Promise<GltfModelLayerHandle> {
    this.ensureViewer();

    const modelMatrix =
      options.modelMatrix ??
      (options.headingPitchRoll
        ? Transforms.headingPitchRollToFixedFrame(
            options.position,
            options.headingPitchRoll,
          )
        : Transforms.eastNorthUpToFixedFrame(options.position));

    const model = await Model.fromGltfAsync({
      url: options.url,
      modelMatrix,
      scale: options.scale,
      minimumPixelSize: options.minimumPixelSize,
      maximumScale: options.maximumScale,
      allowPicking: options.allowPicking,
      scene: this.viewer.scene,
      id: this.id,
      show: true,
    });

    this.layer = this.viewer.scene.primitives.add(model) as Model;
    this.updateStyle(options.style ?? {});

    return this.createHandle(this.layer);
  }

  public remove() {
    const model = this.layer;
    if (!model) return false;

    const removed = this.viewer.scene.primitives.remove(model);
    this.layer = null;
    return removed;
  }

  public updateStyle(style: GltfModelStyle) {
    const model = this.ensureLayer();

    if (style.color) {
      model.color = toCesiumColor(style.color, Color.WHITE);
    }
    if (style.colorBlendMode) {
      model.colorBlendMode = style.colorBlendMode;
    } else if (style.color) {
      model.colorBlendMode = ColorBlendMode.MIX;
    }
    if (typeof style.colorBlendAmount === "number") {
      model.colorBlendAmount = style.colorBlendAmount;
    }
    if (style.silhouetteColor) {
      model.silhouetteColor = toCesiumColor(style.silhouetteColor, Color.RED);
    }
    if (typeof style.silhouetteSize === "number") {
      model.silhouetteSize = style.silhouetteSize;
    }
  }

  public setVisible(visible: boolean) {
    this.ensureLayer().show = visible;
  }

  public setModelMatrix(modelMatrix: Matrix4) {
    this.ensureLayer().modelMatrix = modelMatrix;
  }

  public async flyTo(options?: FlyToOptions) {
    await this.viewer.camera.flyToBoundingSphere(this.ensureLayer().boundingSphere, {
      duration: options?.duration ?? 1.2,
      offset: this.toHeadingPitchRange(options),
    });
  }
}
