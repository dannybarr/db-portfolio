export type MascotTrack = "claude" | "codex" | "grok" | "ball" | "pitch" | "goal" | "padel" | "office" | "pub" | "ladder";

export type MascotSegment = {
  name: "football" | "penalty" | "padel" | "office" | "pub" | "dock-climb";
  label: string;
  duration: number;
  tracks: Record<MascotTrack, Keyframe[]>;
};

export type MascotGeometry = {
  width: number;
  height: number;
  floor: number;
  scale: number;
  lanes: [number, number, number];
};

const EASE = "cubic-bezier(.22,.78,.24,1)";
const BALL_UP = "cubic-bezier(.18,.72,.24,1)";
const BALL_DOWN = "cubic-bezier(.7,0,.84,.38)";
const frame = (transform: string, offset: number, easing = EASE): Keyframe => ({ transform, offset, easing });
const visible = (offset: number, opacity: number): Keyframe => ({ opacity, offset });
const actor = (x: number, y: number, r = 0, sx = 1, sy = 1) =>
  `translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${sx},${sy})`;

export function computeMascotGeometry(width: number, height = 238): MascotGeometry {
  const safeWidth = Math.max(300, width);
  const scale = Math.min(1, Math.max(.68, safeWidth / 880));
  const span = Math.min(390, safeWidth * .48);
  const center = safeWidth / 2;
  return { width: safeWidth, height, floor: height - 58, scale, lanes: [center - span / 2, center, center + span / 2] };
}

export function climbGeo(width: number, dockTop: number, floor: number) {
  const enabled = width >= 720 && floor - dockTop > 34;
  return { enabled, dockTop: Math.max(52, Math.min(floor - 34, dockTop)), ladderX: width / 2 + 108 };
}

function hiddenTrack(): Keyframe[] {
  return [visible(0, 0), visible(.88, 0), visible(1, 0)];
}

export function buildMascotTimeline(geo: MascotGeometry, dockTop = geo.floor - 62): MascotSegment[] {
  const [g, c, a] = geo.lanes;
  const y = geo.floor;
  const base = (x: number) => actor(x, y);
  const scenery = (active: boolean): Keyframe[] => active
    ? [visible(0, 0), visible(.08, 1), visible(.9, 1), visible(1, 0)]
    : hiddenTrack();
  const reset = {
    claude: [frame(base(a), 0), frame(base(a), 1)],
    codex: [frame(base(c), 0), frame(base(c), 1)],
    grok: [frame(base(g), 0), frame(base(g), 1)],
  };

  const football: MascotSegment = {
    name: "football", label: "Keepy-uppies", duration: 7600,
    tracks: {
      ...reset,
      claude: [frame(base(a), 0), frame(actor(a, y - 10, -5), .18), frame(base(a), .34), frame(actor(a - 14, y - 4, 6), .7), frame(base(a), 1)],
      codex: [frame(base(c), 0), frame(actor(c, y - 8, 3), .38), frame(base(c), .54), frame(actor(c + 10, y - 6, -5), .82), frame(base(c), 1)],
      grok: [frame(base(g), 0), frame(actor(g, y - 16, 0, .92, 1.08), .58), frame(base(g), .7), frame(base(g), 1)],
      ball: [frame(actor(g + 26, y - 22), 0), frame(actor(g + 68, y - 108, 120), .13, BALL_UP), frame(actor(c - 12, y - 30, 220), .25, BALL_DOWN), frame(actor(c + 58, y - 116, 390), .4, BALL_UP), frame(actor(a - 12, y - 28, 510), .54, BALL_DOWN), frame(actor(a - 70, y - 102, 690), .7, BALL_UP), frame(actor(g + 18, y - 24, 900), .9, BALL_DOWN), frame(actor(g + 26, y - 22, 1080), 1)],
      pitch: hiddenTrack(), goal: hiddenTrack(), padel: hiddenTrack(), office: hiddenTrack(), pub: hiddenTrack(), ladder: hiddenTrack(),
    },
  };

  const penalty: MascotSegment = {
    name: "penalty", label: "Penalty shootout", duration: 7200,
    tracks: {
      claude: [frame(base(a), 0), frame(actor(a + 85, y - 3), .18), frame(actor(a + 80, y - 3), .62), frame(actor(a + 35, y - 18, -14), .72), frame(base(a), 1)],
      codex: [frame(base(c), 0), frame(actor(c - 112, y), .18), frame(actor(c - 42, y - 4, 8), .58), frame(actor(c + 6, y - 4, -8), .67), frame(actor(c + 18, y - 13, 8), .86), frame(base(c), 1)],
      grok: [frame(base(g), 0), frame(actor(g - 55, y), .18), frame(actor(g - 55, y - 8, -4), .68), frame(actor(g - 55, y - 20, 0, 1.12, .86), .8), frame(base(g), 1)],
      ball: [frame(actor(c + 6, y - 12), 0), frame(actor(c + 6, y - 12), .58), frame(actor(a + 70, y - 116, 420), .72, BALL_UP), frame(actor(a + 108, y - 44, 720), .82, BALL_DOWN), frame(actor(a + 92, y - 18, 920), .9), frame(actor(g + 26, y - 22), 1)],
      pitch: scenery(true), goal: scenery(true), padel: hiddenTrack(), office: hiddenTrack(), pub: hiddenTrack(), ladder: hiddenTrack(),
    },
  };

  const padel: MascotSegment = {
    name: "padel", label: "Padel rally", duration: 7800,
    tracks: {
      claude: [frame(base(a), 0), frame(actor(a + 28, y - 2), .16), frame(actor(a - 2, y - 5, -12), .4), frame(actor(a + 32, y - 7, 10), .68), frame(base(a), 1)],
      codex: [frame(base(c), 0), frame(actor(c - 48, y - 2), .16), frame(actor(c - 22, y - 8, 12), .5), frame(actor(c - 62, y - 4, -10), .76), frame(base(c), 1)],
      grok: [frame(base(g), 0), frame(actor(g - 34, y - 4), .2), frame(actor(g - 34, y - 10, 0, .92, 1.08), .54), frame(base(g), 1)],
      ball: [frame(actor(c, y - 54), 0), frame(actor(a - 8, y - 102, 180), .22, BALL_UP), frame(actor(c - 30, y - 34, 360), .4, BALL_DOWN), frame(actor(c - 92, y - 92, 540), .58, BALL_UP), frame(actor(a + 12, y - 38, 760), .78, BALL_DOWN), frame(actor(g + 26, y - 22, 1080), 1)],
      pitch: hiddenTrack(), goal: hiddenTrack(), padel: scenery(true), office: hiddenTrack(), pub: hiddenTrack(), ladder: hiddenTrack(),
    },
  };

  const office: MascotSegment = {
    name: "office", label: "Studio work session", duration: 6900,
    tracks: {
      claude: [frame(base(a), 0), frame(actor(a - 22, y - 2), .14), frame(actor(a - 22, y - 2, 2), .4), frame(actor(a - 34, y - 4, -5), .7), frame(base(a), 1)],
      codex: [frame(base(c), 0), frame(actor(c, y - 2), .14), frame(actor(c, y - 3, -2), .52), frame(actor(c + 14, y - 5, 5), .72), frame(base(c), 1)],
      grok: [frame(base(g), 0), frame(actor(g + 22, y - 2), .14), frame(actor(g + 22, y - 5, 0, 1.03, .97), .55), frame(base(g), 1)],
      ball: [frame(actor(g + 26, y - 22), 0), frame(actor(g + 26, y - 22), .08), { opacity: 0, offset: .12 }, { opacity: 0, offset: .88 }, frame(actor(g + 26, y - 22), 1)],
      pitch: hiddenTrack(), goal: hiddenTrack(), padel: hiddenTrack(), office: scenery(true), pub: hiddenTrack(), ladder: hiddenTrack(),
    },
  };

  const pub: MascotSegment = {
    name: "pub", label: "After-work toast", duration: 7000,
    tracks: {
      claude: [frame(base(a), 0), frame(actor(a - 40, y - 5), .16), frame(actor(a - 54, y - 14, -8), .46), frame(actor(a - 40, y - 5), .7), frame(base(a), 1)],
      codex: [frame(base(c), 0), frame(actor(c, y - 5), .16), frame(actor(c + 10, y - 15, 7), .46), frame(actor(c, y - 5), .7), frame(base(c), 1)],
      grok: [frame(base(g), 0), frame(actor(g + 54, y - 6), .16), frame(actor(g + 67, y - 16, 0, .94, 1.06), .46), frame(actor(g + 54, y - 6), .7), frame(base(g), 1)],
      ball: [frame(actor(g + 26, y - 22), 0), { opacity: 0, offset: .1 }, { opacity: 0, offset: .82 }, frame(actor(g + 26, y - 22), 1)],
      pitch: hiddenTrack(), goal: hiddenTrack(), padel: hiddenTrack(), office: hiddenTrack(), pub: scenery(true), ladder: hiddenTrack(),
    },
  };

  const climb = climbGeo(geo.width, dockTop, y);
  const top = climb.dockTop - 38;
  const dockClimb: MascotSegment = {
    name: "dock-climb", label: "The great dock climb", duration: climb.enabled ? 9800 : 4800,
    tracks: {
      claude: [frame(base(a), 0), frame(actor(a - 92, y - 44, -8), .14), frame(actor(a - 92, y - 4, 8), .24), frame(actor(geo.width + 70, y, 0), .39), frame(actor(geo.width + 70, y), .52), frame(actor(climb.ladderX + 28, y), .64), frame(actor(climb.ladderX + 4, top, -4), .83), frame(actor(a, top, 0), .9), frame(base(a), 1)],
      codex: [frame(base(c), 0), frame(actor(c, y - 48, 8), .14), frame(actor(c, y - 3, -6), .24), frame(actor(-70, y), .39), frame(actor(-70, y), .52), frame(actor(climb.ladderX - 28, y), .64), frame(actor(climb.ladderX - 4, top + 4, 4), .83), frame(actor(c, top, 0), .9), frame(base(c), 1)],
      grok: [frame(base(g), 0), frame(actor(g + 92, y - 40, 180, .9, 1.1), .14), frame(actor(g + 92, y - 2, 360, 1.1, .9), .24), frame(actor(-90, y, -720), .39), frame(actor(-90, y), .52), frame(actor(climb.ladderX - 76, y, 720), .64), frame(actor(climb.ladderX - 56, top + 8, 900), .83), frame(actor(g, top, 1080), .9), frame(base(g), 1)],
      ball: [frame(actor(g + 26, y - 22), 0), { opacity: 0, offset: .06 }, { opacity: 0, offset: .94 }, frame(actor(g + 26, y - 22), 1)],
      pitch: hiddenTrack(), goal: hiddenTrack(), padel: hiddenTrack(), office: hiddenTrack(), pub: hiddenTrack(),
      ladder: climb.enabled ? [visible(0, 0), visible(.48, 0), visible(.57, 1), visible(.9, 1), visible(1, 0)] : hiddenTrack(),
    },
  };

  return [football, penalty, padel, office, pub, dockClimb];
}
