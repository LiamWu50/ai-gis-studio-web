import {
  Cartesian3,
  Color,
  createWorldTerrainAsync,
  Ion,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  UrlTemplateImageryProvider,
  Viewer
} from "cesium";

let cesiumCssLoaded = false;

async function ensureCesiumStyles() {
  if (cesiumCssLoaded) {
    return;
  }

  await import("cesium/Build/Cesium/Widgets/widgets.css");
  cesiumCssLoaded = true;
}

export function destroyViewer(viewer: Viewer | null) {
  if (!viewer || viewer.isDestroyed()) {
    return;
  }

  viewer.destroy();
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
  viewer.camera.flyTo({
    destination: new Cartesian3(
      -2182373.7500129296,
      4389150.446643888,
      4074140.451246147
    ),
    orientation: {
      heading: CesiumMath.toRadians(4),
      pitch: CesiumMath.toRadians(-38),
      roll: 0
    },
    duration: 1.8
  });
}

export async function initializeViewer(container: HTMLElement) {
  await ensureCesiumStyles();

  Ion.defaultAccessToken = "";

  const viewer = new Viewer(container, {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    navigationHelpButton: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    terrainProvider: await createWorldTerrainAsync({
      requestVertexNormals: false,
      requestWaterMask: false
    })
  });

  viewer.imageryLayers.removeAll();
  viewer.imageryLayers.addImageryProvider(
    new UrlTemplateImageryProvider({
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    })
  );

  viewer.scene.globe.baseColor = Color.fromCssColorString("#101010");
  viewer.scene.globe.depthTestAgainstTerrain = true;
  if (viewer.scene.skyAtmosphere) {
    viewer.scene.skyAtmosphere.show = true;
  }

  if (viewer.scene.moon) {
    viewer.scene.moon.show = false;
  }

  viewer.scene.fog.enabled = true;
  viewer.scene.highDynamicRange = false;
  (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = "none";

  flyToChina(viewer);

  return viewer;
}
