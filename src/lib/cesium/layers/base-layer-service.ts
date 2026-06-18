import { HeadingPitchRange, type Viewer } from "cesium";
import type { CesiumLayerKind, FlyToOptions, LayerHandle } from "./types";

export abstract class BaseLayerService<TLayer, TAddOptions, TStyle = unknown> {
  protected readonly viewer: Viewer;
  protected readonly id: string;
  protected readonly name: string;
  protected layer: TLayer | null = null;

  protected constructor(options: {
    viewer: Viewer;
    id: string;
    name?: string;
  }) {
    this.viewer = options.viewer;
    this.id = options.id;
    this.name = options.name ?? options.id;
  }

  protected abstract readonly kind: CesiumLayerKind;

  public abstract add(options: TAddOptions): Promise<LayerHandle<TLayer>>;

  public abstract remove(): boolean | Promise<boolean>;

  public abstract updateStyle(style: TStyle): void | Promise<void>;

  public abstract setVisible(visible: boolean): void;

  protected ensureViewer() {
    if (this.viewer.isDestroyed()) {
      throw new Error("Cesium viewer has been destroyed.");
    }
  }

  protected ensureLayer(): TLayer {
    if (!this.layer) {
      throw new Error(`Layer "${this.id}" has not been added.`);
    }

    return this.layer;
  }

  protected createHandle(layer: TLayer): LayerHandle<TLayer> {
    return {
      id: this.id,
      name: this.name,
      kind: this.kind,
      layer,
    };
  }

  public getLayer() {
    return this.layer;
  }

  public getId() {
    return this.id;
  }

  public getName() {
    return this.name;
  }

  protected toHeadingPitchRange(options?: FlyToOptions) {
    if (!options?.offset) {
      return undefined;
    }

    return new HeadingPitchRange(
      options.offset.heading ?? 0,
      options.offset.pitch ?? 0,
      options.offset.range ?? 0,
    );
  }
}
