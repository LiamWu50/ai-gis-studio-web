import {
  Color,
  CustomDataSource,
  HeightReference,
  PolygonHierarchy,
  type Entity,
  type Viewer,
} from "cesium";
import { BaseLayerService } from "./base-layer-service";
import { toCesiumColor } from "./color";
import {
  applyEntityStyle,
  mergeGeoJsonStyle,
} from "./geojson-layer-service";
import type {
  FlyToOptions,
  GeoJsonLayerStyle,
  VectorLayerAddOptions,
  VectorLayerHandle,
} from "./types";

export class VectorLayerService extends BaseLayerService<
  CustomDataSource,
  VectorLayerAddOptions,
  GeoJsonLayerStyle
> {
  protected readonly kind = "vector" as const;

  public constructor(options: { viewer: Viewer; id: string; name?: string }) {
    super(options);
  }

  public async add(options: VectorLayerAddOptions): Promise<VectorLayerHandle> {
    this.ensureViewer();

    const existingDataSource = this.viewer.dataSources.getByName(this.id).at(0);
    const dataSource =
      existingDataSource instanceof CustomDataSource
        ? existingDataSource
        : new CustomDataSource(this.id);

    dataSource.entities.removeAll();
    const mergedStyle = mergeGeoJsonStyle(options.style);

    options.points?.forEach((feature, index) => {
      dataSource.entities.add({
        id: feature.id ?? `${this.id}:point:${index}`,
        name: feature.name,
        position: feature.position,
        point: {
          color: toCesiumColor(
            feature.style?.color ?? mergedStyle.point.color,
            Color.YELLOW,
          ),
          outlineColor: toCesiumColor(
            feature.style?.outlineColor ?? mergedStyle.point.outlineColor,
            Color.WHITE,
          ),
          outlineWidth:
            feature.style?.outlineWidth ?? mergedStyle.point.outlineWidth,
          pixelSize: feature.style?.pixelSize ?? mergedStyle.point.pixelSize,
          heightReference: HeightReference.CLAMP_TO_GROUND,
        },
        properties: feature.properties,
      });
    });

    options.lines?.forEach((feature, index) => {
      dataSource.entities.add({
        id: feature.id ?? `${this.id}:line:${index}`,
        name: feature.name,
        polyline: {
          positions: feature.positions,
          material: toCesiumColor(
            feature.style?.color ?? mergedStyle.line.color,
            Color.CYAN,
          ),
          width: feature.style?.width ?? mergedStyle.line.width,
          clampToGround: true,
        },
        properties: feature.properties,
      });
    });

    options.polygons?.forEach((feature, index) => {
      dataSource.entities.add({
        id: feature.id ?? `${this.id}:polygon:${index}`,
        name: feature.name,
        polygon: {
          hierarchy: new PolygonHierarchy(feature.positions),
          material: toCesiumColor(
            feature.style?.fillColor ?? mergedStyle.polygon.fillColor,
            Color.BLUE.withAlpha(0.35),
          ),
          outline:
            feature.style?.showOutline ?? mergedStyle.polygon.showOutline,
          outlineColor: toCesiumColor(
            feature.style?.outlineColor ?? mergedStyle.polygon.outlineColor,
            Color.WHITE,
          ),
          outlineWidth:
            feature.style?.outlineWidth ?? mergedStyle.polygon.outlineWidth,
          heightReference: HeightReference.CLAMP_TO_GROUND,
        },
        properties: feature.properties,
      });
    });

    if (!existingDataSource) {
      await this.viewer.dataSources.add(dataSource);
    }

    this.layer = dataSource;
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
    const mergedStyle = mergeGeoJsonStyle(style);
    this.ensureLayer().entities.values.forEach((entity: Entity) =>
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
