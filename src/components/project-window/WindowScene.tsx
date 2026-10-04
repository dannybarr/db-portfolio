import { Claude, Codex, Football, Grok } from "@/components/home-mascot/mascots";

/**
 * The still mascot scene in the top right of a project window, after the DBLABS
 * research briefing: Claude takes a shot, Codex keeps goal, Grok works at a desk.
 * The trio's art comes from the dock mascots; the goal, desk and pitch line are
 * drawn here in the briefing's blue line style. Purely decorative.
 */
const BLUE = "#1434CB";
const LINE = "#C9CFEE";

// Positions are percentages of a 400 × 140 stage, so the scene scales as one piece.
const place = (x: number, y: number, size: number) => ({
  left: `${(x / 400) * 100}%`,
  top: `${(y / 140) * 100}%`,
  width: `${(size / 400) * 100}%`,
});

export function WindowScene({ className = "" }: { className?: string }) {
  return (
    <div
      className={`window-scene relative aspect-[400/140] w-full select-none ${className}`}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 140" fill="none">
        {/* Pitch line */}
        <path d="M6 129H268" stroke={LINE} strokeWidth="2.4" strokeLinecap="round" />
        {/* Kick trail */}
        <path d="M98 104H108M114 101H124" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round" />
        {/* Goal: blue frame over a light net */}
        <g stroke={LINE} strokeWidth=".9">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path key={`v${i}`} d={`M${196 + i * 13} 12V128`} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <path key={`h${i}`} d={`M183 ${24 + i * 13}H279`} />
          ))}
        </g>
        <path d="M183 128V10H279V128" stroke={BLUE} strokeWidth="3.4" strokeLinejoin="round" />
        {/* Desk and laptop */}
        <path d="M292 104H394" stroke={BLUE} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M301 104V136M385 104V136" stroke={BLUE} strokeWidth="3" strokeLinecap="round" />
        <path d="M309 102 316 86H340L335 102Z" fill="#EDF1FF" stroke={BLUE} strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="326" cy="94" r="2.2" fill={BLUE} />
      </svg>

      <div className="absolute" style={place(22, 58, 70)}>
        <Claude className="block h-auto w-full -rotate-[8deg]" />
      </div>
      <div className="absolute" style={place(132, 104, 22)}>
        <Football className="block h-auto w-full" />
      </div>
      <div className="absolute" style={place(196, 54, 72)}>
        <Codex className="block h-auto w-full" />
      </div>
      <div className="absolute" style={place(338, 50, 46)}>
        <Grok className="block h-auto w-full" />
      </div>
    </div>
  );
}
