import * as React from "react";

export type MascotArtProps = { id?: string; className?: string };
export type SceneArtProps = { className?: string };

// React's generated ID keeps gradient references safe when several trios coexist.
function useArtId(prefix: string, id?: string) {
  const generated = React.useId();
  return `${prefix}-${id ?? generated}`.replace(/[^a-zA-Z0-9_-]/g, "");
}

function JuggleProps({ id }: { id: string }) {
  return (
    <g className="mascot-juggle-props">
      <g className="mascot-juggle-prop mascot-juggle-ball">
        <svg x="44" y="11" width="12" height="12" viewBox="0 0 100 100"><Football id={`${id}-juggle`} /></svg>
      </g>
      <g className="mascot-juggle-prop mascot-juggle-square"><rect x="45" y="12" width="10" height="10" rx="1.2" fill="#7696EF" stroke="#425EA9" strokeWidth=".8" /></g>
      <g className="mascot-juggle-prop mascot-juggle-triangle"><path d="M50 10 56.5 22H43.5Z" fill="#D97757" stroke="#B45E44" strokeWidth=".8" strokeLinejoin="round" /></g>
    </g>
  );
}

function PadelRacket() {
  return <g className="mascot-racket" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <g className="mascot-racket-swing">
    <path d="M80 67 86 52" stroke="#263D59" strokeWidth="3.8" />
    <path d="M79.3 67.9 81.7 62.4" stroke="#D97757" strokeWidth="4.2" />
    <ellipse cx="87" cy="44" rx="7.2" ry="10.2" transform="rotate(18 87 44)" fill="#E7F1F8" stroke="#34567B" strokeWidth="2" />
    <g fill="#779AB5" stroke="none">{[[85,38],[89,39],[83.5,42],[87.5,43],[91,44],[82.5,46],[86.5,47],[90,48],[85,51]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r=".85" />)}</g>
    </g>
  </g>;
}

/** Reference proportions: ink x5..95, y22.8..95; shared foot anchor y95. */
export function Claude({ id, className = "" }: MascotArtProps) {
  const artId = useArtId("claude", id);
  return (
    <svg id={id} className={`mascot-art mascot-claude ${className}`} viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
      <g className="mascot-breathe">
        {/* Outline underneath fill preserves the solid 7.7-unit orange feet. */}
        <g fill="#D97757" stroke="#FFF" strokeWidth="6" strokeLinejoin="round" paintOrder="stroke fill">
          <path className="mascot-arm-left" d="M16 42.5H8V59.3H17Z" />
          <path className="mascot-arm-right" d="M83 42.5H92V59.3H83Z" />
          <path className="mascot-leg-left" d="M15.5 72H38.5V92H30.8V75.3H23.2V92H15.5Z" />
          <path className="mascot-leg-right" d="M61.5 72H84.5V92H76.8V75.3H69.2V92H61.5Z" />
          <path d="M15.5 42.5V26H84.5V42.5M15.5 59.3V75.3M84.5 59.3V75.3" />
          <path d="M38.5 75.3H61.5" />
        </g>
        <path fill="#D97757" d="M15.5 26H84.5V75.3H15.5Z" />
        <g className="mascot-look">
        <g className="mascot-eyes" fill="#000">
          <g className="mascot-attention">
          <path d="M23.2 42.5H30.9V50.9H23.2Z" />
          <path d="M69.1 42.5H76.8V50.9H69.1Z" />
          </g>
        </g>
        </g>
      </g>
      <PadelRacket />
      <JuggleProps id={artId} />
    </svg>
  );
}

/** Reference proportions: ink x12.5..87.5, y5..95; shared foot anchor y95. */
export function Codex({ id, className = "" }: MascotArtProps) {
  const artId = useArtId("codex", id);
  return (
    <svg id={id} className={`mascot-art mascot-codex ${className}`} viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${artId}-shell`} cx=".42" cy=".13" r=".9">
          <stop stopColor="#97B4FF" /><stop offset=".43" stopColor="#7B9DF4" /><stop offset=".77" stopColor="#6688EB" /><stop offset="1" stopColor="#4864C6" />
        </radialGradient>
        <linearGradient id={`${artId}-body`} x1="0" y1="0" x2=".8" y2="1">
          <stop stopColor="#86A7FC" /><stop offset=".55" stopColor="#6889EB" /><stop offset="1" stopColor="#4A61C0" />
        </linearGradient>
        <radialGradient id={`${artId}-screen`} cx=".45" cy=".35" r=".85">
          <stop stopColor="#2B365F" /><stop offset=".8" stopColor="#253059" /><stop offset="1" stopColor="#1D254C" />
        </radialGradient>
      </defs>
      <g className="mascot-breathe">
        <g fill={`url(#${artId}-body)`} stroke="#354AA0" strokeWidth=".65" strokeLinejoin="round">
          <path className="mascot-leg-left" d="M37.4 81.5H48V91.8Q48 94.65 45.4 94.65H39Q37.4 94.65 37.4 92.6Z" />
          <path className="mascot-leg-right" d="M55 81.5H65V91.8Q65 94.65 62.3 94.65H57.4Q55 94.65 55 92.4Z" />
          <path className="mascot-arm-left" d="M36.9 67.6C32.1 67.2 27.1 75.8 24.4 80.8 22.6 84.1 23.1 87.4 25.7 86.8L29.8 87C32.2 84.5 33.1 77.4 37.2 74.7Z" />
          <path className="mascot-arm-right" d="M67.8 67.7C73.1 69.2 77.7 76.2 79.2 81.4 80.3 85.2 78.6 87.1 75.2 87 71.6 87.1 70.8 81.2 69.3 77.8Z" />
          <path d="M37.4 66.4H67.4L68.9 77.5Q69.8 86.7 57.6 87.4H43.9Q34.2 85.9 34.8 78Z" />
        </g>
        <path d="M38 67.4H67" stroke="#A5BEFF" strokeOpacity=".65" strokeWidth="1.2" />
        <g fill="none" stroke="#E0FFFF" strokeWidth="2.1" strokeLinecap="square" strokeLinejoin="round">
          <path d="M48.2 73.7 52.4 76.8 48.2 80" />
          <path className="mascot-cursor" d="M57.4 77H62.2" />
        </g>
        <path d="M16.9 44.6C12.9 45.8 12.5 40.4 12.5 35.2 12.5 26.6 19.8 19.4 28 19.6 27.5 12.3 33.8 7.5 40.6 5.7 45.9 4.1 50.9 5.2 54.5 9.3 58.7 5.8 65.6 7.3 69.6 10.2 74.6 13.7 76.5 17.5 77.1 21.2 84.6 24.9 88.3 30 87 37.7V47.8C87 59.4 81.3 65.3 69.3 65.8H36C25.6 65.8 17.9 62.2 17.1 55.1 16.6 51.7 16.7 48.8 19.2 45.4Z" fill={`url(#${artId}-shell)`} />
        <path d="M32.7 8.9C38.8 5 47.6 4 52.8 8.8" stroke="#BDD0FF" strokeOpacity=".42" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M19.3 45.4C22.7 44.2 28.4 44.1 31.3 44.4" stroke="#5274D3" strokeOpacity=".28" strokeWidth=".8" />
        <path d="M40.2 28H69Q77.5 28.2 78 36.2V49.6Q78 59 67.9 59.1H40.6Q31.4 59.1 31.4 50.1V37.4Q31.4 28.3 40.2 28Z" fill={`url(#${artId}-screen)`} stroke="#31457C" strokeWidth=".9" />
        <path d="M40.5 28.8H67.7" stroke="#162345" strokeOpacity=".65" strokeWidth=".7" />
        <g className="mascot-look">
        <g className="mascot-eyes" stroke="#BDFBFA" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <g className="mascot-attention">
          <path d="M39.7 43.2Q43.6 49.3 48.3 43.4" />
          <path d="M59.7 43.4Q64.7 49.3 68.7 43.2" />
          </g>
        </g>
        </g>
      </g>
      <PadelRacket />
      <JuggleProps id={artId} />
    </svg>
  );
}

/** White source orb, with the requested black contour for the white stage. */
export function Grok({ id, className = "" }: MascotArtProps) {
  const artId = useArtId("grok", id);
  return (
    <svg id={id} className={`mascot-art mascot-grok ${className}`} viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
      <g className="mascot-breathe">
        <path d="M50.2 5.5C74.8 5.1 93.8 24.5 94.5 49.1 95.4 74.3 76.1 94.4 50.1 94.5 25 94.6 5.6 76.3 5.5 51.4 5.3 26.2 25.9 6.2 50.2 5.5Z" transform="translate(.8 .8) scale(.984)" fill="#FFF" stroke="var(--mascot-orb-edge, #000)" strokeWidth="2.2" />
        <g className="mascot-look">
        <g className="mascot-eyes" fill="#0B0B0A">
          <g className="mascot-attention">
          <rect x="54.1" y="20.3" width="10.3" height="20.6" rx="5.15" transform="rotate(-30 59.25 30.6)" />
          <rect x="72.2" y="15.4" width="6.9" height="20.7" rx="3.45" transform="rotate(-30 75.65 25.75)" />
          </g>
        </g>
        </g>
        {/* The orb has no invented limbs; hooks stay available to choreography. */}
        <g className="mascot-arm-left" /><g className="mascot-arm-right" />
        <g className="mascot-leg-left" /><g className="mascot-leg-right" />
      </g>
      <PadelRacket />
      <JuggleProps id={artId} />
    </svg>
  );
}

export function Football({ id, className = "" }: MascotArtProps) {
  const artId = useArtId("football", id);
  return (
    <svg id={id} className={`mascot-football-art ${className}`} viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`${artId}-clip`}><circle cx="50" cy="50" r="46" /></clipPath>
        <radialGradient id={`${artId}-shine`} cx=".3" cy=".23" r=".8"><stop stopColor="#FFF" stopOpacity=".35" /><stop offset=".5" stopColor="#FFF" stopOpacity="0" /><stop offset="1" stopColor="#192541" stopOpacity=".18" /></radialGradient>
      </defs>
      <circle className="mascot-ball-surface" cx="50" cy="50" r="46" fill="#FFF" />
      <g className="mascot-football-pattern" clipPath={`url(#${artId}-clip)`} stroke="#24282F" strokeWidth="1.3" strokeLinejoin="round">
        <path d="M50 33 66 44 60 63H40L34 44Z" fill="#252A33" />
        {[0, 72, 144, 216, 288].map(angle => <g key={angle} transform={`rotate(${angle} 50 50)`}><path d="M50 33V19M38 6 37 14 50 20 63 14 62 6" /><path d="M37 0H63L66 9 62 15H38L34 9Z" fill="#252A33" /></g>)}
      </g>
      <path className="mascot-tennis-seam" d="M18 18C68 28 32 72 82 82M82 18C32 28 68 72 18 82" stroke="#FFFFE4" strokeWidth="3.5" fill="none" />
      <circle cx="50" cy="50" r="46" fill={`url(#${artId}-shine)`} stroke="#41464E" strokeWidth="1.7" />
    </svg>
  );
}

// Flat 1000 × 100 field mapped through the brief's horizontal perspective.
const px = (x: number, y: number) => 30 * (1 - y / 100) + x * (.94 + .06 * y / 100);
const pp = (x: number, y: number) => `${px(x, y)},${y}`;
const fieldRect = (x: number, y: number, w: number, h: number) => `${pp(x, y)} ${pp(x + w, y)} ${pp(x + w, y + h)} ${pp(x, y + h)}`;

export function Pitch({ className = "" }: SceneArtProps) {
  return (
    <svg className={`mascot-pitch-art ${className}`} viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <polygon points={fieldRect(0, 0, 1000, 100)} fill="var(--mascot-turf, #E4EEE5)" />
      {[0, 2, 4, 6, 8].map(i => <polygon key={i} points={fieldRect(i * 100, 0, 100, 100)} fill="var(--mascot-turf-stripe, #D8E7DB)" />)}
      <g fill="none" stroke="#FFF" strokeWidth="1.2" strokeOpacity=".95">
        <polygon points={fieldRect(12, 7, 976, 85)} /><path d={`M${pp(500, 7)}L${pp(500, 92)}`} />
        <ellipse cx="500" cy="49.5" rx="83" ry="28" />
        <polyline points={`${pp(988, 19)} ${pp(830, 19)} ${pp(830, 80)} ${pp(988, 80)}`} />
        <polyline points={`${pp(988, 32)} ${pp(930, 32)} ${pp(930, 67)} ${pp(988, 67)}`} />
        <path d={`M${pp(830, 35)}Q${pp(766, 49.5)} ${pp(830, 64)}`} />
      </g>
      <g fill="#FFF"><ellipse cx="500" cy="49.5" rx="2.5" ry="1.6" /><ellipse cx={px(885, 49.5)} cy="49.5" rx="2.5" ry="1.6" /></g>
    </svg>
  );
}

export function Goal({ className = "" }: SceneArtProps) {
  return (
    <svg className={`mascot-goal-art ${className}`} viewBox="0 0 150 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <g className="mascot-net" fill="none" stroke="var(--mascot-net, #B9C8C0)" strokeWidth=".7">
        <path d="M12 94V10H126L141 29V94Z" fill="#FFF" fillOpacity=".28" />
        {Array.from({ length: 12 }, (_, i) => <path key={`v${i}`} d={`M${13 + i * 10.2} 11V94`} />)}
        {Array.from({ length: 8 }, (_, i) => <path key={`h${i}`} d={`M12 ${12 + i * 11.5}H126L141 ${29 + i * 9.2}`} />)}
        <path d="M126 10V94M133 19V94M141 29V94" />
      </g>
      <path d="M12 94V10H126V94" fill="none" stroke="#85978D" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 92V10H126V92" fill="none" stroke="#FFF" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PadelCourt({ className = "" }: SceneArtProps) {
  return (
    <svg className={`mascot-padel-art ${className}`} viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M75 38H925L987 94H13Z" fill="var(--mascot-court, #E3EDF6)" />
      <g fill="none" stroke="#A4BCCA" strokeWidth="1" strokeOpacity=".65"><path d="M75 38V5H925V38M13 94V49L75 5M987 94V49L925 5" />{[75, 245, 415, 585, 755, 925].map(x => <path key={x} d={`M${x} 5V38`} />)}</g>
      <g fill="none" stroke="#FFF" strokeWidth="1.6"><path d="M80 42H920L974 90H26ZM293 42 267 90M707 42 733 90M280 66H720" /></g>
      <g className="mascot-padel-net" fill="none" stroke="#7A95A7" strokeWidth=".7"><path d="M500 40V91M475 20V83M475 24 500 49M475 30 500 55M475 36 500 61M475 42 500 67M475 48 500 73M475 54 500 79M475 60 500 85M481 30V67M487 36V73M493 42V79" /><path d="M475 20 500 45" stroke="#526D7B" strokeWidth="2" /></g>
    </svg>
  );
}

export function Cafe({ className = "" }: SceneArtProps) {
  return (
    <div className={`mascot-cafe-art ${className}`} aria-hidden="true">
      {/* HTML positioning avoids nested SVG viewport and geometry-property scaling. */}
        {[-1, 0, 1].map((lane) => (
          <svg key={lane} className={`mascot-desk-art mascot-workstation-${lane + 1}`} viewBox="0 0 84 30" preserveAspectRatio="none" fill="none" focusable="false">
            <path d="M12 22V29M72 22V29" stroke="#A28C70" strokeWidth="1.8" />
            <path d="M8 17H76L81 23H3Z" fill="#E7D9C5" stroke="#C0A98A" strokeWidth=".65" />
            <path d="M3 23H81V25H3Z" fill="#CDB798" />
            <path d="M18 6H57L60 16H22Z" fill="#DCE4ED" stroke="#7E91A9" strokeWidth=".9" strokeLinejoin="round" />
            <path d="M22 16H60L64 21H17Z" fill="#EEF1F5" stroke="#A0ADBE" strokeWidth=".7" />
            <path d="M25 17.5H57M27 19H58" stroke="#AFBBCB" strokeWidth=".65" />
            <path d="M34 20H44" stroke="#8E9EB3" strokeWidth=".6" />
            <path d="M34 10 38 9 42 11 38 12Z" fill="#FFF" />
            <ellipse cx="70" cy="20" rx="6.5" ry="1.8" fill="#F6F1EA" stroke="#C7B59A" strokeWidth=".6" />
            <path d="M66 12H73V18Q73 20 69.5 20 66 20 66 18Z" fill="#FFF" stroke="#AD9676" strokeWidth=".7" />
            <ellipse cx="69.5" cy="12" rx="3.5" ry="1.1" fill="#98704E" />
            <path d="M73 13H75Q78 17 73 17" stroke="#AD9676" strokeWidth=".8" />
            <path className="mascot-steam" d="M68 9Q65 6 68 3M71 9Q68 6 71 3" stroke="#B0B4B8" strokeWidth=".7" strokeLinecap="round" />
          </svg>
        ))}
    </div>
  );
}

export function Ladder({ className = "" }: SceneArtProps) {
  return (
    <svg className={`mascot-ladder-art ${className}`} viewBox="0 0 32 100" aria-hidden="true" focusable="false">
      <g fill="none" stroke="var(--mascot-ladder, #C1A27A)" strokeWidth="3.5" strokeLinecap="round"><path d="M7 96V5M25 96V5" />{[14, 29, 44, 59, 74, 89].map(y => <path key={y} d={`M7 ${y}H25`} />)}</g>
      <g stroke="#EAD9BE" strokeWidth=".8"><path d="M6 94V6M24 94V6" /></g>
    </svg>
  );
}

export function ClimbObject({ className = "" }: SceneArtProps) {
  return (
    <svg className={`mascot-object-art ${className}`} viewBox="0 0 60 80" aria-hidden="true" focusable="false">
      <path d="M4 16 14 8H55V69L46 77H4Z" fill="#E7EAEF" stroke="#BCC3CE" strokeWidth="1" strokeLinejoin="round" />
      <path d="M46 16 55 8V69L46 77Z" fill="#D7DDE7" /><path d="M4 16 14 8H55L46 16Z" fill="#F5F6F8" />
      <path d="M4 16H46V77" fill="none" stroke="#BCC3CE" strokeWidth="1" />
      <path d="M19 37 23 29 27 37 35 38 29 44 30 52 23 48 16 52 17 44 11 38Z" fill="#FFF" stroke="#C5CBD4" strokeWidth=".8" strokeLinejoin="round" />
    </svg>
  );
}
