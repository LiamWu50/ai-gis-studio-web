import {
  Color,
  ColorMaterialProperty,
  ConstantProperty,
  GeoJsonDataSource,
  HeightReference,
  type Entity,
  type Viewer,
} from "cesium";
import { BaseLayerService } from "./base-layer-service";
import { toCesiumColor } from "./color";
import type {
  FlyToOptions,
  GeoJsonLayerAddOptions,
  GeoJsonLayerHandle,
  GeoJsonLayerStyle,
} from "./types";

const DEFAULT_GEOJSON_STYLE: Required<GeoJsonLayerStyle> = {
  point: {
    color: Color.YELLOW,
    outlineColor: Color.WHITE,
    outlineWidth: 2,
    pixelSize: 10,
  },
  line: {
    color: Color.CYAN,
    width: 3,
    clampToGround: true,
  },
  polygon: {
    fillColor: Color.BLUE.withAlpha(0.35),
    outlineColor: Color.WHITE,
    outlineWidth: 2,
    showOutline: true,
    clampToGround: true,
  },
};

const GROUND_CLAMPED_STYLE = {
  line: {
    clampToGround: true,
  },
  polygon: {
    clampToGround: true,
  },
} satisfies Pick<Required<GeoJsonLayerStyle>, "line" | "polygon">;

export class GeoJsonLayerService extends BaseLayerService<
  GeoJsonDataSource,
  GeoJsonLayerAddOptions,
  GeoJsonLayerStyle
> {
  protected readonly kind = "geojson" as const;

  public constructor(options: { viewer: Viewer; id: string; name?: string }) {
    super(options);
  }

  public async add(options: GeoJsonLayerAddOptions): Promise<GeoJsonLayerHandle> {
    this.ensureViewer();

    const existingDataSource = this.viewer.dataSources.getByName(this.id).at(0);
    if (existingDataSource instanceof GeoJsonDataSource) {
      this.layer = existingDataSource;
      if (options.style) {
        this.updateStyle(options.style);
      }
      return this.createHandle(existingDataSource);
    }

    const style = mergeGeoJsonStyle(options.style);
    const dataSource = await GeoJsonDataSource.load(options.data, {
      clampToGround: true,
      sourceUri: options.sourceUri,
      markerColor: toCesiumColor(style.point.color, Color.YELLOW),
      markerSize: style.point.pixelSize,
      stroke: toCesiumColor(style.line.color, Color.CYAN),
      strokeWidth: style.line.width,
      fill: toCesiumColor(style.polygon.fillColor, Color.BLUE.withAlpha(0.35)),
    });

    dataSource.name = this.id;
    await this.viewer.dataSources.add(dataSource);
    this.layer = dataSource;
    this.updateStyle(style);

    return this.createHandle(dataSource);
  }

  public remove() {
    const dataSource = this.layer;
    if (!dataSource) return false;

    const removed = this.viewer.dataSources.remove(dataSource, true);
    this.layer = null;
    return removed;
  }

  public updateStyle(style: GeoJsonLayerStyle) {
    const dataSource = this.ensureLayer();
    const mergedStyle = mergeGeoJsonStyle(style);
    dataSource.entities.values.forEach((entity) =>
      applyEntityStyle(entity, mergedStyle),
    );
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

export function mergeGeoJsonStyle(style?: GeoJsonLayerStyle) {
  return {
    point: {
      ...DEFAULT_GEOJSON_STYLE.point,
      ...style?.point,
    },
    line: {
      ...DEFAULT_GEOJSON_STYLE.line,
      ...style?.line,
      ...GROUND_CLAMPED_STYLE.line,
    },
    polygon: {
      ...DEFAULT_GEOJSON_STYLE.polygon,
      ...style?.polygon,
      ...GROUND_CLAMPED_STYLE.polygon,
    },
  };
}

export function applyEntityStyle(
  entity: Entity,
  style: ReturnType<typeof mergeGeoJsonStyle>,
) {
  if (entity.point) {
    entity.point.color = new ConstantProperty(
      toCesiumColor(style.point.color, Color.YELLOW),
    );
    entity.point.outlineColor = new ConstantProperty(
      toCesiumColor(style.point.outlineColor, Color.WHITE),
    );
    entity.point.outlineWidth = new ConstantProperty(style.point.outlineWidth);
    entity.point.pixelSize = new ConstantProperty(style.point.pixelSize);
    entity.point.heightReference = new ConstantProperty(
      HeightReference.CLAMP_TO_GROUND,
    );
  }

  if (entity.polyline) {
    entity.polyline.material = new ColorMaterialProperty(
      toCesiumColor(style.line.color, Color.CYAN),
    );
    entity.polyline.width = new ConstantProperty(style.line.width);
    entity.polyline.clampToGround = new ConstantProperty(true);
  }

  if (entity.polygon) {
    entity.polygon.material = new ColorMaterialProperty(
      toCesiumColor(style.polygon.fillColor, Color.BLUE.withAlpha(0.35)),
    );
    entity.polygon.outline = new ConstantProperty(style.polygon.showOutline);
    entity.polygon.outlineColor = new ConstantProperty(
      toCesiumColor(style.polygon.outlineColor, Color.WHITE),
    );
    entity.polygon.outlineWidth = new ConstantProperty(
      style.polygon.outlineWidth,
    );
    entity.polygon.heightReference = new ConstantProperty(
      HeightReference.CLAMP_TO_GROUND,
    );
  }
}
