import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import {
  PROJECT_TRAIN_ANIMATION_ID,
  TRAIN_ASSETS,
  TRAIN_GEOMETRY,
} from "./geometry";
import {
  getAnimationPhase,
  getLaunchablePreviewSources,
  getTrainViewportScale,
  groupPreviews,
  isTrainOffscreen,
  joinAssetPath,
  nextSwapDelay,
  type ProjectTrainProject,
  type TrainPreview,
} from "./model";
import "./ProjectTrainBackdrop.css";

export interface ProjectTrainBackdropProps {
  projects: readonly ProjectTrainProject[];
  assetBase: string;
  pinned?: boolean;
  loading?: boolean;
  active?: boolean;
}

function decodePreview(
  preview: TrainPreview,
  signal: AbortSignal,
): Promise<TrainPreview | null> {
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;

    const finish = (result: TrainPreview | null) => {
      if (settled) return;
      settled = true;
      image.onload = null;
      image.onerror = null;
      signal.removeEventListener("abort", abort);
      if (signal.aborted) image.src = "";
      resolve(result);
    };
    const abort = () => finish(null);

    image.onerror = () => finish(null);
    image.onload = () => {
      image.decode().then(
        () => finish(signal.aborted ? null : preview),
        () => finish(null),
      );
    };
    signal.addEventListener("abort", abort, { once: true });
    image.src = preview.src;
  });
}

function decodeArtwork(src: string, signal: AbortSignal): Promise<boolean> {
  return decodePreview({ key: src, src, title: "" }, signal).then((result) => result !== null);
}

export function ProjectTrainBackdrop({
  projects,
  assetBase,
  pinned = true,
  loading = false,
  active = true,
}: ProjectTrainBackdropProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeGroupsRef = useRef<TrainPreview[][]>([]);
  const pendingGroupsRef = useRef<TrainPreview[][] | null>(null);
  const passIndexRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const savedMotionTimeRef = useRef<CSSNumberish | null>(null);
  const commitRef = useRef<() => void>(() => undefined);
  const scheduleRef = useRef<() => void>(() => undefined);
  const releaseInitialPassRef = useRef<() => void>(() => undefined);
  const artworkDecodedRef = useRef(false);
  const previewDecodeSettledRef = useRef(false);
  const initialPassReleasedRef = useRef(false);
  const loadingRef = useRef(loading);
  const activeRef = useRef(active);
  const syncPlaybackRef = useRef<() => void>(() => undefined);
  const [currentGroup, setCurrentGroup] = useState<TrainPreview[]>([]);
  const [artworkReady, setArtworkReady] = useState(false);
  loadingRef.current = loading;
  activeRef.current = active;

  const candidatePreviews = getLaunchablePreviewSources(projects, assetBase);
  const previewSignature = JSON.stringify(candidatePreviews);
  const stableCandidates = useMemo(
    () => candidatePreviews,
    // The serialized value deliberately prevents identical query refetches from
    // restarting image decoding or disturbing the current animation pass.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [previewSignature],
  );

  const artworkSources = useMemo(
    () => Object.values(TRAIN_ASSETS).map((path) => joinAssetPath(assetBase, path)),
    [assetBase],
  );
  const artworkSignature = JSON.stringify(artworkSources);

  useEffect(() => {
    const controller = new AbortController();
    artworkDecodedRef.current = false;
    setArtworkReady(false);

    Promise.all(
      artworkSources.map((src) => decodeArtwork(src, controller.signal)),
    ).then((results) => {
      if (controller.signal.aborted) return;
      const ready = results.every(Boolean);
      artworkDecodedRef.current = ready;
      setArtworkReady(ready);
      releaseInitialPassRef.current();
    });

    return () => controller.abort();
    // The signature keeps an equivalent asset base from restarting the gate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artworkSignature]);

  useEffect(() => {
    const controller = new AbortController();
    if (!initialPassReleasedRef.current) {
      previewDecodeSettledRef.current = false;
    }
    if (loading) {
      pendingGroupsRef.current = null;
      return () => controller.abort();
    }

    Promise.all(
      stableCandidates.map((preview) => decodePreview(preview, controller.signal)),
    ).then((decoded) => {
      if (controller.signal.aborted) return;
      pendingGroupsRef.current = groupPreviews(
        decoded.filter((preview): preview is TrainPreview => preview !== null),
      );
      previewDecodeSettledRef.current = true;
      if (initialPassReleasedRef.current) {
        commitRef.current();
      } else {
        releaseInitialPassRef.current();
      }
    });

    return () => controller.abort();
  }, [stableCandidates, loading]);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const setScale = () => {
      const bounds = root.getBoundingClientRect();
      // On portrait screens, retain clear sky behind the existing mobile header.
      // The lower scenery still reaches the bottom edge, rather than letterboxing.
      const skyInset = Math.min(100, Math.max(0, (bounds.height - bounds.width) * 0.15));
      root.style.setProperty(
        "--project-train-scale",
        String(getTrainViewportScale(bounds.width, bounds.height)),
      );
      root.style.setProperty("--project-train-sky-inset", `${skyInset}px`);
      root.style.setProperty(
        "--project-train-rail-y",
        `${skyInset + (bounds.height - skyInset) * TRAIN_GEOMETRY.railY / TRAIN_GEOMETRY.sceneHeight}px`,
      );
    };

    setScale();
    const resizeObserver = new ResizeObserver(setScale);
    resizeObserver.observe(root);

    const animation = track.animate(
      [
        { transform: `translate3d(${TRAIN_GEOMETRY.startX}px, 0, 0)`, offset: 0 },
        {
          transform: `translate3d(${TRAIN_GEOMETRY.startX}px, 0, 0)`,
          offset: TRAIN_GEOMETRY.departureOffset,
        },
        {
          transform: `translate3d(${TRAIN_GEOMETRY.endX}px, 0, 0)`,
          offset: TRAIN_GEOMETRY.arrivalOffset,
        },
        { transform: `translate3d(${TRAIN_GEOMETRY.endX}px, 0, 0)`, offset: 1 },
      ],
      {
        duration: TRAIN_GEOMETRY.passDurationMs,
        iterations: Infinity,
        easing: "linear",
        fill: "both",
      },
    );
    animation.id = PROJECT_TRAIN_ANIMATION_ID;
    animation.pause();
    animation.currentTime = 0;
    animationRef.current = animation;

    const clearTimer = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const showNextGroup = () => {
      if (pendingGroupsRef.current !== null) {
        activeGroupsRef.current = pendingGroupsRef.current;
        pendingGroupsRef.current = null;
      }

      const groups = activeGroupsRef.current;
      if (groups.length === 0) {
        passIndexRef.current = 0;
        setCurrentGroup([]);
        return;
      }

      const group = groups[passIndexRef.current % groups.length] ?? [];
      passIndexRef.current += 1;
      setCurrentGroup(group);
    };

    let lastSwappedIteration = -1;
    const scheduleSwap = () => {
      clearTimer();
      if (
        document.hidden ||
        !activeRef.current ||
        reducedMotionRef.current ||
        animation.playState === "idle"
      ) return;

      const currentTime = Number(animation.currentTime ?? 0);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const wakeTime = Number(animation.currentTime ?? 0);
        const iteration = Math.floor(wakeTime / TRAIN_GEOMETRY.passDurationMs);
        const wakePhase = getAnimationPhase(
          wakeTime,
          TRAIN_GEOMETRY.passDurationMs,
        );
        // Timers can be throttled even before visibilitychange is delivered.
        // Never exchange a carriage while a delayed callback finds it onstage.
        if (isTrainOffscreen(wakePhase) && iteration > lastSwappedIteration) {
          lastSwappedIteration = iteration;
          showNextGroup();
        }
        scheduleSwap();
      }, nextSwapDelay(currentTime, lastSwappedIteration));
    };

    const commitWhenSafe = () => {
      if (reducedMotionRef.current) {
        showNextGroup();
        return;
      }
      const phase = getAnimationPhase(
        animation.currentTime,
        TRAIN_GEOMETRY.passDurationMs,
      );
      if (isTrainOffscreen(phase)) showNextGroup();
      scheduleSwap();
    };

    commitRef.current = commitWhenSafe;
    scheduleRef.current = scheduleSwap;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotionPreference = () => {
      reducedMotionRef.current = motionQuery.matches;
      clearTimer();

      if (motionQuery.matches) {
        savedMotionTimeRef.current = animation.currentTime;
        animation.pause();
        animation.currentTime =
          TRAIN_GEOMETRY.staticOffset * TRAIN_GEOMETRY.passDurationMs;
      } else {
        if (savedMotionTimeRef.current !== null) {
          animation.currentTime = savedMotionTimeRef.current;
          savedMotionTimeRef.current = null;
        }
        if (initialPassReleasedRef.current && !document.hidden && activeRef.current) {
          animation.play();
          scheduleSwap();
        }
      }
    };

    const handleVisibility = () => {
      clearTimer();
      if (document.hidden || !activeRef.current) {
        animation.pause();
      } else if (
        initialPassReleasedRef.current &&
        !reducedMotionRef.current
      ) {
        animation.play();
        scheduleSwap();
      }
    };

    const releaseInitialPass = () => {
      if (
        initialPassReleasedRef.current ||
        !artworkDecodedRef.current ||
        !previewDecodeSettledRef.current ||
        loadingRef.current
      ) return;

      initialPassReleasedRef.current = true;
      showNextGroup();
      if (reducedMotionRef.current) {
        animation.pause();
        animation.currentTime =
          TRAIN_GEOMETRY.staticOffset * TRAIN_GEOMETRY.passDurationMs;
      } else if (!document.hidden && activeRef.current) {
        animation.play();
        scheduleSwap();
      }
    };

    motionQuery.addEventListener("change", applyMotionPreference);
    document.addEventListener("visibilitychange", handleVisibility);
    releaseInitialPassRef.current = releaseInitialPass;
    syncPlaybackRef.current = handleVisibility;
    applyMotionPreference();
    releaseInitialPass();

    return () => {
      clearTimer();
      commitRef.current = () => undefined;
      scheduleRef.current = () => undefined;
      releaseInitialPassRef.current = () => undefined;
      syncPlaybackRef.current = () => undefined;
      motionQuery.removeEventListener("change", applyMotionPreference);
      document.removeEventListener("visibilitychange", handleVisibility);
      resizeObserver.disconnect();
      animation.cancel();
      animationRef.current = null;
      activeGroupsRef.current = [];
      pendingGroupsRef.current = null;
      passIndexRef.current = 0;
      reducedMotionRef.current = false;
      savedMotionTimeRef.current = null;
      artworkDecodedRef.current = false;
      previewDecodeSettledRef.current = false;
      initialPassReleasedRef.current = false;
    };
    // The WAAPI clock is intentionally created exactly once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Pause the existing clock instead of remounting when another backdrop is selected.
    syncPlaybackRef.current();
  }, [active]);

  const sceneStyle = {
    "--project-train-locomotive-width": `${TRAIN_GEOMETRY.locomotiveWidth}px`,
    "--project-train-locomotive-height": `${TRAIN_GEOMETRY.locomotiveHeight}px`,
    "--project-train-flatbed-width": `${TRAIN_GEOMETRY.flatbedWidth}px`,
    "--project-train-flatbed-height": `${TRAIN_GEOMETRY.flatbedHeight}px`,
    "--project-train-carriage-base-height": `${TRAIN_GEOMETRY.carriageBaseHeight}px`,
    "--project-train-engine-gap": `${TRAIN_GEOMETRY.engineGap}px`,
    "--project-train-car-gap": `${TRAIN_GEOMETRY.carGap}px`,
    "--project-train-preview-x": `${TRAIN_GEOMETRY.screenshotInsetX}px`,
    "--project-train-preview-top": `${TRAIN_GEOMETRY.screenshotInsetTop}px`,
    "--project-train-preview-width": `${TRAIN_GEOMETRY.screenshotWidth}px`,
    "--project-train-preview-height": `${TRAIN_GEOMETRY.screenshotHeight}px`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`project-train-backdrop${pinned ? "" : " project-train-backdrop--absolute"}${active ? "" : " project-train-backdrop--inactive"}`}
      aria-hidden="true"
    >
      <div
        className={`project-train-scene${artworkReady ? " project-train-scene--ready" : ""}`}
        style={sceneStyle}
      >
        <img
          className="project-train-scene-art"
          src={joinAssetPath(assetBase, TRAIN_ASSETS.scene)}
          alt=""
          draggable={false}
        />
        <div className="project-train-track-plane">
          <div
            ref={trackRef}
            className="project-train-track"
            data-animation-id={PROJECT_TRAIN_ANIMATION_ID}
          >
            <img
              className="project-train-locomotive"
              src={joinAssetPath(assetBase, TRAIN_ASSETS.locomotive)}
              alt=""
              draggable={false}
            />
            {currentGroup.map((preview) => (
              <div className="project-train-flatbed" key={preview.key}>
                <div className="project-train-panel">
                  {preview.title && (
                    <div className="project-train-title">{preview.title}</div>
                  )}
                  <img
                    className="project-train-preview"
                    src={preview.src}
                    alt=""
                    draggable={false}
                  />
                </div>
                <img
                  className="project-train-flatbed-art"
                  src={joinAssetPath(assetBase, TRAIN_ASSETS.carriage)}
                  alt=""
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
        <img
          className="project-train-cliffs"
          src={joinAssetPath(assetBase, TRAIN_ASSETS.cliffs)}
          alt=""
          draggable={false}
        />
      </div>
    </div>
  );
}
