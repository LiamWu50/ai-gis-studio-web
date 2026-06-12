import {
  Cartesian3,
  Cartographic,
  Cartesian2,
  Color,
  HeightReference,
  HorizontalOrigin,
  LabelStyle,
  NearFarScalar,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  VerticalOrigin,
  defined,
  type Viewer
} from "cesium";

import {
  disposeInputHandler,
  flyToChina
} from "@/features/map/helpers/cesium-scene-helper";

type WorkbenchPoint = {
  id: string;
  name: string;
  category: string;
  longitude: number;
  latitude: number;
  color: string;
};

const workbenchPoints: WorkbenchPoint[] = [
  {
    id: "poi-business-core",
    name: "商业热力核心区",
    category: "POI 热力",
    longitude: 116.397389,
    latitude: 39.908722,
    color: "#f97316"
  },
  {
    id: "traffic-hub",
    name: "轨交换乘枢纽",
    category: "道路网络",
    longitude: 121.473667,
    latitude: 31.230525,
    color: "#38bdf8"
  },
  {
    id: "district-boundary",
    name: "行政边界分析面",
    category: "行政边界",
    longitude: 113.264385,
    latitude: 23.129112,
    color: "#a3e635"
  }
];

function buildMarkerColor(category: string, fallbackColor: string) {
  if (category === "POI 热力") {
    return Color.fromCssColorString("#f97316");
  }

  if (category === "道路网络") {
    return Color.fromCssColorString("#38bdf8");
  }

  return Color.fromCssColorString(fallbackColor);
}

function addWorkbenchMarkers(viewer: Viewer) {
  workbenchPoints.forEach((point) => {
    viewer.entities.add({
      id: point.id,
      name: point.name,
      position: Cartesian3.fromDegrees(point.longitude, point.latitude, 120),
      point: {
        pixelSize: 16,
        color: buildMarkerColor(point.category, point.color),
        outlineColor: Color.WHITE.withAlpha(0.9),
        outlineWidth: 2,
        heightReference: HeightReference.CLAMP_TO_GROUND
      },
      label: {
        text: `${point.name}\n${point.category}`,
        font: "12px sans-serif",
        showBackground: true,
        backgroundColor: Color.fromCssColorString("#111111").withAlpha(0.72),
        fillColor: Color.WHITE,
        outlineColor: Color.BLACK,
        outlineWidth: 2,
        style: LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: Cartesian3.ZERO as never,
        verticalOrigin: VerticalOrigin.BOTTOM,
        horizontalOrigin: HorizontalOrigin.LEFT,
        eyeOffset: new Cartesian3(0, 0, -12),
        scaleByDistance: new NearFarScalar(2.0e3, 1.1, 3.0e6, 0.45)
      },
      properties: {
        category: point.category,
        longitude: point.longitude,
        latitude: point.latitude
      }
    });
  });
}

function addFocusArea(viewer: Viewer) {
  viewer.entities.add({
    id: "focus-area-beijing",
    name: "商业选址重点区域",
    polygon: {
      hierarchy: Cartesian3.fromDegreesArray([
        116.36, 39.92, 116.44, 39.92, 116.44, 39.88, 116.36, 39.88
      ]),
      material: Color.fromCssColorString("#f59e0b").withAlpha(0.15),
      outline: true,
      outlineColor: Color.fromCssColorString("#f59e0b")
    }
  });
}

function bindSelection(viewer: Viewer) {
  const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

  handler.setInputAction((movement: { position: Cartesian2 }) => {
    const pickedObject = viewer.scene.pick(movement.position);

    if (!defined(pickedObject) || !pickedObject.id) {
      return;
    }

    const entity = pickedObject.id;
    const position = entity.position?.getValue(viewer.clock.currentTime);

    if (!position) {
      return;
    }

    const cartographic = Cartographic.fromCartesian(position);
    const longitude = Number((cartographic.longitude * 180) / Math.PI).toFixed(4);
    const latitude = Number((cartographic.latitude * 180) / Math.PI).toFixed(4);

    entity.description = `${entity.name ?? "分析点位"}<br/>经度 ${longitude}<br/>纬度 ${latitude}`;
    viewer.selectedEntity = entity;
  }, ScreenSpaceEventType.LEFT_CLICK);

  return handler;
}

export function loadWorkbenchScene(viewer: Viewer) {
  viewer.entities.removeAll();

  addFocusArea(viewer);
  addWorkbenchMarkers(viewer);
  flyToChina(viewer);

  const selectionHandler = bindSelection(viewer);

  return () => {
    disposeInputHandler(selectionHandler);
    viewer.entities.removeAll();
  };
}
