import {
  Cartesian3,
  Color,
  LabelStyle,
  VerticalOrigin,
  type Entity,
  type Viewer,
} from "cesium";
import type { MapCommand } from "@/types/agent";

const TEMP_MARKER_PREFIX = "ai-map-marker:";

type OverlayAddMarkerCommand = Extract<MapCommand, { action: "overlay.addMarker" }>;
type ClearTemporaryTarget = NonNullable<
  Extract<MapCommand, { action: "map.clearTemporary" }>["target"]
>;

export class OverlayCommandHandler {
  public addTemporaryMarker(viewer: Viewer, command: OverlayAddMarkerCommand) {
    const [lon, lat] = command.position;
    const id = `${TEMP_MARKER_PREFIX}${command.id}`;
    const existing = viewer.entities.getById(id);

    if (existing) {
      viewer.entities.remove(existing);
    }

    viewer.entities.add({
      id,
      name: command.label ?? command.id,
      description: command.description,
      position: Cartesian3.fromDegrees(lon, lat),
      point: {
        pixelSize: 11,
        color: Color.ORANGE,
        outlineColor: Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: command.label
        ? {
            text: command.label,
            font: "13px sans-serif",
            fillColor: Color.WHITE,
            outlineColor: Color.BLACK,
            outlineWidth: 3,
            style: LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cartesian3(0, -28, 0),
            verticalOrigin: VerticalOrigin.BOTTOM,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          }
        : undefined,
    });
  }

  public clearTemporary(viewer: Viewer, target: ClearTemporaryTarget | "all") {
    if (target !== "markers" && target !== "all") {
      return;
    }

    const temporaryMarkers = viewer.entities.values.filter((entity) =>
      this.isTemporaryMarker(entity),
    );
    temporaryMarkers.forEach((entity) => viewer.entities.remove(entity));
  }

  private isTemporaryMarker(entity: Entity) {
    return (
      typeof entity.id === "string" && entity.id.startsWith(TEMP_MARKER_PREFIX)
    );
  }
}
