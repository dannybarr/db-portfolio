/** Design tokens from the DBLABS research briefing, shared by every desktop
 *  window: warm paper with a pink-lavender glow, Inter Black navy titles,
 *  IBM Plex Mono body and blue labels. */
export const BRIEF = {
  paper: "#FAF9F5",
  glow: "#EDD8E9",
  navy: "#1A1F71",
  blue: "#1434CB",
  body: "#4A4E63",
  muted: "#7B7F93",
  rule: "#E0DFEE",
  border: "#E0E5F5",
  tint: "#EDF1FF",
  display: "'Inter', 'Space Grotesk', sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
} as const;

export const BRIEF_LABEL = "text-[10.5px] font-semibold uppercase leading-none tracking-[0.12em]";

/** The paper background with its glow, as used behind window content. */
export const BRIEF_PAPER = `radial-gradient(120% 90% at 100% 0%, ${BRIEF.glow} 0%, rgba(237,216,233,.55) 22%, rgba(250,249,245,0) 58%), ${BRIEF.paper}`;
