import {
  ArcGisMapServerImageryProvider,
  ImageryLayer,
  UrlTemplateImageryProvider,
  WebMapServiceImageryProvider,
  WebMapTileServiceImageryProvider,
  type ImageryProvider,
  type Viewer,
} from "cesium";
import { BaseLayerService } from "./base-layer-service";
import type {
  FlyToOptions,
  ImageryLayerAddOptions,
  ImageryLayerHandle,
  ImageryLayerStyle,
} from "./types";

export class ImageryLayerService extends BaseLayerService<
  ImageryLayer,
  ImageryLayerAddOptions,
  ImageryLayerStyle
> {
  protected readonly kind = "imagery" as const;

  public constructor(options: { viewer: Viewer; id: string; name?: string }) {
    super(options);
  }

  public async add(options: ImageryLayerAddOptions): Promise<ImageryLayerHandle> {
    this.ensureViewer();

    const provider = await createImageryProvider(options);
    const layer = new ImageryLayer(provider, {
      ...options.layerOptions,
      rectangle: options.rectangle ?? options.layerOptions?.rectangle,
      show: options.layerOptions?.show ?? true,
    });

    this.viewer.imageryLayers.add(layer);
    this.layer = layer;
    this.updateStyle(options.style ?? {});

    return this.createHandle(this.layer);
  }

  public remove() {
    const layer = this.layer;
    if (!layer) return false;

    const removed = this.viewer.imageryLayers.remove(layer, true);
    this.layer = null;
    return removed;
  }

  public updateStyle(style: ImageryLayerStyle) {
    const layer = this.ensureLayer();

    if (typeof style.alpha === "number") layer.alpha = style.alpha;
    if (typeof style.brightness === "number") layer.brightness = style.brightness;
    if (typeof style.contrast === "number") layer.contrast = style.contrast;
    if (typeof style.hue === "number") layer.hue = style.hue;
    if (typeof style.saturation === "number") layer.saturation = style.saturation;
    if (typeof style.gamma === "number") layer.gamma = style.gamma;
  }

  public setVisible(visible: boolean) {
    this.ensureLayer().show = visible;
  }

  public async flyTo(options?: FlyToOptions) {
    await this.viewer.flyTo(this.ensureLayer(), {
      duration: options?.duration ?? 1.2,
      offset: this.toHeadingPitchRange(options),
    });
  }
}

async function createImageryProvider(
  options: ImageryLayerAddOptions,
): Promise<ImageryProvider> {
  switch (options.type) {
    case "url-template":
    case "xyz":
      return new UrlTemplateImageryProvider({
        url: options.url,
        subdomains: options.subdomains,
        minimumLevel: options.minimumLevel,
        maximumLevel: options.maximumLevel,
        rectangle: options.rectangle,
        credit: options.credit,
      });

    case "wms":
      return new WebMapServiceImageryProvider({
        url: options.url,
        layers: options.layers,
        parameters: options.parameters,
        getFeatureInfoParameters: options.getFeatureInfoParameters,
        enablePickFeatures: options.enablePickFeatures,
        rectangle: options.rectangle,
        credit: options.credit,
      });

    case "wmts":
      return new WebMapTileServiceImageryProvider({
        url: options.url,
        layer: options.layer,
        style: options.style ?? "default",
        format: options.format ?? "image/png",
        tileMatrixSetID: options.tileMatrixSetID,
        tileMatrixLabels: options.tileMatrixLabels,
        minimumLevel: options.minimumLevel,
        maximumLevel: options.maximumLevel,
        rectangle: options.rectangle,
        credit: options.credit,
      });

    case "arcgis":
      return ArcGisMapServerImageryProvider.fromUrl(
        options.url,
        options.providerOptions,
      );
  }
}
