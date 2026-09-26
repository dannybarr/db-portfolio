/**
 * All measurements are in coordinates of the 1920 × 1080 source artwork.
 *
 * Source-art measurements stay centralized so rendering and offscreen-swap
 * calculations share one coordinate model.
 */
export const TRAIN_GEOMETRY = {
  sceneWidth: 1920,
  sceneHeight: 1080,
  railY: 344,
  locomotiveWidth: 356,
  locomotiveHeight: 143,
  flatbedWidth: 280,
  flatbedHeight: 210,
  carriageBaseHeight: 48,
  engineGap: 3,
  carGap: 4,
  screenshotInsetX: 12,
  screenshotInsetTop: 0,
  screenshotWidth: 264,
  screenshotHeight: 162,
  startX: 1920,
  endX: -1297,
  passDurationMs: 16_600,
  departureOffset: 0,
  arrivalOffset: 1,
  contentSwapOffset: 0.99,
  staticOffset: (1920 - 366) / 3217,
} as const;

export const MAX_TRAIN_WIDTH =
  TRAIN_GEOMETRY.locomotiveWidth +
  TRAIN_GEOMETRY.engineGap +
  3 * TRAIN_GEOMETRY.flatbedWidth +
  2 * TRAIN_GEOMETRY.carGap;

export const TRAIN_ASSETS = {
  scene: "images/train/scene.svg",
  cliffs: "images/train/cliffs.svg",
  locomotive: "images/train/locomotive.svg",
  carriage: "images/train/carriage.svg",
} as const;

export const PROJECT_TRAIN_ANIMATION_ID = "project-train-pass";
