import {
  BillboardCollection,
  Cartesian3,
  Color,
  ColorGeometryInstanceAttribute,
  GeometryInstance,
  GroundPolylineGeometry,
  GroundPolylinePrimitive,
  GroundPrimitive,
  HeightReference,
  PerInstanceColorAppearance,
  PolygonGeometry,
  PolygonHierarchy,
  PolylineColorAppearance,
  PolylineGeometry,
  Primitive,
  PrimitiveCollection,
  Rectangle,
  type Viewer,
} from "cesium";
import { BaseLayerService } from "./base-layer-service";
import { toCesiumColor } from "./color";
import { mergeGeoJsonStyle } from "./geojson-layer-service";
import type {
  FlyToOptions,
  GeoJsonLayerStyle,
  PrimitiveGeoJsonLayerAddOptions,
  PrimitiveGeoJsonLayerContainer,
  PrimitiveGeoJsonLayerHandle,
} from "./types";

type GeoJsonPosition = [number, number, number?];

type GeoJsonGeometry =
  | { type: "Point"; coordinates: GeoJsonPosition }
  | { type: "MultiPoint"; coordinates: GeoJsonPosition[] }
  | { type: "LineString"; coordinates: GeoJsonPosition[] }
  | { type: "MultiLineString"; coordinates: GeoJsonPosition[][] }
  | { type: "Polygon"; coordinates: GeoJsonPosition[][] }
  | { type: "MultiPolygon"; coordinates: GeoJsonPosition[][][] };

type GeoJsonFeature = {
  type: "Feature";
  id?: string | number;
  geometry: GeoJsonGeometry | null;
  properties?: Record<string, unknown> | null;
};

type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

type ParsedFeatures = {
  points: GeoJsonFeature[];
  lines: GeoJsonFeature[];
  polygons: GeoJsonFeature[];
};

type PrimitivePickMetadata = {
  layerId: string;
  featureId: string;
  name?: string;
  properties?: Record<string, unknown>;
};

const MAX_PICK_PROPERTY_COUNT = 12;
const pointImageCache = new Map<string, HTMLCanvasElement>();

export function findPrimitiveGeoJsonLayer(
  viewer: Viewer,
  layerId: string,
): PrimitiveGeoJsonLayerContainer | undefined {
  const candidates = [layerId, `user-layer:${layerId}`, `system-layer:${layerId}`];

  for (let index = 0; index < viewer.scene.primitives.length; index += 1) {
    const primitive = viewer.scene.primitives.get(
      index,
    ) as Partial<PrimitiveGeoJsonLayerContainer>;
    if (
      primitive.__layerKind === "primitive-geojson" &&
      primitive.__layerId &&
      candidates.includes(primitive.__layerId)
    ) {
      return primitive as PrimitiveGeoJsonLayerContainer;
    }
  }

  return undefined;
}

export function isPrimitiveGeoJsonLayer(
  layer: unknown,
): layer is PrimitiveGeoJsonLayerContainer {
  return (
    typeof layer === "object" &&
    layer !== null &&
    "__layerKind" in layer &&
    layer.__layerKind === "primitive-geojson"
  );
}

export function setPrimitiveGeoJsonLayerOpacity(
  layer: PrimitiveGeoJsonLayerContainer,
  opacity: number,
) {
  const service = layer.__primitiveGeoJsonService;
  service?.updateOpacity(opacity);
}

export class PrimitiveGeoJsonLayerService extends BaseLayerService<
  PrimitiveGeoJsonLayerContainer,
  PrimitiveGeoJsonLayerAddOptions,
  GeoJsonLayerStyle
> {
  protected readonly kind = "primitive-geojson" as const;

  private data: GeoJsonFeatureCollection | null = null;
  private bbox: [number, number, number, number] | null = null;
  private style: GeoJsonLayerStyle | undefined;
  private clampToGround = true;

  public constructor(options: { viewer: Viewer; id: string; name?: string }) {
    super(options);
  }

  public async add(
    options: PrimitiveGeoJsonLayerAddOptions,
  ): Promise<PrimitiveGeoJsonLayerHandle> {
    this.ensureViewer();

    const parsedData = this.parseFeatureCollection(options.data);
    const existingLayer = findPrimitiveGeoJsonLayer(this.viewer, this.id);
    if (existingLayer) {
      this.viewer.scene.primitives.remove(existingLayer);
    }

    this.data = parsedData;
    this.bbox = options.bbox ?? this.computeBoundingBox(parsedData);
    this.style = options.style;
    this.clampToGround = true;

    const layer = this.createLayerContainer();
    this.layer = layer;
    this.viewer.scene.primitives.add(layer);

    return this.createHandle(layer);
  }

  public remove() {
    const layer = this.layer ?? findPrimitiveGeoJsonLayer(this.viewer, this.id);
    if (!layer) return false;

    const removed = this.viewer.scene.primitives.remove(layer);
    this.layer = null;
    return removed;
  }

  public updateStyle(style: GeoJsonLayerStyle) {
    this.style = style;
    this.rebuildLayer();
  }

  public updateOpacity(opacity: number) {
    const clampedOpacity = Math.min(Math.max(opacity, 0), 1);
    this.updateStyle({
      point: { color: Color.YELLOW.withAlpha(clampedOpacity) },
      line: { color: Color.CYAN.withAlpha(clampedOpacity) },
      polygon: { fillColor: Color.BLUE.withAlpha(clampedOpacity * 0.35) },
    });
  }

  public setVisible(visible: boolean) {
    this.ensureLayer().show = visible;
  }

  public async flyTo(options?: FlyToOptions) {
    const rectangle = this.bbox
      ? Rectangle.fromDegrees(...this.bbox)
      : undefined;
    if (!rectangle) return;

    await this.viewer.camera.flyTo({
      destination: rectangle,
      duration: options?.duration ?? 1.2,
    });
  }

  private rebuildLayer() {
    if (!this.data) return;

    const visible = this.layer?.show ?? true;
    if (this.layer) {
      this.viewer.scene.primitives.remove(this.layer);
    }

    const nextLayer = this.createLayerContainer();
    nextLayer.show = visible;
    this.layer = nextLayer;
    this.viewer.scene.primitives.add(nextLayer);
  }

  private createLayerContainer(): PrimitiveGeoJsonLayerContainer {
    if (!this.data) {
      throw new Error(`Layer "${this.id}" has no GeoJSON data.`);
    }

    const layer = new PrimitiveCollection({
      destroyPrimitives: true,
    }) as PrimitiveGeoJsonLayerContainer;
    layer.__layerId = this.id;
    layer.__layerKind = "primitive-geojson";
    layer.__serviceLayerName = this.name;
    layer.__primitiveGeoJsonService = this;

    const features = this.parseFeatures(this.data);
    this.addPointFeatures(layer, features.points);
    this.addLineFeatures(layer, features.lines);
    this.addPolygonFeatures(layer, features.polygons);

    return layer;
  }

  private parseFeatureCollection(data: object): GeoJsonFeatureCollection {
    if (!isFeatureCollection(data)) {
      throw new Error("仅支持 GeoJSON FeatureCollection 上图");
    }

    return data;
  }

  private parseFeatures(data: GeoJsonFeatureCollection): ParsedFeatures {
    return data.features.reduce<ParsedFeatures>(
      (parsed, feature) => {
        switch (feature.geometry?.type) {
          case "Point":
          case "MultiPoint":
            parsed.points.push(feature);
            break;
          case "LineString":
          case "MultiLineString":
            parsed.lines.push(feature);
            break;
          case "Polygon":
          case "MultiPolygon":
            parsed.polygons.push(feature);
            break;
        }

        return parsed;
      },
      { points: [], lines: [], polygons: [] },
    );
  }

  private addPointFeatures(
    layer: PrimitiveGeoJsonLayerContainer,
    features: GeoJsonFeature[],
  ) {
    if (features.length === 0) return;

    const style = mergeGeoJsonStyle(this.style);
    const collection = new BillboardCollection();
    const color = toCesiumColor(style.point.color, Color.YELLOW);
    const outlineColor = toCesiumColor(style.point.outlineColor, Color.WHITE);
    const pointImage = createPointImage({
      color,
      outlineColor,
      outlineWidth: style.point.outlineWidth ?? 2,
      pixelSize: style.point.pixelSize ?? 10,
    });

    features.forEach((feature, featureIndex) => {
      const coordinates = getPointCoordinateGroups(feature.geometry);
      coordinates.forEach((coordinate, coordinateIndex) => {
        collection.add({
          id: this.createPickMetadata(feature, featureIndex, coordinateIndex),
          position: this.toCartesian3Position(coordinate),
          image: pointImage,
          heightReference: HeightReference.CLAMP_TO_GROUND,
          width: pointImage.width,
          height: pointImage.height,
        });
      });
    });

    layer.add(collection);
  }

  private addLineFeatures(
    layer: PrimitiveGeoJsonLayerContainer,
    features: GeoJsonFeature[],
  ) {
    const instances = features.flatMap((feature, featureIndex) =>
      getLineCoordinateGroups(feature.geometry).map((coordinates, lineIndex) => {
        const positions = this.toCartesian3Positions(coordinates);
        if (positions.length < 2) return null;

        const style = mergeGeoJsonStyle(this.style);
        const color = toCesiumColor(style.line.color, Color.CYAN);
        const geometry = this.clampToGround
          ? new GroundPolylineGeometry({
              positions,
              width: style.line.width,
            })
          : new PolylineGeometry({
              positions,
              width: style.line.width,
              vertexFormat: PolylineColorAppearance.VERTEX_FORMAT,
            });

        return new GeometryInstance({
          geometry,
          id: this.createPickMetadata(feature, featureIndex, lineIndex),
          attributes: {
            color: ColorGeometryInstanceAttribute.fromColor(color),
          },
        });
      }),
    ).filter((instance): instance is GeometryInstance => Boolean(instance));

    if (instances.length === 0) return;

    layer.add(
      this.clampToGround
        ? new GroundPolylinePrimitive({
            geometryInstances: instances,
            appearance: new PolylineColorAppearance({ translucent: true }),
          })
        : new Primitive({
            geometryInstances: instances,
            appearance: new PolylineColorAppearance({ translucent: true }),
          }),
    );
  }

  private addPolygonFeatures(
    layer: PrimitiveGeoJsonLayerContainer,
    features: GeoJsonFeature[],
  ) {
    const polygonStyle = mergeGeoJsonStyle(this.style).polygon;
    const fillColor = toCesiumColor(
      polygonStyle.fillColor,
      Color.BLUE.withAlpha(0.35),
    );
    const instances = features.flatMap((feature, featureIndex) =>
      getPolygonCoordinateGroups(feature.geometry).map(
        (rings, polygonIndex) => {
          const hierarchy = this.toPolygonHierarchy(rings);
          if (!hierarchy || hierarchy.positions.length < 3) return null;

          return new GeometryInstance({
            geometry: new PolygonGeometry({
              polygonHierarchy: hierarchy,
              vertexFormat: PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
              perPositionHeight: !this.clampToGround,
            }),
            id: this.createPickMetadata(feature, featureIndex, polygonIndex),
            attributes: {
              color: ColorGeometryInstanceAttribute.fromColor(fillColor),
            },
          });
        },
      ),
    ).filter((instance): instance is GeometryInstance => Boolean(instance));

    if (instances.length > 0) {
      const primitive = this.clampToGround
        ? new GroundPrimitive({
            geometryInstances: instances,
            appearance: new PerInstanceColorAppearance({
              flat: true,
              translucent: true,
            }),
          })
        : new Primitive({
            geometryInstances: instances,
            appearance: new PerInstanceColorAppearance({
              flat: true,
              translucent: true,
            }),
          });
      layer.add(primitive);
    }

    if (polygonStyle.showOutline) {
      const outlineFeatures = features.map((feature) => ({
        ...feature,
        geometry: polygonToLineGeometry(feature.geometry),
      }));
      this.addLineFeatures(layer, outlineFeatures);
    }
  }

  private toCartesian3Positions(coordinates: GeoJsonPosition[]) {
    return coordinates.map((coordinate) => this.toCartesian3Position(coordinate));
  }

  private toCartesian3Position([longitude, latitude, height]: GeoJsonPosition) {
    return Cartesian3.fromDegrees(longitude, latitude, height ?? 0);
  }

  private toPolygonHierarchy(rings: GeoJsonPosition[][]) {
    if (rings.length === 0) return null;

    const [outerRing, ...holes] = rings;
    return new PolygonHierarchy(
      this.toCartesian3Positions(stripClosingCoordinate(outerRing)),
      holes
        .map((hole) => stripClosingCoordinate(hole))
        .filter((hole) => hole.length >= 3)
        .map((hole) => new PolygonHierarchy(this.toCartesian3Positions(hole))),
    );
  }

  private computeBoundingBox(
    data: GeoJsonFeatureCollection,
  ): [number, number, number, number] | null {
    let west = Number.POSITIVE_INFINITY;
    let south = Number.POSITIVE_INFINITY;
    let east = Number.NEGATIVE_INFINITY;
    let north = Number.NEGATIVE_INFINITY;

    data.features.forEach((feature) => {
      flattenPositions(feature.geometry).forEach(([longitude, latitude]) => {
        west = Math.min(west, longitude);
        south = Math.min(south, latitude);
        east = Math.max(east, longitude);
        north = Math.max(north, latitude);
      });
    });

    if (
      !Number.isFinite(west) ||
      !Number.isFinite(south) ||
      !Number.isFinite(east) ||
      !Number.isFinite(north)
    ) {
      return null;
    }

    return [west, south, east, north];
  }

  private createPickMetadata(
    feature: GeoJsonFeature,
    featureIndex: number,
    partIndex: number,
  ): PrimitivePickMetadata {
    const name =
      typeof feature.properties?.name === "string"
        ? feature.properties.name
        : undefined;

    return {
      layerId: this.id,
      featureId: String(feature.id ?? `${this.id}:${featureIndex}:${partIndex}`),
      name,
      properties: compactPickProperties(feature.properties),
    };
  }
}

function compactPickProperties(properties?: Record<string, unknown> | null) {
  if (!properties) return undefined;

  return Object.fromEntries(
    Object.entries(properties)
      .filter(([, value]) => typeof value !== "object" || value === null)
      .slice(0, MAX_PICK_PROPERTY_COUNT),
  );
}

function createPointImage(options: {
  color: Color;
  outlineColor: Color;
  outlineWidth: number;
  pixelSize: number;
}) {
  const pixelSize = Math.max(1, Math.ceil(options.pixelSize));
  const outlineWidth = Math.max(0, Math.ceil(options.outlineWidth));
  const imageSize = pixelSize + outlineWidth * 2;
  const cacheKey = [
    options.color.toCssColorString(),
    options.outlineColor.toCssColorString(),
    outlineWidth,
    pixelSize,
  ].join("|");
  const cachedImage = pointImageCache.get(cacheKey);
  if (cachedImage) return cachedImage;

  const canvas = document.createElement("canvas");
  canvas.width = imageSize;
  canvas.height = imageSize;

  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const center = imageSize / 2;
  const radius = pixelSize / 2;
  context.beginPath();
  context.arc(center, center, radius, 0, Math.PI * 2);
  context.fillStyle = options.color.toCssColorString();
  context.fill();

  if (outlineWidth > 0) {
    context.lineWidth = outlineWidth;
    context.strokeStyle = options.outlineColor.toCssColorString();
    context.stroke();
  }

  pointImageCache.set(cacheKey, canvas);
  return canvas;
}

function isFeatureCollection(data: object): data is GeoJsonFeatureCollection {
  return (
    "type" in data &&
    data.type === "FeatureCollection" &&
    "features" in data &&
    Array.isArray(data.features)
  );
}

function getPointCoordinateGroups(geometry: GeoJsonGeometry | null) {
  if (!geometry) return [];
  if (geometry.type === "Point") return [geometry.coordinates];
  if (geometry.type === "MultiPoint") return geometry.coordinates;
  return [];
}

function getLineCoordinateGroups(geometry: GeoJsonGeometry | null) {
  if (!geometry) return [];
  if (geometry.type === "LineString") return [geometry.coordinates];
  if (geometry.type === "MultiLineString") return geometry.coordinates;
  return [];
}

function getPolygonCoordinateGroups(geometry: GeoJsonGeometry | null) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

function polygonToLineGeometry(
  geometry: GeoJsonGeometry | null,
): GeoJsonGeometry | null {
  const rings = getPolygonCoordinateGroups(geometry).flat();
  if (rings.length === 0) return null;
  return { type: "MultiLineString", coordinates: rings };
}

function stripClosingCoordinate(coordinates: GeoJsonPosition[]) {
  if (coordinates.length < 2) return coordinates;

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) {
    return coordinates.slice(0, -1);
  }

  return coordinates;
}

function flattenPositions(geometry: GeoJsonGeometry | null): GeoJsonPosition[] {
  if (!geometry) return [];

  switch (geometry.type) {
    case "Point":
      return [geometry.coordinates];
    case "MultiPoint":
    case "LineString":
      return geometry.coordinates;
    case "MultiLineString":
    case "Polygon":
      return geometry.coordinates.flat();
    case "MultiPolygon":
      return geometry.coordinates.flat(2);
  }
}
