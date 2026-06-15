import {
  buildModuleUrl,
  Cartesian3,
  Color,
  defined,
  FeatureDetection,
  ImageryLayer,
  Ion,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  Viewer,
  WebMapTileServiceImageryProvider
} from "cesium";

let cesiumCssLoaded = false;

const CesiumdAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1YjcxY2U3MC0yNjZlLTQ0YTYtODk5Ny04NTMyNDQ2YTA2YjQiLCJpZCI6MzAwNTg5LCJpYXQiOjE3NDY2ODczMTh9.tXD9wJq-1eH_z0-85mXAn7JTybBYJi9u1Ljqk1nzGdk";
const TdMapAccessToken = "c41de38ace0497e639d4f2ed1eca9038";
const CesiumBaseUrl = "/cesium/";

if (typeof window !== "undefined") {
  (window as Window & { CESIUM_BASE_URL?: string }).CESIUM_BASE_URL =
    CesiumBaseUrl;
}

async function ensureCesiumStyles() {
  if (cesiumCssLoaded) {
    return;
  }

  (
    buildModuleUrl as typeof buildModuleUrl & {
      setBaseUrl?: (baseUrl: string) => void;
    }
  ).setBaseUrl?.(CesiumBaseUrl);

  await import("cesium/Build/Cesium/Widgets/widgets.css");
  cesiumCssLoaded = true;
}

export function disposeInputHandler(
  handler: ScreenSpaceEventHandler | null | undefined
) {
  if (!handler || handler.isDestroyed()) {
    return;
  }

  handler.destroy();
}

export function flyToChina(viewer: Viewer) {
  viewer.camera.flyTo(CesiumSceneHelper.getViewOptions());
}

const CesiumSceneHelper = new (class {
  private viewer: Viewer | null = null;

  public async initViewer(target: string | HTMLDivElement) {
    await ensureCesiumStyles();

    Ion.defaultAccessToken = CesiumdAccessToken;

    const options = this.getInitOptions();
    const viewer = new Viewer(target, options);
    this.viewer = viewer;
    const creditContainer = viewer.cesiumWidget.creditContainer as HTMLElement;
    creditContainer.style.display = "none";

    viewer.scene.globe.baseColor = Color.BLACK;
    viewer.scene.debugShowFramesPerSecond = false;
    if (viewer.scene.skyBox) {
      viewer.scene.skyBox.show = true;
    }

    if (viewer.scene.sun) {
      viewer.scene.sun.show = false;
    }

    if (viewer.scene.moon) {
      viewer.scene.moon.show = false;
    }

    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.show = true;
    }

    viewer.scene.globe.show = true;
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.postProcessStages.fxaa.enabled = true;
    viewer.scene.globe.enableLighting = false;
    viewer.shadows = false;

    const cesiumWidget = viewer.cesiumWidget as typeof viewer.cesiumWidget & {
      supportsImageRenderingPixelated?: boolean;
      forceResize?: boolean;
    };
    const featureDetection = FeatureDetection as typeof FeatureDetection & {
      supportsImageRenderingPixelated?: () => boolean;
    };
    const supportsImageRenderingPixelated =
      featureDetection.supportsImageRenderingPixelated?.() ?? false;
    cesiumWidget.supportsImageRenderingPixelated =
      supportsImageRenderingPixelated;
    cesiumWidget.forceResize = true;
    viewer.scene.debugShowFramesPerSecond = false;

    if (supportsImageRenderingPixelated) {
      let vtxfDpr = window.devicePixelRatio;
      while (vtxfDpr >= 2) {
        vtxfDpr /= 2;
      }
      viewer.resolutionScale = vtxfDpr;
    }

    this.addTdtImageryProvider(viewer);
    this.resetView();

    return viewer;
  }

  private addTdtImageryProvider(viewer: Viewer) {
    const tdtImageryProvider = new WebMapTileServiceImageryProvider({
      url: `https://t0.tianditu.gov.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${TdMapAccessToken}`,
      layer: "tdtBasicLayer",
      style: "default",
      format: "image/jpeg",
      tileMatrixSetID: "GoogleMapsCompatible"
    });
    viewer.imageryLayers.addImageryProvider(tdtImageryProvider);
  }

  private getInitOptions() {
    return {
      // baseLayer: new ImageryLayer(
      //   new WebMapTileServiceImageryProvider({
      //     url: `https://t0.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${TdMapAccessToken}`,
      //     layer: "tdtBasicLayer",
      //     style: "default",
      //     format: "image/jpeg",
      //     maximumLevel: 18,
      //     tileMatrixSetID: "GoogleMapsCompatible"
      //   }),
      //   {
      //     brightness: 1.65
      //   }
      // ),
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      shadows: false,
      infoBox: false,
      CreditsDisplay: false,
      shouldAnimate: true,
      selectionIndicator: false,
      orderIndependentTranslucency: false,
      contextOptions: {
        webgl: {
          alpha: true,
          depth: true,
          stencil: true,
          antialias: true,
          premultipliedAlpha: true,
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: true
        }
      }
    };
  }

  public getViewOptions() {
    return {
      destination: Cartesian3.fromDegrees(114.519, 37.63547, 615),
      orientation: {
        pitch: CesiumMath.toRadians(-45)
      },
      duration: 1.8
    };
  }

  public resetView() {
    this.viewer?.camera.flyTo(this.getViewOptions());
  }

  public destroyViewer(viewer: Viewer | null) {
    if (!defined(viewer) || viewer.isDestroyed()) {
      return;
    }

    viewer.entities.removeAll();
    viewer.imageryLayers.removeAll();
    viewer.dataSources.removeAll();

    const gl = (viewer.scene as { context?: { _originalGLContext?: WebGLRenderingContext } })
      .context?._originalGLContext;
    if (gl) {
      gl.canvas.width = 1;
      gl.canvas.height = 1;
    }

    viewer.destroy();
    gl?.getExtension("WEBGL_lose_context")?.loseContext();

    const cesiumContainer = document.getElementById("cesiumContainer");
    cesiumContainer?.remove();
  }
})();

export async function initializeViewer(container: HTMLElement) {
  return CesiumSceneHelper.initViewer(container as HTMLDivElement);
}

export function destroyViewer(viewer: Viewer | null) {
  CesiumSceneHelper.destroyViewer(viewer);
}

export default CesiumSceneHelper;
