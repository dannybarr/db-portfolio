import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';

/**
 * A dropped folder position, stored as a fraction of the scene's size so a
 * window resize keeps the folder in the same relative spot instead of leaving
 * it stranded off-screen.
 */
export type FolderOffset = { fx: number; fy: number };

type Offsets = Record<string, FolderOffset>;

const STORAGE_KEY = 'portfolio.folder-offsets.v1';
/** Movement (px) below which the interaction is still treated as a click. */
const DRAG_THRESHOLD = 4;
/** Breathing room kept between a dropped folder and the edge of the scene. */
const EDGE_PAD = 8;
/** Rapid repeat drags of the same folder collapse into one save. */
const SAVE_DEBOUNCE_MS = 250;

function readStored(): Offsets {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const out: Offsets = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const v = value as Partial<FolderOffset> | null;
      if (!v || typeof v.fx !== 'number' || typeof v.fy !== 'number') continue;
      if (!Number.isFinite(v.fx) || !Number.isFinite(v.fy)) continue;
      out[key] = { fx: v.fx, fy: v.fy };
    }
    return out;
  } catch {
    return {};
  }
}

function writeStored(offsets: Offsets) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(offsets));
  } catch {
    /* storage unavailable (private mode / quota) — the move still applies for this session */
  }
}

/** A folder this visitor moved: the position to paint, and whether a save is out. */
type SaveState = { desired: FolderOffset; inFlight: boolean };

const clamp = (v: number, lo: number, hi: number) => (lo > hi ? lo : Math.min(Math.max(v, lo), hi));

type DragSession = {
  key: string;
  pointerId: number;
  el: HTMLElement;
  startX: number;
  startY: number;
  baseFx: number;
  baseFy: number;
  sceneW: number;
  sceneH: number;
  /** Clamp range for the pointer delta, in px. */
  minDx: number;
  maxDx: number;
  minDy: number;
  maxDy: number;
  dx: number;
  dy: number;
  moved: boolean;
};

/**
 * macOS-style desktop icon dragging: press and hold a folder to pick it up, it
 * follows the pointer 1:1, and a release drops it there. A press that never
 * crosses the movement threshold stays a plain click, so opening a project is
 * untouched.
 */
export function useFolderDrag(
  sceneRef: RefObject<HTMLElement | null>,
  options?: {
    /** Positions loaded from the server — the source of truth once they arrive. */
    serverOffsets?: Offsets | undefined;
    /** Persist a dropped position. Failures are swallowed; the move still stands locally. */
    onPersist?: ((key: string, offset: FolderOffset) => void | Promise<unknown>) | undefined;
  },
) {
  const { serverOffsets, onPersist } = options ?? {};
  // The local cache is only an instant-paint hint so a returning visitor never
  // sees the default scatter flash; the server layout replaces it on arrival.
  const [offsets, setOffsets] = useState<Offsets>(readStored);
  const [scene, setScene] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [draggingKey, setDraggingKey] = useState<string | null>(null);

  const sessionRef = useRef<DragSession | null>(null);
  const offsetsRef = useRef(offsets);
  offsetsRef.current = offsets;
  /** Set when a pointer sequence turned into a drag, so the trailing click is ignored. */
  const suppressClickRef = useRef(false);
  const persistRef = useRef(onPersist);
  persistRef.current = onPersist;
  /**
   * Where this visitor last dropped each folder they moved. The entry outlives
   * the request on purpose: it is what the folder is painted at for the rest of
   * the session, so neither a failed save nor a projects refetch that predates
   * (or never received) the write can snap the folder back.
   */
  const overridesRef = useRef<Map<string, SaveState>>(new Map());
  const timersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const id of timers.values()) window.clearTimeout(id);
      timers.clear();
    };
  }, []);

  /**
   * Send one folder's latest position, one request at a time. A drop that lands
   * while a request is in flight only updates `desired`; it is sent when that
   * request settles, so an older PATCH can never land after a newer one and
   * overwrite the shared layout with a stale position.
   */
  const flush = useCallback((key: string) => {
    const state = overridesRef.current.get(key);
    if (!state || state.inFlight) return;
    const sent = state.desired;
    state.inFlight = true;
    const settle = () => {
      state.inFlight = false;
      // A newer drop arrived mid-flight — send it now.
      if (state.desired !== sent) flush(key);
    };
    void Promise.resolve(persistRef.current?.(key, sent)).then(settle, settle);
  }, []);

  // The server layout is the source of truth. Once it lands it replaces the
  // local instant-paint cache, except for folders this visitor has moved
  // themselves, which stay where they were dropped.
  useEffect(() => {
    if (!serverOffsets) return;
    setOffsets((prev) => {
      const next: Offsets = { ...serverOffsets };
      for (const [key, state] of overridesRef.current) next[key] = state.desired;
      const sameSize = Object.keys(prev).length === Object.keys(next).length;
      if (sameSize && Object.keys(next).every((k) => prev[k]?.fx === next[k]!.fx && prev[k]?.fy === next[k]!.fy)) {
        return prev;
      }
      writeStored(next);
      return next;
    });
  }, [serverOffsets]);

  // Track the scene box so stored fractions can be resolved to pixels. This
  // measures before the browser paints, so a returning visitor's folders are
  // drawn at their saved spots rather than flashing at the default scatter.
  useLayoutEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const measure = () => setScene({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sceneRef]);

  /** Pixel offset to apply to a tile, resolved from its stored fraction. */
  const offsetPx = useCallback(
    (key: string) => {
      const o = offsets[key];
      if (!o) return { x: 0, y: 0 };
      return { x: o.fx * scene.w, y: o.fy * scene.h };
    },
    [offsets, scene.w, scene.h],
  );

  const write = useCallback((el: HTMLElement, x: number, y: number) => {
    // The tiles are centred with a -50% translate; the drag offset rides along
    // in the same `translate` property so it never fights the centring or the
    // hover-scale transform.
    el.style.translate = `calc(-50% + ${x}px) calc(-50% + ${y}px)`;
  }, []);

  const endSession = useCallback(
    (commit: boolean) => {
      const s = sessionRef.current;
      if (!s) return;
      sessionRef.current = null;
      try {
        if (s.el.hasPointerCapture(s.pointerId)) s.el.releasePointerCapture(s.pointerId);
      } catch {
        /* the pointer is already gone */
      }
      setDraggingKey(null);
      // A press that never crossed the threshold stays a click — nothing to save.
      if (!s.moved) return;
      suppressClickRef.current = true;
      const fx = commit && s.sceneW ? s.baseFx + s.dx / s.sceneW : s.baseFx;
      const fy = commit && s.sceneH ? s.baseFy + s.dy / s.sceneH : s.baseFy;
      setOffsets((prev) => {
        const next = { ...prev, [s.key]: { fx, fy } };
        writeStored(next);
        return next;
      });
      if (!commit) {
        write(s.el, s.baseFx * s.sceneW, s.baseFy * s.sceneH);
        return;
      }
      // Optimistic: the folder is already where it was dropped. The save rides
      // along in the background and rapid repeat drags of the same folder
      // collapse into a single request.
      const key = s.key;
      const state = overridesRef.current.get(key);
      if (state) state.desired = { fx, fy };
      else overridesRef.current.set(key, { desired: { fx, fy }, inFlight: false });
      const timers = timersRef.current;
      const existing = timers.get(key);
      if (existing) window.clearTimeout(existing);
      timers.set(
        key,
        window.setTimeout(() => {
          timers.delete(key);
          flush(key);
        }, SAVE_DEBOUNCE_MS),
      );
    },
    [write, flush],
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>, key: string) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      const sceneEl = sceneRef.current;
      if (!sceneEl || sessionRef.current) return;
      const el = e.currentTarget;
      // A fresh press always starts as a potential click.
      suppressClickRef.current = false;
      const rect = el.getBoundingClientRect();
      const sceneRect = sceneEl.getBoundingClientRect();
      const base = offsetsRef.current[key] ?? { fx: 0, fy: 0 };
      sessionRef.current = {
        key,
        pointerId: e.pointerId,
        el,
        startX: e.clientX,
        startY: e.clientY,
        baseFx: base.fx,
        baseFy: base.fy,
        sceneW: sceneRect.width,
        sceneH: sceneRect.height,
        minDx: sceneRect.left + EDGE_PAD - rect.left,
        maxDx: sceneRect.right - EDGE_PAD - rect.right,
        minDy: sceneRect.top + EDGE_PAD - rect.top,
        maxDy: sceneRect.bottom - EDGE_PAD - rect.bottom,
        dx: 0,
        dy: 0,
        moved: false,
      };
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* capture is best-effort */
      }
    },
    [sceneRef],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const s = sessionRef.current;
      if (!s || e.pointerId !== s.pointerId) return;
      const rawX = e.clientX - s.startX;
      const rawY = e.clientY - s.startY;
      if (!s.moved) {
        if (Math.hypot(rawX, rawY) < DRAG_THRESHOLD) return;
        s.moved = true;
        setDraggingKey(s.key);
      }
      let dx = clamp(rawX, s.minDx, s.maxDx);
      let dy = clamp(rawY, s.minDy, s.maxDy);
      s.dx = dx;
      s.dy = dy;
      write(s.el, s.baseFx * s.sceneW + dx, s.baseFy * s.sceneH + dy);
    },
    [write],
  );

  const onPointerUp = useCallback(() => endSession(true), [endSession]);
  const onPointerCancel = useCallback(() => endSession(false), [endSession]);

  /** True when the click that just fired was the tail of a drag. */
  const consumeClickSuppression = useCallback(() => {
    const suppressed = suppressClickRef.current;
    suppressClickRef.current = false;
    return suppressed;
  }, []);

  /** Abandon an in-flight drag (e.g. the modal took over the screen). */
  const cancelDrag = useCallback(() => endSession(false), [endSession]);

  return {
    offsetPx,
    draggingKey,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    consumeClickSuppression,
    cancelDrag,
  };
}
