import {
  buildModuleUrl,
  Cartesian3,
  Color,
  defined,
  FeatureDetection,
  Ion,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  UrlTemplateImageryProvider,
  Viewer,
} from "cesium";

let cesiumCssLoaded = false;

const CesiumdAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1YjcxY2U3MC0yNjZlLTQ0YTYtODk5Ny04NTMyNDQ2YTA2YjQiLCJpZCI6MzAwNTg5LCJpYXQiOjE3NDY2ODczMTh9.tXD9wJq-1eH_z0-85mXAn7JTybBYJi9u1Ljqk1nzGdk";
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

    this.addGoogleImageryProvider(viewer);
    this.resetView();

    return viewer;
  }

  private addGoogleImageryProvider(viewer: Viewer) {
    const googleImageryProvider = new UrlTemplateImageryProvider({
      url: "https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      subdomains: ["0", "1", "2", "3"],
      maximumLevel: 20,
      credit: "Google"
    });
    viewer.imageryLayers.addImageryProvider(googleImageryProvider);
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
