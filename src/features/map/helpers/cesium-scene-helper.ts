import {
  buildModuleUrl,
  Cartesian3,
  Color,
  defined,
  ImageryLayer,
  Ion,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  Terrain,
  UrlTemplateImageryProvider,
  Viewer,
} from "cesium";

let cesiumCssLoaded = false;

const CesiumBaseUrl = "/cesium/";
const CesiumdAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1YjcxY2U3MC0yNjZlLTQ0YTYtODk5Ny04NTMyNDQ2YTA2YjQiLCJpZCI6MzAwNTg5LCJpYXQiOjE3NDY2ODczMTh9.tXD9wJq-1eH_z0-85mXAn7JTybBYJi9u1Ljqk1nzGdk";
const TiandituSubdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];

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

    viewer.useBrowserRecommendedResolution = false;
    viewer.resolutionScale = getMapResolutionScale();
    viewer.scene.debugShowFramesPerSecond = false;

    await Promise.all([
      this.addDefaultBasemapProviders(viewer),
      this.addDefaultTerrainProvider(viewer),
    ]);
    this.resetView();

    return viewer;
  }

  private async addDefaultBasemapProviders(viewer: Viewer) {
    const tiandituToken = getTiandituToken();
    if (!tiandituToken) {
      console.warn(
        "Missing NEXT_PUBLIC_TIANDITU_TOKEN. Tianditu basemap was not loaded.",
      );
      return;
    }

    const imageryProvider = new UrlTemplateImageryProvider({
      url: getTiandituTileUrl("img_w", tiandituToken),
      subdomains: TiandituSubdomains,
      maximumLevel: 18,
      credit: "Tianditu",
    });
    const annotationProvider = new UrlTemplateImageryProvider({
      url: getTiandituTileUrl("cia_w", tiandituToken),
      subdomains: TiandituSubdomains,
      maximumLevel: 18,
      credit: "Tianditu",
    });

    viewer.imageryLayers.add(new ImageryLayer(imageryProvider));
    viewer.imageryLayers.add(new ImageryLayer(annotationProvider));
  }

  private async addDefaultTerrainProvider(viewer: Viewer) {
    viewer.scene.setTerrain(
      Terrain.fromWorldTerrain({
        requestVertexNormals: true,
        requestWaterMask: true,
      }),
    );
  }

  private getInitOptions() {
    return {
      baseLayer: false as const,
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
      useBrowserRecommendedResolution: false,
      shouldAnimate: false,
      selectionIndicator: false,
      orderIndependentTranslucency: false,
      contextOptions: {
        webgl: {
          alpha: false,
          depth: true,
          stencil: false,
          antialias: true,
          premultipliedAlpha: false,
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: true
        }
      }
    };
  }

  public getViewOptions() {
    return {
      destination: Cartesian3.fromDegrees(104.0668, 30.5728, 12000),
      orientation: {
        pitch: CesiumMath.toRadians(-90)
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

function getMapResolutionScale() {
  const devicePixelRatio = window.devicePixelRatio || 1;
  const targetPixelRatio = Math.min(devicePixelRatio, 2);

  return targetPixelRatio / devicePixelRatio;
}

function getTiandituToken() {
  return process.env.NEXT_PUBLIC_TIANDITU_TOKEN?.trim() ?? "";
}

function getTiandituTileUrl(layerType: "img_w" | "cia_w", token: string) {
  return `https://t{s}.tianditu.gov.cn/DataServer?T=${layerType}&x={x}&y={y}&l={z}&tk=${token}`;
}

export async function initializeViewer(container: HTMLElement) {
  return CesiumSceneHelper.initViewer(container as HTMLDivElement);
}

export function destroyViewer(viewer: Viewer | null) {
  CesiumSceneHelper.destroyViewer(viewer);
}

export default CesiumSceneHelper;
