import { MAX_TRAIN_WIDTH, TRAIN_GEOMETRY } from "./geometry.ts";

export interface ProjectTrainProject {
  id?: string | number;
  title?: string | null;
  name?: string | null;
  previewImage?: string | null;
  url?: string | null;
  videoUrl?: string | null;
}

export interface TrainPreview {
  key: string;
  src: string;
  title: string;
}

/**
 * Scenery fills the viewport independently. Keep the moving train proportional,
 * large enough to read on a phone. The virtual track must span the viewport:
 * making it narrower would expose the offscreen reset on ultrawide displays.
 * The virtual track remains 1920 units wide, so resizing never changes its clock.
 */
export function getTrainViewportScale(width: number, height: number): number {
  if (width <= 0 || height <= 0) return 0;
  return Math.max(
    width / TRAIN_GEOMETRY.sceneWidth,
    Math.min(0.36, height / TRAIN_GEOMETRY.sceneHeight),
  );
}

export function joinAssetPath(assetBase: string, path: string): string {
  if (path.startsWith("/") || /^https?:\/\//.test(path)) return path;
  return `${assetBase.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

/** A preview may already be a CDN asset pointer (leading slash or full URL), in
 *  which case it must reach the browser untouched rather than be filed under
 *  `images/` like the legacy public filenames. */
function isAbsoluteAsset(path: string): boolean {
  return path.startsWith("/") || /^https?:\/\//.test(path);
}


export function getLaunchablePreviewSources(
  projects: readonly ProjectTrainProject[],
  assetBase: string,
): TrainPreview[] {
  return projects.flatMap((project, index) => {
    const previewImage = project.previewImage?.trim();
    const isLaunchable = Boolean(project.url?.trim() || project.videoUrl?.trim());

    if (!previewImage || !isLaunchable) return [];

    return [{
      key: `${project.id ?? "project"}:${index}:${previewImage}`,
      src: joinAssetPath(assetBase, isAbsoluteAsset(previewImage) ? previewImage : `images/${previewImage}`),
      title: project.title?.trim() || project.name?.trim() || "",
    }];

  });
}

export function groupPreviews<T>(previews: readonly T[], size = 3): T[][] {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError("Train preview group size must be a positive integer");
  }

  const groups: T[][] = [];
  for (let index = 0; index < previews.length; index += size) {
    groups.push(previews.slice(index, index + size));
  }
  return groups;
}

export function getAnimationPhase(
  currentTime: CSSNumberish | null,
  durationMs: number,
): number {
  const numericTime = typeof currentTime === "number" ? currentTime : 0;
  return ((numericTime % durationMs) + durationMs) % durationMs / durationMs;
}

export function isTrainOffscreen(phase: number): boolean {
  return phase <= 0 || phase >= TRAIN_OFFSCREEN_CLOSING;
}

/**
 * First phase where the tail of a maximum three-car train has cleared x=0.
 * This is geometry-derived so future carriage tuning cannot silently make a
 * formerly safe content swap visible.
 */
export const TRAIN_OFFSCREEN_CLOSING =
  (TRAIN_GEOMETRY.startX + MAX_TRAIN_WIDTH) /
  (TRAIN_GEOMETRY.startX - TRAIN_GEOMETRY.endX);

export function getTrainXAtPhase(phase: number): number {
  return TRAIN_GEOMETRY.startX +
    (TRAIN_GEOMETRY.endX - TRAIN_GEOMETRY.startX) * phase;
}

/** Timers may wake just before their target due to fractional-ms truncation.
 * Once an iteration has swapped, schedule the NEXT iteration, not the remaining
 * fraction of this one (which would advance the cargo twice). */
export function nextSwapDelay(currentTime: number, lastSwappedIteration: number): number {
  const duration = TRAIN_GEOMETRY.passDurationMs;
  const iteration = Math.floor(currentTime / duration);
  let target = (iteration + TRAIN_GEOMETRY.contentSwapOffset) * duration;
  if (iteration <= lastSwappedIteration || target <= currentTime) target += duration;
  return Math.max(1, Math.ceil(target - currentTime));
}
