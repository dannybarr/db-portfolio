import type { ReactNode } from "react";

export function Football({ id }: { id: string }) {
  return <svg viewBox="0 0 50 50" aria-hidden="true"><defs><radialGradient id={`${id}-shine`} cx="32%" cy="24%"><stop offset="0" stopColor="#fff"/><stop offset="1" stopColor="#dce3e8"/></radialGradient></defs><circle cx="25" cy="25" r="22" fill={`url(#${id}-shine)`} stroke="#17202b" strokeWidth="2"/><path d="m25 14 7 5-3 8h-8l-3-8Z" fill="#17202b"/><g fill="#17202b"><path d="m25 3 6 3-6 6-6-6Z"/><path d="m45 17 1 7-9-2-1-7Z"/><path d="m39 39-6 5-3-9 6-4Z"/><path d="m11 39-5-5 8-5 6 5Z"/><path d="M4 17 9 9l6 7-4 7Z"/></g><g stroke="#17202b" strokeWidth="1.3" fill="none"><path d="m25 14V11M32 19l5 3M29 27l4 8M21 27l-7 3M18 19l-7 4"/></g></svg>;
}

export function ClaudeMascot() {
  return <svg viewBox="0 0 92 112" aria-hidden="true"><g className="mascot-body"><path d="M18 25Q18 12 31 12h30q13 0 13 13v49q0 11-11 11H29Q18 85 18 74Z" fill="#fff" stroke="#fff" strokeWidth="9"/><path d="M18 25Q18 12 31 12h30q13 0 13 13v49q0 11-11 11H29Q18 85 18 74Z" fill="#d97757"/><g className="mascot-arm mascot-arm--left"><rect x="5" y="39" width="17" height="33" rx="7" fill="#d97757" stroke="#fff" strokeWidth="5"/></g><g className="mascot-arm mascot-arm--right"><rect x="70" y="39" width="17" height="33" rx="7" fill="#d97757" stroke="#fff" strokeWidth="5"/></g><g className="mascot-eyes"><path d="m30 34 9 6-9 6m32-12-9 6 9 6" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></g><g fill="#d97757" stroke="#fff" strokeWidth="4"><rect x="20" y="79" width="14" height="22" rx="4"/><rect x="37" y="79" width="14" height="22" rx="4"/><rect x="54" y="79" width="14" height="22" rx="4"/></g></g></svg>;
}

export function CodexMascot() {
  const bubbles = [[25,27,13],[39,18,15],[55,19,15],[68,28,13],[33,36,17],[51,35,19],[65,40,14]];
  return <svg viewBox="0 0 94 112" aria-hidden="true"><defs><radialGradient id="codex-blue" cx="35%" cy="22%"><stop offset="0" stopColor="#63d8ff"/><stop offset="1" stopColor="#2464dd"/></radialGradient><linearGradient id="codex-screen" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#123b91"/><stop offset="1" stopColor="#071c56"/></linearGradient></defs><g className="mascot-body">{bubbles.map(([cx,cy,r], i)=><circle key={i} cx={cx} cy={cy} r={r} fill="url(#codex-blue)" stroke="#fff" strokeWidth="3"/>)}<rect x="23" y="25" width="49" height="29" rx="11" fill="url(#codex-screen)"/><path d="m36 34 7 5-7 5m13 1h10" fill="none" stroke="#baf2ff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="27" y="56" width="40" height="33" rx="12" fill="url(#codex-blue)" stroke="#fff" strokeWidth="4"/><g className="mascot-arm mascot-arm--left"><rect x="13" y="60" width="14" height="30" rx="7" transform="rotate(14 20 75)" fill="#367ee9" stroke="#fff" strokeWidth="4"/></g><g className="mascot-arm mascot-arm--right"><rect x="67" y="60" width="14" height="30" rx="7" transform="rotate(-14 74 75)" fill="#367ee9" stroke="#fff" strokeWidth="4"/></g><rect x="30" y="85" width="13" height="19" rx="6" fill="#2e71e4" stroke="#fff" strokeWidth="4"/><rect x="51" y="85" width="13" height="19" rx="6" fill="#2e71e4" stroke="#fff" strokeWidth="4"/></g></svg>;
}

export function GrokMascot() {
  return <svg viewBox="0 0 90 102" aria-hidden="true"><g className="grok-roll"><path d="M45 8C67 7 82 23 81 48c-1 27-14 44-38 45C20 94 8 78 9 52 10 27 23 9 45 8Z" fill="#11131a" stroke="#fff" strokeWidth="5"/><g className="mascot-eyes" fill="#fff"><rect x="26" y="35" width="13" height="25" rx="7" transform="rotate(-24 32 48)"/><rect x="51" y="31" width="13" height="25" rx="7" transform="rotate(-24 57 44)"/></g></g></svg>;
}

export function PitchBackdrop() {
  return <svg viewBox="0 0 1000 190" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="pitch" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#5bad57"/><stop offset="1" stopColor="#287d43"/></linearGradient><pattern id="mow" width="120" height="190" patternUnits="userSpaceOnUse"><rect width="60" height="190" fill="#fff" opacity=".055"/></pattern></defs><path d="M130 20H870L980 184H20Z" fill="url(#pitch)"/><path d="M130 20H870L980 184H20Z" fill="url(#mow)"/><g fill="none" stroke="#fff" opacity=".72" strokeWidth="4"><path d="M130 20H870L980 184H20Z"/><ellipse cx="500" cy="88" rx="114" ry="54"/><path d="M500 20v164M690 184l-25-71h257M310 184l25-71H78"/></g></svg>;
}

export function Goal() {
  return <svg viewBox="0 0 260 154" aria-hidden="true"><g stroke="#dfe9ef" fill="none" strokeLinecap="round"><path d="M18 140V20h205v120" strokeWidth="11"/><path d="M21 31h202M21 55h202M21 80h202M21 105h202M55 22v118M90 22v118M126 22v118M162 22v118M198 22v118" strokeWidth="2" opacity=".72"/></g></svg>;
}

export function PadelCourt() {
  return <svg viewBox="0 0 760 190" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="court" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#3c98a0"/><stop offset="1" stopColor="#176d78"/></linearGradient></defs><path d="M90 25h580l80 158H10Z" fill="url(#court)" stroke="#dffaff" strokeWidth="4"/><g stroke="#dffaff" fill="none" opacity=".9"><path d="M380 25v158M50 105h660M90 25 10 183m660-158 80 158" strokeWidth="3"/><path d="M84 22h592v128H84Z" strokeWidth="5"/><path d="M84 64h592M125 22v128m85-128v128m85-128v128m170-128v128m85-128v128m85-128v128" opacity=".35"/></g><path d="M55 104h650" stroke="#172c47" strokeWidth="7"/><path d="M55 104h650" stroke="#fff" strokeWidth="2"/></svg>;
}

export function OfficeScene() {
  return <svg viewBox="0 0 760 175" aria-hidden="true"><g fill="#f4f6f8" stroke="#172c47" strokeWidth="4"><path d="M80 102h600v18H80Z"/><path d="M110 120h12v50h-12zm528 0h12v50h-12z"/><rect x="135" y="35" width="135" height="75" rx="7"/><rect x="313" y="35" width="135" height="75" rx="7"/><rect x="491" y="35" width="135" height="75" rx="7"/></g><g fill="#78d7e6"><rect x="145" y="45" width="115" height="54" rx="3"/><rect x="323" y="45" width="115" height="54" rx="3"/><rect x="501" y="45" width="115" height="54" rx="3"/></g><g stroke="#172c47" strokeWidth="5"><path d="M170 62h64m-64 13h43M348 62h64m-64 13h50M526 62h64m-64 13h38"/></g><g fill="#f7b600" stroke="#172c47" strokeWidth="3"><path d="M276 91h20v22h-20Z"/><path d="M454 91h20v22h-20Z"/></g></svg>;
}

export function PubScene() {
  return <svg viewBox="0 0 760 180" aria-hidden="true"><path d="M70 48h620v120H70Z" fill="#724936" stroke="#241c24" strokeWidth="5"/><path d="M70 48h620v32H70Z" fill="#244e3f"/><text x="380" y="72" textAnchor="middle" fill="#f5cf75" fontFamily="serif" fontWeight="700" fontSize="24">THE BUILDERS ARMS</text><path d="M130 126h500v18H130Z" fill="#d6a35c" stroke="#241c24" strokeWidth="4"/><g fill="#f0c24f" stroke="#fff" strokeWidth="2"><path d="M245 91h22l-3 34h-16Z"/><path d="M369 91h22l-3 34h-16Z"/><path d="M493 91h22l-3 34h-16Z"/></g></svg>;
}

export function Ladder() {
  return <svg viewBox="0 0 90 180" aria-hidden="true"><g fill="none" stroke="#c58b42" strokeWidth="8" strokeLinecap="round"><path d="M16 172 30 8M74 172 60 8"/><path d="M24 136h44M21 104h48M19 72h52M27 40h36"/></g></svg>;
}

export function Placard({ children }: { children?: ReactNode }) {
  return <div className="mascot-placard">{children ?? <span>★</span>}</div>;
}
