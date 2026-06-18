import type {
  ArcGisMapServerImageryProvider,
  Cartesian3,
  Cesium3DTileStyle,
  Cesium3DTileset,
  Color,
  ColorBlendMode,
  DataSource,
  GeoJsonDataSource,
  HeadingPitchRoll,
  ImageryLayer,
  ImageryLayerCollection,
  ImageryProvider,
  Matrix4,
  Model,
  Rectangle,
  Resource,
  Viewer,
  WebMapServiceImageryProvider,
} from "cesium";

export type CesiumLayerKind =
  | "geojson"
  | "imagery"
  | "gltf-model"
  | "tileset"
  | "vector";

export type LayerHandle<TLayer = unknown> = {
  id: string;
  name: string;
  kind: CesiumLayerKind;
  layer: TLayer;
};

export type LayerServiceOptions = {
  viewer: Viewer;
  id: string;
  name?: string;
};

export type FlyToOptions = {
  duration?: number;
  offset?: HeadingPitchRangeLike;
};

export type HeadingPitchRangeLike = {
  heading?: number;
  pitch?: number;
  range?: number;
};

export type RgbaColorLike = {
  red: number;
  green: number;
  blue: number;
  alpha?: number;
};

export type ColorLike = Color | string | RgbaColorLike;

export type PointStyle = {
  color?: ColorLike;
  outlineColor?: ColorLike;
  outlineWidth?: number;
  pixelSize?: number;
};

export type LineStyle = {
  color?: ColorLike;
  width?: number;
  clampToGround?: boolean;
};

export type PolygonStyle = {
  fillColor?: ColorLike;
  outlineColor?: ColorLike;
  outlineWidth?: number;
  showOutline?: boolean;
  clampToGround?: boolean;
};

export type GeoJsonLayerStyle = {
  point?: PointStyle;
  line?: LineStyle;
  polygon?: PolygonStyle;
};

export type GeoJsonLayerAddOptions = {
  data: Resource | string | object;
  clampToGround?: boolean;
  sourceUri?: string;
  style?: GeoJsonLayerStyle;
};

export type GeoJsonLayerHandle = LayerHandle<GeoJsonDataSource>;

export type ImageryLayerStyle = {
  alpha?: number;
  brightness?: number;
  contrast?: number;
  hue?: number;
  saturation?: number;
  gamma?: number;
};

type ImageryCommonOptions = {
  rectangle?: Rectangle;
  style?: ImageryLayerStyle;
  layerOptions?: ImageryLayer.ConstructorOptions;
};

export type UrlTemplateImageryOptions = ImageryCommonOptions & {
  type: "url-template" | "xyz";
  url: string;
  subdomains?: string | string[];
  minimumLevel?: number;
  maximumLevel?: number;
  credit?: string;
};

export type WmsImageryOptions = ImageryCommonOptions & {
  type: "wms";
  url: string;
  layers: string;
  parameters?: WebMapServiceImageryProvider.ConstructorOptions["parameters"];
  getFeatureInfoParameters?: WebMapServiceImageryProvider.ConstructorOptions["getFeatureInfoParameters"];
  enablePickFeatures?: boolean;
  credit?: string;
};

export type WmtsImageryOptions = ImageryCommonOptions & {
  type: "wmts";
  url: string;
  layer: string;
  style?: string;
  format?: string;
  tileMatrixSetID: string;
  tileMatrixLabels?: string[];
  minimumLevel?: number;
  maximumLevel?: number;
  credit?: string;
};

export type ArcGisImageryOptions = ImageryCommonOptions & {
  type: "arcgis";
  url: string;
  providerOptions?: ArcGisMapServerImageryProvider.ConstructorOptions;
};

export type ImageryLayerAddOptions =
  | UrlTemplateImageryOptions
  | WmsImageryOptions
  | WmtsImageryOptions
  | ArcGisImageryOptions;

export type ImageryLayerHandle = LayerHandle<ImageryLayer>;

export type GltfModelStyle = {
  color?: ColorLike;
  colorBlendMode?: ColorBlendMode;
  colorBlendAmount?: number;
  silhouetteColor?: ColorLike;
  silhouetteSize?: number;
};

export type GltfModelLayerAddOptions = {
  url: string | Resource;
  position: Cartesian3;
  headingPitchRoll?: HeadingPitchRoll;
  modelMatrix?: Matrix4;
  scale?: number;
  minimumPixelSize?: number;
  maximumScale?: number;
  allowPicking?: boolean;
  style?: GltfModelStyle;
};

export type GltfModelLayerHandle = LayerHandle<Model>;

export type TilesetLayerStyle = {
  style?: Cesium3DTileStyle | Record<string, unknown>;
  color?: ColorLike;
  opacity?: number;
};

export type TilesetLayerAddOptions = {
  url: string | Resource;
  modelMatrix?: Matrix4;
  maximumScreenSpaceError?: number;
  dynamicScreenSpaceError?: boolean;
  cullRequestsWhileMoving?: boolean;
  style?: TilesetLayerStyle;
};

export type TilesetLayerHandle = LayerHandle<Cesium3DTileset>;

export type VectorPointFeature = {
  id?: string;
  name?: string;
  position: Cartesian3;
  style?: PointStyle;
  properties?: Record<string, unknown>;
};

export type VectorLineFeature = {
  id?: string;
  name?: string;
  positions: Cartesian3[];
  style?: LineStyle;
  properties?: Record<string, unknown>;
};

export type VectorPolygonFeature = {
  id?: string;
  name?: string;
  positions: Cartesian3[];
  style?: PolygonStyle;
  properties?: Record<string, unknown>;
};

export type VectorLayerAddOptions = {
  points?: VectorPointFeature[];
  lines?: VectorLineFeature[];
  polygons?: VectorPolygonFeature[];
  style?: GeoJsonLayerStyle;
};

export type VectorLayerHandle = LayerHandle<DataSource>;

export type CesiumLayerContainer =
  | DataSource
  | ImageryLayer
  | ImageryLayerCollection
  | Model
  | Cesium3DTileset
  | ImageryProvider;
