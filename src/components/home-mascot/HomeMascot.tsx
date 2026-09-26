import { useEffect, useRef, useState, type ReactNode } from "react";
import { buildMascotTimeline, computeMascotGeometry, type MascotSegment, type MascotTrack } from "./mascotChoreo";
import { ClaudeMascot, CodexMascot, Football, Goal, GrokMascot, Ladder, OfficeScene, PadelCourt, PitchBackdrop, PubScene } from "./mascots";
import "./mascot.css";

export function HomeMascot({ suspended = false, logo }: { suspended?: boolean; logo?: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<Partial<Record<MascotTrack, HTMLElement>>>({});
  const animationsRef = useRef<Animation[]>([]);
  const segmentRef = useRef(0);
  const reducedRef = useRef(false);
  const visibleRef = useRef(true);
  const manualPausedRef = useRef(false);
  const suspendedRef = useRef(suspended);
  const [manualPaused, setManualPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [label, setLabel] = useState("Mascots at play");
  const timelineRef = useRef<MascotSegment[]>([]);

  suspendedRef.current = suspended;
  manualPausedRef.current = manualPaused;

  useEffect(() => {
    const host = hostRef.current;
    const stage = stageRef.current;
    if (!host || !stage) return;
    let disposed = false;

    const stop = () => {
      for (const animation of animationsRef.current) animation.cancel();
      animationsRef.current = [];
    };
    const shouldPause = () => suspendedRef.current || manualPausedRef.current || document.hidden || !visibleRef.current;
    const sync = () => {
      for (const animation of animationsRef.current) shouldPause() ? animation.pause() : animation.play();
      setLabel(reducedRef.current ? "Motion reduced" : shouldPause() ? "Mascots paused" : "Mascots at play");
    };
    const play = (index: number) => {
      if (disposed || reducedRef.current) return;
      stop();
      const segment = timelineRef.current[index];
      if (!segment) return;
      segmentRef.current = index;
      host.dataset.activity = "";
      void host.offsetWidth;
      host.dataset.activity = segment.name;
      host.style.setProperty("--mascot-duration", `${segment.duration}ms`);
      setLabel(segment.label);
      const live: Animation[] = [];
      for (const [track, keyframes] of Object.entries(segment.tracks) as [MascotTrack, Keyframe[]][]) {
        const element = elementsRef.current[track];
        if (!element) continue;
        const animation = element.animate(keyframes, { duration: segment.duration, fill: "both", easing: "linear" });
        live.push(animation);
      }
      animationsRef.current = live;
      const lead = live[0];
      if (lead) lead.onfinish = () => play((index + 1) % timelineRef.current.length);
      sync();
    };
    const measure = () => {
      const bounds = stage.getBoundingClientRect();
      const dock = document.querySelector<HTMLElement>("[data-mascot-dock]")?.getBoundingClientRect();
      const dockTop = dock ? Math.max(54, dock.top - bounds.top) : bounds.height - 116;
      timelineRef.current = buildMascotTimeline(computeMascotGeometry(bounds.width, bounds.height), dockTop);
      if (!reducedRef.current) play(segmentRef.current % timelineRef.current.length);
    };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => {
      reducedRef.current = motion.matches;
      setReduced(motion.matches);
      stop();
      if (motion.matches) {
        const first = timelineRef.current[0];
        if (first) for (const [track, frames] of Object.entries(first.tracks) as [MascotTrack, Keyframe[]][]) {
          const element = elementsRef.current[track];
          const firstFrame = frames[0];
          if (element && firstFrame) element.animate([firstFrame, firstFrame], { duration: 1, fill: "both" });
        }
        setLabel("Motion reduced");
      } else play(segmentRef.current);
    };
    const observer = new IntersectionObserver(([entry]) => { visibleRef.current = entry?.isIntersecting ?? true; sync(); }, { threshold: .05 });
    const resizeObserver = new ResizeObserver(measure);
    const visibility = () => sync();
    observer.observe(host);
    resizeObserver.observe(stage);
    motion.addEventListener("change", applyMotion);
    document.addEventListener("visibilitychange", visibility);
    measure();
    applyMotion();
    return () => {
      disposed = true;
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      motion.removeEventListener("change", applyMotion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    for (const animation of animationsRef.current) suspended || manualPaused ? animation.pause() : animation.play();
    setLabel(reduced ? "Motion reduced" : suspended || manualPaused ? "Mascots paused" : "Mascots at play");
  }, [suspended, manualPaused, reduced]);

  const bind = (track: MascotTrack) => (node: HTMLDivElement | null) => {
    if (node) elementsRef.current[track] = node;
    else delete elementsRef.current[track];
  };

  return <div ref={hostRef} className="mascot-host" data-testid="home-mascot">
    <div ref={stageRef} className="mascot-stage" aria-hidden="true">
      <div ref={bind("pitch")} className="mascot-scene mascot-scene--pitch"><PitchBackdrop /></div>
      <div ref={bind("goal")} className="mascot-scene mascot-scene--goal"><Goal /></div>
      <div ref={bind("padel")} className="mascot-scene mascot-scene--padel"><PadelCourt /></div>
      <div ref={bind("office")} className="mascot-scene mascot-scene--office"><OfficeScene /></div>
      <div ref={bind("pub")} className="mascot-scene mascot-scene--pub"><PubScene /></div>
      <div ref={bind("ladder")} className="mascot-ladder"><Ladder /></div>
      <div ref={bind("ball")} className="mascot-ball"><Football id="mascot-football" /></div>
      <div ref={bind("grok")} className="mascot-performer mascot-performer--grok"><GrokMascot /></div>
      <div ref={bind("codex")} className="mascot-performer mascot-performer--codex"><CodexMascot /></div>
      <div ref={bind("claude")} className="mascot-performer mascot-performer--claude"><ClaudeMascot /></div>
      <div className="mascot-dock-badge">{logo ?? <span>DBLABS</span>}</div>
    </div>
    <span className="mascot-status" role="status">{label}</span>
    {!reduced && <button className="mascot-toggle" type="button" onClick={() => setManualPaused((value) => !value)}>{manualPaused ? "Play motion" : "Pause motion"}</button>}
  </div>;
}
