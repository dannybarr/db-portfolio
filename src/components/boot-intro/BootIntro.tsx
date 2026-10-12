import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { Claude, Codex, Grok } from "@/components/home-mascot/mascots";
import { PROJECTS } from "@/lib/project-content";
import "./boot-intro.css";
import { INTRO_CLASS } from "./intro-head";

/**
 * Intro. A ten-second terminal boot sequence runs (self test, project files
 * ticking in, agents waking), then Claude, Codex and Grok
 * build DANNY from blocks, then play it in on drums for three seconds: a
 * roll that speeds up, a beat of silence and one big hit. On that hit the
 * word flies into the DANIEL BARR nameplate as the dark stage irises open
 * onto the desktop.
 *
 * Whether it plays is decided before first paint by INTRO_HEAD_SCRIPT (see
 * __root.tsx): every visit to the home page, never for reduced motion, and
 * always when the address carries ?intro. The skip button (or Esc, its
 * keyboard shortcut) ends it at any point.
 */

type Who = "claude" | "codex" | "grok";

// 5 × 7 pixel glyphs.
const GLYPHS: Record<string, string[]> = {
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
};
const WORD = "DANNY";
const BUILDER: Who[] = ["claude", "claude", "codex", "codex", "grok"];
const COLS = WORD.length * 5 + (WORD.length - 1);
// Centre column of each builder's letters: D–A, N–N, Y.
const BUILDER_COL: Record<Who, number> = { claude: 5, codex: 17, grok: 26.5 };
const BUILD_SPREAD = 1500;
const FLIGHT = 560;

type Block = { x: number; y: number; size: number; by: Who; row: number; col: number };
type Layout = {
  w: number;
  h: number;
  cell: number;
  x0: number;
  y0: number;
  mascot: number;
  baseY: number;
  blocks: Block[];
};

function measure(w: number, h: number): Layout {
  const cell = Math.max(7, Math.min((w * 0.74) / COLS, (h * 0.34) / 7, 46));
  const size = cell * 0.84;
  const x0 = (w - COLS * cell) / 2;
  // Sit a little lower on tall phone screens so the scene is centred.
  const y0 = Math.round(h * (h > w * 1.2 ? 0.37 : 0.3));
  const mascot = Math.round(Math.min(Math.max(cell * 2.7, 54), 118));
  const baseY = y0 + 7 * cell + Math.max(cell * 1.7, 24) + mascot;
  const blocks: Block[] = [];
  [...WORD].forEach((letter, li) => {
    GLYPHS[letter]!.forEach((line, row) => {
      [...line].forEach((bit, c) => {
        if (bit !== "1") return;
        const col = li * 6 + c;
        blocks.push({
          x: x0 + col * cell + (cell - size) / 2,
          y: y0 + row * cell + (cell - size) / 2,
          size,
          by: BUILDER[li]!,
          row,
          col,
        });
      });
    });
  });
  return { w, h, cell, x0, y0, mascot, baseY, blocks };
}

const WHO: Who[] = ["claude", "codex", "grok"];

// Drum shells in each mascot's colour; Grok's is dark so the white orb pops.
const DRUM_SHELL: Record<Who, string> = { claude: "#D97757", codex: "#5F7FE4", grok: "#26262C" };
// Stick angles: up (ready), down (on the head) and high (before the big hit).
const STICK = { up: 6, down: 27, high: -52 };
const ROLL_MS = 1950;

function Drum({ shell }: { shell: string }) {
  const rim = "#CBD3DF";
  const ink = "#14161F";
  return (
    <svg viewBox="0 0 100 78" fill="none" aria-hidden="true" focusable="false">
      <path d="M8 24V56Q8 70 50 70Q92 70 92 56V24Z" fill={shell} stroke={ink} strokeWidth="2.5" />
      <path d="M15 31V55" stroke="#fff" strokeOpacity=".32" strokeWidth="3" strokeLinecap="round" />
      {[22, 36, 50, 64, 78].map((x) => (
        <path key={x} d={`M${x} 33V64`} stroke={rim} strokeWidth="2.6" strokeLinecap="round" />
      ))}
      <path d="M8 56Q8 70 50 70Q92 70 92 56" stroke={rim} strokeWidth="5" />
      <ellipse cx="50" cy="24" rx="42" ry="12" fill={rim} stroke={ink} strokeWidth="2.5" />
      <ellipse cx="50" cy="23" rx="37" ry="9.5" fill="#F4F1EA" />
    </svg>
  );
}

function Stick() {
  return (
    <svg viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <rect x="0" y="2" width="92" height="4" rx="2" fill="#E8C38F" />
      <circle cx="93.5" cy="4" r="3.6" fill="#F6E2BF" />
    </svg>
  );
}

// The boot log mounts the same projects the desktop shows as folders.
const BOOT_PROJECTS = [...PROJECTS]
  .filter((p) => Boolean(p.url || p.videoUrl))
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map((p) => p.title.toLowerCase());

const ABORT = Symbol("intro-skipped");
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const isVisible = (el: Element) => (el as HTMLElement).offsetParent !== null;

export function BootIntro() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains(INTRO_CLASS)) return;
    if (performance.now() > 4500) {
      html.classList.remove(INTRO_CLASS);
      return;
    }
    setActive(true);
  }, []);
  return active ? <IntroStage onDone={() => setActive(false)} /> : null;
}

function IntroStage({ onDone }: { onDone: () => void }) {
  const [layout] = useState(() => measure(window.innerWidth, window.innerHeight));
  const rootRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement>(null);
  const mascotRefs = useRef<Partial<Record<Who, HTMLDivElement | null>>>({});
  const groupRefs = useRef<Partial<Record<Who, HTMLDivElement | null>>>({});
  const drumRefs = useRef<Partial<Record<Who, HTMLDivElement | null>>>({});
  const stickRefs = useRef<Partial<Record<Who, [HTMLDivElement | null, HTMLDivElement | null]>>>(
    {},
  );
  const ringRefs = useRef<Partial<Record<Who, HTMLSpanElement | null>>>({});
  const flashRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});

  // The stage now covers the page, so the pre-paint cover can go.
  useLayoutEffect(() => {
    document.documentElement.classList.remove(INTRO_CLASS);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const anims: Animation[] = [];
    let phase: "play" | "reveal" | "done" = "play";

    const track = (el: Element | null, frames: Keyframe[], opts: KeyframeAnimationOptions) => {
      if (!el) return null;
      const a = el.animate(frames, opts);
      anims.push(a);
      return a;
    };
    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        if (signal.aborted) return reject(ABORT);
        const t = window.setTimeout(resolve, ms);
        signal.addEventListener(
          "abort",
          () => {
            window.clearTimeout(t);
            reject(ABORT);
          },
          { once: true },
        );
      });

    const nameplate = [...document.querySelectorAll<HTMLElement>('[data-testid="text-name"]')].find(
      isVisible,
    );
    if (nameplate) nameplate.style.opacity = "0";
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const mascots = (["claude", "codex", "grok"] as Who[]).map(
      (who) => mascotRefs.current[who] ?? null,
    );
    const blockEls: HTMLElement[] = [];
    blocksRef.current
      ?.querySelectorAll<HTMLElement>(".boot-block")
      .forEach((el) => (blockEls[Number(el.dataset["i"])] = el));
    const drums = WHO.map((who) => drumRefs.current[who] ?? null);

    /** Pop the desktop in as a ripple from the centre of the screen. */
    const revealDesktop = (fast: boolean) => {
      const cx = layout.w / 2;
      const cy = layout.h * 0.46;
      const items = [
        ...document.querySelectorAll<HTMLElement>(
          '.file-tile, [data-section-card], [data-testid="img-engineer"]',
        ),
      ].filter(isVisible);
      for (const el of items) {
        const r = el.getBoundingClientRect();
        const d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy);
        el.animate(
          { opacity: [0, 1, 1], scale: ["0.55", "1.07", "1"] },
          {
            duration: fast ? 380 : 560,
            delay: fast ? Math.min(d * 0.15, 220) : 180 + Math.min(d * 0.45, 650),
            easing: "cubic-bezier(.2,.8,.3,1.2)",
            fill: "backwards",
          },
        );
      }
    };

    const finish = () => {
      if (phase === "done") return;
      phase = "done";
      if (nameplate) nameplate.style.opacity = "";
      document.body.style.overflow = previousOverflow;
      // Drop ?intro so a refresh doesn't replay it.
      if (/[?&]intro\b/.test(window.location.search)) {
        const url = new URL(window.location.href);
        url.searchParams.delete("intro");
        window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
      }
      onDone();
    };

    skipRef.current = () => {
      if (phase !== "play") return;
      phase = "reveal";
      controller.abort();
      anims.forEach((a) => a.cancel());
      revealDesktop(true);
      if (nameplate) nameplate.animate({ opacity: [0, 1] }, { duration: 300, fill: "backwards" });
      const out = rootRef.current?.animate(
        { opacity: [1, 0] },
        { duration: 280, easing: "ease-out", fill: "forwards" },
      );
      if (out) out.onfinish = finish;
      else finish();
    };

    // ---------- The boot sequence: about ten seconds ----------
    const logRow = () => {
      const row = document.createElement("div");
      logRef.current?.appendChild(row);
      return row;
    };
    const piece = (row: HTMLElement, cls?: string) => {
      const span = document.createElement("span");
      if (cls) span.className = cls;
      row.appendChild(span);
      return span;
    };
    /** Types text into a new span, a few characters at a time. */
    const type = async (row: HTMLElement, text: string, cls?: string, ms = 13) => {
      const span = piece(row, cls);
      for (let c = 0; c < text.length; c += 2) {
        span.textContent = text.slice(0, c + 2);
        await sleep(ms);
      }
    };
    /** A task line: label, dots that fill while it "runs", then a result. */
    const task = async (label: string, result: string, runMs: number, resultCls = "ok") => {
      const row = logRow();
      await type(row, label);
      const dots = piece(row, "dim");
      const steps = 8;
      for (let d = 0; d < steps; d++) {
        dots.textContent = " " + "·".repeat(d + 1);
        await sleep(runMs / steps);
      }
      await type(piece(row), " ", undefined, 0);
      await type(row, result, resultCls, 0);
    };

    const bootLog = async () => {
      if (!logRef.current) return;
      // 1. Boot banner.
      let row = logRow();
      await type(row, "dblabs os 26.10", "hi", 30);
      await type(row, "  ·  cold boot", "dim", 22);
      await sleep(300);

      // 2. Self test and modules.
      await task("› power on self test", "ok", 450);
      await sleep(150);
      await task("› loading modules: ambition · curiosity · coffee", "ok", 500);
      await sleep(250);

      // 3. Project files tick in one by one.
      row = logRow();
      await type(row, "› mounting project files");
      const list = document.createElement("div");
      list.className = "boot-list";
      logRef.current.appendChild(list);
      for (const name of BOOT_PROJECTS) {
        const item = piece(list, "boot-item");
        item.textContent = name + " ";
        piece(item, "ok").textContent = "✓";
        await sleep(64);
      }
      await sleep(180);

      // 4. Index progress bar.
      row = logRow();
      await type(row, "› indexing ");
      // Filled cells in white, the rest as dim dots (in the terminal font).
      piece(row, "dim").textContent = "[";
      const filled = piece(row, "hi");
      const empty = piece(row, "dim");
      piece(row, "dim").textContent = "]";
      const count = piece(row, "dim");
      const cells = 20;
      for (let k = 0; k <= cells; k++) {
        filled.textContent = "█".repeat(k);
        empty.textContent = "·".repeat(cells - k);
        count.textContent = " " + Math.round((k / cells) * 100) + "%";
        await sleep(38);
      }
      count.textContent = " " + BOOT_PROJECTS.length + " projects";
      await sleep(300);

      // 5. The agents wake up, each in their own colour.
      row = logRow();
      await type(row, "› waking agents");
      for (const [who, pad] of [
        ["claude", "  "],
        ["codex", "   "],
        ["grok", "    "],
      ] as const) {
        const agent = logRow();
        await type(agent, "   ");
        await type(agent, who, `c-${who}`, 24);
        const dots = piece(agent, "dim");
        for (let d = 0; d < 4; d++) {
          dots.textContent = pad + "·".repeat(d + 1);
          await sleep(85);
        }
        await type(agent, "  ready", "ok", 0);
        await sleep(160);
      }
      await sleep(200);
      await task("› handshake: claude ⇄ codex ⇄ grok", "ok", 430);
      await sleep(250);

      // 6. Hand over to the build.
      row = logRow();
      await type(row, "› compiling ");
      await type(row, "danny", "hi", 50);
      piece(row, "boot-caret");
      await sleep(480);
    };

    const run = async () => {
      // ---------- 1. Boot log ----------
      await sleep(150);
      await bootLog();

      // ---------- 2. The build ----------
      track(
        logRef.current,
        [{ opacity: 1 }, { opacity: 0, transform: "translateX(-50%) translateY(-10px)" }],
        {
          duration: 420,
          fill: "forwards",
          easing: "ease-out",
        },
      );
      mascots.forEach((m, i) =>
        track(
          m,
          [
            { opacity: 0, transform: "translateY(28px) scale(.6)" },
            { opacity: 1, transform: "translateY(-6px) scale(1.04)", offset: 0.7 },
            { opacity: 1, transform: "none" },
          ],
          { duration: 460, delay: i * 90, easing: "cubic-bezier(.2,.8,.3,1)", fill: "forwards" },
        ),
      );
      await sleep(360);
      mascots.forEach((m) => m?.classList.add("is-building"));

      const scale = layout.cell / 34;
      for (const who of ["claude", "codex", "grok"] as Who[]) {
        const mine = layout.blocks
          .map((b, i) => ({ b, el: blockEls[i] }))
          .filter(({ b }) => b.by === who)
          .sort((p, q) => q.b.row - p.b.row || p.b.col - q.b.col);
        const sx = layout.x0 + BUILDER_COL[who] * layout.cell;
        const sy = layout.baseY - layout.mascot * 0.72;
        mine.forEach(({ b, el }, i) => {
          const dx = sx - (b.x + b.size / 2);
          const dy = sy - (b.y + b.size / 2);
          const arc = rand(60, 140) * scale;
          const rot = rand(-90, 90);
          track(
            el ?? null,
            [
              { transform: `translate(${dx}px, ${dy}px) scale(.35) rotate(${rot}deg)`, opacity: 0 },
              { opacity: 1, offset: 0.12 },
              {
                transform: `translate(${dx * 0.4}px, ${dy * 0.4 - arc}px) scale(1.12) rotate(${rot / 3}deg)`,
                opacity: 1,
                offset: 0.6,
              },
              { transform: "translate(0, 0) scale(.92)", opacity: 1, offset: 0.86 },
              { transform: "translate(0, 0) scale(1)", opacity: 1 },
            ],
            {
              duration: FLIGHT,
              delay: (i * BUILD_SPREAD) / mine.length,
              easing: "cubic-bezier(.3,.7,.4,1)",
              fill: "both",
            },
          );
        });
      }
      await sleep(BUILD_SPREAD + FLIGHT + 80);
      mascots.forEach((m) => m?.classList.remove("is-building"));

      // A proud little jump and a pulse across the finished word.
      mascots.forEach((m, i) =>
        track(
          m?.firstElementChild ?? null,
          [{ transform: "none" }, { transform: "translateY(-22%)" }, { transform: "none" }],
          {
            duration: 420,
            delay: i * 70,
            easing: "cubic-bezier(.3,0,.3,1)",
          },
        ),
      );
      const nameCentreX = layout.w / 2;
      const nameCentreY = layout.y0 + 3.5 * layout.cell;
      if (blocksRef.current)
        blocksRef.current.style.transformOrigin = `${nameCentreX}px ${nameCentreY}px`;
      track(
        blocksRef.current,
        [
          { transform: "scale(1)" },
          { transform: "scale(1.035)", filter: "brightness(1.35)" },
          { transform: "scale(1)" },
        ],
        {
          duration: 360,
          easing: "ease-in-out",
        },
      );
      await sleep(300);

      // ---------- 3. The drums (3 seconds) ----------
      drums.forEach((d, i) =>
        track(
          d,
          [
            { opacity: 0, transform: "translateY(18px) scale(.4)" },
            { opacity: 1, transform: "translateY(-4px) scale(1.06)", offset: 0.7 },
            { opacity: 1, transform: "none" },
          ],
          { duration: 340, delay: i * 70, easing: "cubic-bezier(.2,.8,.3,1)", fill: "forwards" },
        ),
      );
      await sleep(350);

      const lift = layout.cell;
      const swing = (stick: HTMLDivElement | null, right: boolean, from: number, ms: number) => {
        const k = right ? -1 : 1;
        track(
          stick,
          [
            { transform: `rotate(${from * k}deg)` },
            { transform: `rotate(${STICK.down * k}deg)`, offset: 0.45 },
            { transform: `rotate(${STICK.up * k}deg)` },
          ],
          { duration: ms, easing: "cubic-bezier(.4,0,.2,1)" },
        );
      };
      const hit = (who: Who, side: "L" | "R" | "both", ms: number, big = false) => {
        const [left, right] = stickRefs.current[who] ?? [null, null];
        const from = big ? STICK.high : STICK.up;
        if (side !== "R") swing(left, false, from, ms);
        if (side !== "L") swing(right, true, from, ms);
        track(
          drumRefs.current[who]?.firstElementChild ?? null,
          [
            { transform: "none" },
            { transform: big ? "scale(1.1, .86)" : "scale(1.05, .93)", offset: 0.35 },
            { transform: "none" },
          ],
          { duration: big ? 300 : 150, delay: ms * 0.4, easing: "ease-out" },
        );
        track(
          ringRefs.current[who] ?? null,
          [
            { opacity: big ? 1 : 0.75, transform: "scale(.45)" },
            { opacity: 0, transform: big ? "scale(2.2)" : "scale(1.5)" },
          ],
          { duration: big ? 520 : 300, delay: ms * 0.4, easing: "ease-out" },
        );
        track(
          mascotRefs.current[who]?.firstElementChild ?? null,
          [
            { transform: "none" },
            { transform: "translateY(4%) scale(1.04, .96)" },
            { transform: "none" },
          ],
          { duration: big ? 260 : 130, delay: ms * 0.4 },
        );
        track(
          groupRefs.current[who] ?? null,
          [
            { transform: "translateY(0)" },
            {
              transform: `translateY(${-(big ? 0.7 : 0.22) * lift}px)`,
              filter: big ? "brightness(1.6)" : "brightness(1.15)",
              offset: 0.4,
            },
            { transform: "translateY(0)" },
          ],
          { duration: big ? 460 : 180, delay: ms * 0.4, easing: "cubic-bezier(.2,.8,.3,1)" },
        );
      };

      // An interlocking roll that speeds up: each mascot starts slow and
      // tightens to a buzz, offset so the hits ripple across the word.
      const timers: number[] = [];
      signal.addEventListener("abort", () => timers.forEach((t) => window.clearTimeout(t)), {
        once: true,
      });
      WHO.forEach((who, wi) => {
        let t = [0, 140, 70][wi]!;
        let gap = 300;
        let n = 0;
        while (t < ROLL_MS) {
          const ms = Math.min(160, gap * 0.9);
          const side = n++ % 2 ? "R" : "L";
          timers.push(window.setTimeout(() => hit(who, side, ms), t));
          t += gap;
          gap = Math.max(52, gap * 0.86);
        }
      });
      await sleep(ROLL_MS);

      // A beat of silence, sticks raised high.
      const raised: (Animation | null)[] = [];
      WHO.forEach((who) => {
        const [left, right] = stickRefs.current[who] ?? [null, null];
        raised.push(
          track(
            left,
            [{ transform: `rotate(${STICK.up}deg)` }, { transform: `rotate(${STICK.high}deg)` }],
            { duration: 130, easing: "ease-out", fill: "forwards" },
          ),
          track(
            right,
            [{ transform: `rotate(${-STICK.up}deg)` }, { transform: `rotate(${-STICK.high}deg)` }],
            { duration: 130, easing: "ease-out", fill: "forwards" },
          ),
        );
      });
      await sleep(150);

      // One big unison hit. The swing starts from the raised pose, so the
      // held pose can go and the sticks settle back to rest afterwards.
      raised.forEach((a) => a?.cancel());
      WHO.forEach((who) => hit(who, "both", 220, true));
      track(flashRef.current, [{ opacity: 0 }, { opacity: 0.14, offset: 0.25 }, { opacity: 0 }], {
        duration: 420,
        delay: 90,
      });
      track(
        rootRef.current,
        [
          { transform: "translate(0, 0)" },
          { transform: "translate(-4px, 2px)" },
          { transform: "translate(4px, -2px)" },
          { transform: "translate(-2px, 1px)" },
          { transform: "translate(0, 0)" },
        ],
        { duration: 220, delay: 90 },
      );
      await sleep(550);

      // ---------- 4. The reveal ----------
      phase = "reveal";
      // The band drops away first, before the iris reaches them. Each mascot
      // and its drum move as one and stay solid until the last moment, so
      // neither shows through the other.
      [...mascots, ...drums].forEach((el, i) =>
        el?.animate(
          [
            { opacity: 1, transform: "none" },
            { opacity: 1, transform: "translateY(26px)", offset: 0.75 },
            { opacity: 0, transform: "translateY(40px)" },
          ],
          {
            duration: 300,
            delay: (i % 3) * 40,
            easing: "cubic-bezier(.5,0,.9,.5)",
            fill: "forwards",
          },
        ),
      );
      await sleep(160);

      const word = {
        x: layout.x0,
        y: layout.y0,
        w: COLS * layout.cell,
        h: 7 * layout.cell,
      };
      const blocks = blocksRef.current;
      if (blocks && nameplate) {
        const to = nameplate.getBoundingClientRect();
        const s = Math.min(to.width / word.w, to.height / word.h);
        const dx = to.left + to.width / 2 - (word.x + word.w / 2);
        const dy = to.top + to.height / 2 - (word.y + word.h / 2);
        blocks.style.transformOrigin = `${word.x + word.w / 2}px ${word.y + word.h / 2}px`;
        blocks.animate(
          [
            { transform: "translate(0, 0) scale(1)", opacity: 1 },
            { opacity: 1, offset: 0.6 },
            { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0 },
          ],
          { duration: 950, easing: "cubic-bezier(.65,0,.25,1)", fill: "forwards" },
        );
        nameplate.animate(
          [
            { opacity: 0, transform: "scale(.96)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 420, delay: 560, easing: "ease-out", fill: "backwards" },
        );
      } else {
        blocks?.animate({ opacity: [1, 0] }, { duration: 500, fill: "forwards" });
      }
      const iris = { duration: 1000, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" as const };
      bgRef.current?.animate(
        [{ "--iris": "-10%" } as Keyframe, { "--iris": "160%" } as Keyframe],
        iris,
      );
      bgRef.current?.animate([{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], iris);
      revealDesktop(false);
      window.setTimeout(finish, 1000);
    };

    run().catch((e) => {
      if (e !== ABORT) {
        console.error(e);
        skipRef.current();
      }
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        skipRef.current();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      controller.abort();
      if (phase !== "done") {
        if (nameplate) nameplate.style.opacity = "";
        document.body.style.overflow = previousOverflow;
      }
    };
    // The timeline runs once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mascotStyle = (who: Who): CSSProperties => ({
    left: layout.x0 + BUILDER_COL[who] * layout.cell - layout.mascot / 2,
    top: layout.baseY - layout.mascot,
    width: layout.mascot,
  });

  return (
    <div ref={rootRef} className="boot-intro" data-testid="boot-intro">
      <div ref={bgRef} className="boot-bg" aria-hidden="true" />
      <p className="boot-sr" role="status">
        Loading Daniel Barr's portfolio.
      </p>
      <div ref={logRef} className="boot-log" aria-hidden="true" />

      <div ref={blocksRef} className="absolute inset-0" aria-hidden="true">
        {WHO.map((who) => (
          <div
            key={who}
            ref={(el) => {
              groupRefs.current[who] = el;
            }}
            className="absolute inset-0"
          >
            {layout.blocks.map((b, i) =>
              b.by === who ? (
                <span
                  key={i}
                  data-i={i}
                  className="boot-block"
                  data-by={b.by}
                  style={{ left: b.x, top: b.y, width: b.size, height: b.size }}
                />
              ) : null,
            )}
          </div>
        ))}
      </div>

      {(["claude", "codex", "grok"] as Who[]).map((who) => (
        <div
          key={who}
          ref={(el) => {
            mascotRefs.current[who] = el;
          }}
          className="boot-mascot"
          data-who={who}
          style={mascotStyle(who)}
          aria-hidden="true"
        >
          {who === "claude" && <Claude />}
          {who === "codex" && <Codex />}
          {who === "grok" && <Grok />}
        </div>
      ))}

      {WHO.map((who) => {
        const w = layout.mascot * 1.12;
        const stick = Math.max(4, w * 0.075);
        return (
          <div
            key={who}
            ref={(el) => {
              drumRefs.current[who] = el;
            }}
            className="boot-drum"
            style={{
              left: layout.x0 + BUILDER_COL[who] * layout.cell - w / 2,
              top: layout.baseY - layout.mascot * 0.44,
              width: w,
              height: w * 0.78,
            }}
            aria-hidden="true"
          >
            <div className="boot-drum-body">
              <Drum shell={DRUM_SHELL[who]} />
            </div>
            <span
              ref={(el) => {
                ringRefs.current[who] = el;
              }}
              className="boot-ring"
              style={{ left: w * 0.12, top: w * 0.14, width: w * 0.76, height: w * 0.2 }}
            />
            {[false, true].map((right) => (
              <div
                key={right ? "r" : "l"}
                ref={(el) => {
                  const pair = stickRefs.current[who] ?? [null, null];
                  pair[right ? 1 : 0] = el;
                  stickRefs.current[who] = pair;
                }}
                className={right ? "boot-stick boot-stick--right" : "boot-stick"}
                style={{
                  // Gripped just outside the rim, angled down onto the head.
                  [right ? "right" : "left"]: -w * 0.06,
                  top: w * 0.02 - stick / 2,
                  width: w * 0.48,
                  height: stick,
                  transform: `rotate(${right ? -STICK.up : STICK.up}deg)`,
                }}
              >
                <Stick />
              </div>
            ))}
          </div>
        );
      })}

      <div ref={flashRef} className="boot-flash" aria-hidden="true" />

      <button
        type="button"
        className="boot-skip"
        onClick={(e) => {
          e.stopPropagation();
          skipRef.current();
        }}
        data-testid="button-skip-intro"
      >
        Skip intro <kbd>Esc</kbd>
      </button>
    </div>
  );
}
