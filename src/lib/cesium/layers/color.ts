import { Color } from "cesium";
import type { ColorLike } from "./types";

export function toCesiumColor(
  color: ColorLike | undefined,
  fallback: Color,
): Color {
  if (!color) {
    return fallback;
  }

  if (color instanceof Color) {
    return color;
  }

  if (typeof color === "string") {
    return Color.fromCssColorString(color);
  }

  return new Color(
    color.red,
    color.green,
    color.blue,
    color.alpha ?? fallback.alpha,
  );
}

export function withAlpha(color: Color, alpha: number | undefined) {
  return typeof alpha === "number" ? color.withAlpha(alpha) : color;
}
