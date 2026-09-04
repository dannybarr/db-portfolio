import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { CSSProperties, RefObject } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useListProjects, useUpdateProjectPosition } from '@/lib/projects';
import type { Project as ApiProject } from '@/lib/projects';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFolderDrag } from '@/hooks/use-folder-drag';
import type { FolderOffset } from '@/hooks/use-folder-drag';
const BACKDROP_VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4';
import backdropPoster from '@/assets/desktop-backdrop-poster.jpg.asset.json';


const BASE = '/';

/**
 * The desktop scene is sized off a single fluid unit so the approved composition
 * scales continuously from small laptops to ultrawide displays. Every measurement
 * is clamped against both viewport axes (`min(vw, vh)`) so short/landscape windows
 * shrink the scene instead of pushing it off-screen.
 */
const sceneVars = {
  '--tile': 'clamp(40px, min(6.9vw, 12vh), 124px)',
  '--dock-icon': 'clamp(34px, min(3.4vw, 5.6vh), 56px)',
} as CSSProperties;
const DEEP_BLUE_HUE = 9;

/** Loading placeholders shown while the project list is in flight — matched to
 *  the number of live projects so the scene never implies missing tiles. */
const SKELETON_TILES = 6;
const CYCLED_HUES = 8;
type Scatter = {
  x: string;
  y: string;
  tone: string;
  onDark?: boolean;
  /** Override the cycled folder hue (index into folderHues) — used when a tile's
   *  artwork needs a specific backdrop to stay legible. */
  hue?: number;
};

// Exact scatter positions/sizes preserved from the approved mockup (15 slots).
// onDark flags the 6 tiles that sit over the dark tyres (mapped by slot position).
const scatter: Scatter[] = [
  { x: '8%', y: '20%', tone: '#1434cb' },
  { x: '18%', y: '37%', tone: '#f7b600', hue: DEEP_BLUE_HUE },
  { x: '30%', y: '13%', tone: '#1b4ce2', hue: 4 },
  { x: '40%', y: '25%', tone: '#08236b' },
  { x: '52%', y: '11%', tone: '#e9a900', hue: DEEP_BLUE_HUE },
  { x: '62%', y: '41%', tone: '#1434cb', onDark: true },
  { x: '73%', y: '49%', tone: '#0b327e', onDark: true, hue: DEEP_BLUE_HUE },
  { x: '86%', y: '36%', tone: '#f7b600' },
  { x: '6%', y: '56%', tone: '#0d2d74' },
  { x: '20%', y: '65%', tone: '#e6a800', onDark: true },
  { x: '30%', y: '73%', tone: '#1434cb', onDark: true },
  { x: '69%', y: '68%', tone: '#0b2868', onDark: true },
  { x: '80%', y: '55%', tone: '#f7b600', onDark: true },
  { x: '90%', y: '66%', tone: '#1647cf', onDark: true },
  { x: '56%', y: '78%', tone: '#09265f', onDark: true },
  { x: '56%', y: '32%', tone: '#1b4ce2' },
  { x: '44%', y: '55%', tone: '#0d2d74', onDark: true },
  { x: '26%', y: '48%', tone: '#f7b600', onDark: true },
  { x: '12%', y: '84%', tone: '#1434cb' },
  { x: '86%', y: '85%', tone: '#e9a900', onDark: true },
];

type Hue = { front: [string, string]; back: [string, string] };

// macOS Finder-style folder hues — cycled across the desktop so the tiles read
// as a varied Mac folder set rather than one flat blue.
const folderHues: Hue[] = [
  { front: ['#8AC6F4', '#419BE4'], back: ['#5CA6E5', '#4393D9'] }, // blue
  { front: ['#A5DE7C', '#5FB63C'], back: ['#7FC95B', '#59AD37'] }, // green
  { front: ['#FFDD73', '#F5B62B'], back: ['#FFCF57', '#EBAE28'] }, // yellow
  { front: ['#C9A8F0', '#8C5FD6'], back: ['#B893E8', '#8257C7'] }, // purple
  { front: ['#FFB877', '#F58A2E'], back: ['#FFA95F', '#EB812B'] }, // orange
  { front: ['#7FDDE0', '#35B7BE'], back: ['#4FC4C9', '#33ADB3'] }, // teal
  { front: ['#FF9A92', '#EE5A50'], back: ['#FF8880', '#E1544B'] }, // red
  { front: ['#FFA3C7', '#F2609A'], back: ['#FF92BC', '#E45A91'] }, // pink
  { front: ['#C9CED6', '#9BA3AE'], back: ['#B9BFC8', '#949CA7'] }, // graphite
  { front: ['#2F5FE3', '#0E2C9E'], back: ['#254FCB', '#0B2385'] }, // deep brand blue (opt-in only)
];


function FolderThumb({ tone, mark, index, hue: hueIndex, active, artwork, preview }: { tone: string; mark: string; index: number; hue?: number | undefined; active: boolean; artwork?: string | null | undefined; preview?: string | null | undefined }) {
  const hue = folderHues[hueIndex ?? index % CYCLED_HUES]!;
  return (
    <svg viewBox="0 0 100 80" className="h-full w-full overflow-visible drop-shadow-[0_4px_6px_rgba(0,0,0,.15)]">
      <defs>
        <linearGradient id={`frontGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hue.front[0]} />
          <stop offset="100%" stopColor={hue.front[1]} />
        </linearGradient>
        <linearGradient id={`backGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hue.back[0]} />
          <stop offset="100%" stopColor={hue.back[1]} />
        </linearGradient>
        <clipPath id={`cardClip-${index}`}>
          <rect width="64" height="42" rx="4" />
        </clipPath>
      </defs>

      {/* Back tab layer */}
      <path d="M 6 22 L 6 10 C 6 6 8.5 4 12 4 L 33 4 C 36 4 38 5 39 8 L 44 15 C 45 16 47 17 49 17 L 90 17 C 94 17 96 19 96 23 L 96 74 C 96 78 94 80 90 80 L 10 80 C 6 80 4 78 4 74 Z" fill={`url(#backGradient-${index})`}/>

      {/* Preview Card */}
      <g transform="translate(18, 8)">
        <g className={`transition-transform duration-300 ${preview ? 'group-hover:-translate-y-[20px]' : 'group-hover:-translate-y-[10px]'}`}>
          <rect width="64" height="42" rx="4" fill="white" />
          <g clipPath={`url(#cardClip-${index})`}>
             {preview && (
               <image href={`${BASE}images/${preview}`} width="64" height="42" preserveAspectRatio="xMidYMid meet" />
             )}
             {!preview && index % 3 === 0 && (
               <g transform="translate(6, 6)">
                 <rect width="52" height="18" rx="2" fill="#f0f2f5" />
                 <rect x="4" y="4" width="20" height="4" rx="1" fill={tone} />
                 <rect x="4" y="10" width="12" height="4" rx="1" fill="#f7b600" />
                 <rect x="0" y="22" width="15" height="14" rx="2" fill={tone} />
                 <rect x="18" y="22" width="15" height="14" rx="2" fill="#f0f2f5" />
                 <rect x="36" y="22" width="15" height="14" rx="2" fill="#f0f2f5" />
                 <rect x="21" y="30" width="9" height="3" rx="1" fill="#cdd2d9" />
                 <rect x="39" y="26" width="9" height="3" rx="1" fill="#cdd2d9" />
               </g>
             )}
             {!preview && index % 3 === 1 && (
               <g transform="translate(6, 6)">
                 <circle cx="10" cy="15" r="10" fill="none" stroke={tone} strokeWidth="3" strokeDasharray="40 20" />
                 <circle cx="10" cy="15" r="10" fill="none" stroke="#f7b600" strokeWidth="3" strokeDasharray="15 45" strokeDashoffset="-40" />
                 <rect x="26" y="4" width="26" height="4" rx="2" fill={tone} />
                 <rect x="26" y="12" width="16" height="4" rx="2" fill="#eef0f3" />
                 <rect x="26" y="20" width="20" height="4" rx="2" fill="#eef0f3" />
                 <rect x="26" y="28" width="12" height="4" rx="2" fill="#f7b600" />
               </g>
             )}
             {!preview && index % 3 === 2 && (
               <g transform="translate(6, 6)">
                 <path d="M 0 20 L 10 10 L 20 15 L 35 2 L 52 12 L 52 30 L 0 30 Z" fill="#eef2f9" />
                 <path d="M 0 20 L 10 10 L 20 15 L 35 2 L 52 12" fill="none" stroke={tone} strokeWidth="2" />
                 <circle cx="35" cy="2" r="2" fill="#f7b600" />
                 <rect x="0" y="0" width="12" height="4" rx="1" fill="#f7b600" />
               </g>
             )}
          </g>
          <rect width="64" height="42" rx="4" fill="none" stroke="#d1d5db" strokeWidth="1" />
        </g>
      </g>

      {/* Front tab layer */}
      <path d="M 3 27 C 3 23 5.5 21 9 21 L 91 21 C 94.5 21 97 23 97 27 L 97 74 C 97 78 94.5 80 91 80 L 9 80 C 5.5 80 3 78 3 74 Z" fill={`url(#frontGradient-${index})`}/>
      {/* Front tab highlight */}
      <path d="M 4 27 C 4 24 6 22 9 22 L 91 22 C 94 22 96 24 96 27" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />

      {/* App artwork resting against the folder front */}
      {artwork && (
        <image href={`${BASE}images/${artwork}`} x="14" y="24" width="72" height="52" preserveAspectRatio="xMidYMid meet" className="transition-transform duration-300 group-hover:-translate-y-[3px]" style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.35))' }} />
      )}

      {/* Active Selection Overlay */}
      {active && (
        <path d="M 6 22 L 6 10 C 6 6 8.5 4 12 4 L 33 4 C 36 4 38 5 39 8 L 44 15 C 45 16 47 17 49 17 L 90 17 C 94 17 96 19 96 23 L 96 74 C 96 78 94 80 90 80 L 10 80 C 6 80 4 78 4 74 Z M 3 27 C 3 23 5.5 21 9 21 L 91 21 C 94.5 21 97 23 97 27 L 97 74 C 97 78 94.5 80 91 80 L 9 80 C 5.5 80 3 78 3 74 Z" fill="black" opacity="0.15" />
      )}
    </svg>
  );
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The folder tile's colour. macOS folders are light, so the type
 *  flips to brand navy on them and stays white only on the deep folders.
 *
 *  Contrast is measured across BOTH gradient stops, not just one: a face that
 *  runs pale-to-saturated can be readable at the bottom and hopeless at the top.
 *  If neither ink clears the bar on the tile's raw colour, the face is lifted
 *  towards white by the smallest amount that does — lightening keeps the hue
 *  recognisably the tile's, where darkening towards navy turned orange to brown. */

/** Where each dock icon actually goes. Outlook is a mailto: so it opens in
 *  whatever mail client the visitor already uses; Teams uses Microsoft's
 *  documented chat deep link, which resolves the address to the person. */
const DOCK_LINKS = {
  linkedin: { href: 'https://www.linkedin.com/in/dannybarr22', label: 'Daniel Barr on LinkedIn', external: true },
  outlook: { href: 'mailto:name@example.com', label: 'Email Daniel Barr', external: false },
  teams: { href: 'https://teams.microsoft.com/l/chat/0/0?users=name%40example.com', label: 'Message Daniel Barr on Microsoft Teams', external: true },
} as const;

function DockIcon({ kind }: { kind: keyof typeof DOCK_LINKS }) {
  const source = kind === 'teams' ? 'teams-new.png' : kind === 'outlook' ? 'outlook-new.png' : 'linkedin.png';
  return <img src={`${BASE}images/${source}`} alt={`${kind} app`} className="h-full w-full object-contain" />;
}

function MockDashboard({ project, index }: { project: ApiProject; index: number }) {
  const styleType = index % 3;

  return (
    <div className="relative h-full w-full" data-testid="mock-dashboard">
      <div className="absolute inset-0 overflow-hidden bg-white">
        {/* Browser Chrome */}
        <div className="h-8 bg-[#f5f5f7] border-b border-[#e5e5ea] flex items-center px-4 gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <div className="flex-1 mx-4">
            <div className="h-5 rounded-md bg-white border border-[#e5e5ea] flex items-center justify-center shadow-sm">
              <span className="text-[9px] font-medium text-[#86868b]">app.internal/{project.title.toLowerCase().replace(/\s/g, '-')}</span>
            </div>
          </div>
        </div>

        {/* Mock UI Content */}
        <div className="flex h-[calc(100%-2rem)] bg-[#fbfbfd]">
          {/* Sidebar */}
          <div className="w-36 bg-[#f5f5f7] border-r border-[#e5e5ea] p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-[4px] bg-[#1434cb] text-white flex items-center justify-center text-[8px] font-bold">{project.code}</div>
              <div className="text-[10px] font-bold text-[#1d1d1f] truncate">{project.title}</div>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-6 rounded-md px-2 flex items-center gap-2 ${i === 1 ? 'bg-[#e8e8ed]' : ''}`}>
                  <div className={`w-2.5 h-2.5 rounded-sm ${i === 1 ? 'bg-[#1434cb]' : 'bg-[#c7c7cc]'}`} />
                  <div className={`h-1.5 rounded-full w-14 ${i === 1 ? 'bg-[#1d1d1f]' : 'bg-[#c7c7cc]'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 p-6 flex flex-col gap-5 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[16px] font-bold text-[#1d1d1f]">Overview</div>
                <div className="text-[10px] text-[#86868b] mt-1">Live agent telemetry</div>
              </div>
              <div className="h-6 w-24 rounded-full bg-[#1434cb] flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">Generate Report</span>
              </div>
            </div>

            {styleType === 0 && (
              <>
                <div className="flex gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex-1 bg-white p-3 rounded-[8px] border border-[#e5e5ea] shadow-sm">
                      <div className="h-1.5 w-10 bg-[#86868b] rounded-full mb-2" />
                      <div className="text-[20px] font-bold text-[#1d1d1f] mb-1">{i === 1 ? '99.9%' : i === 2 ? '14.2k' : '0.4s'}</div>
                      <div className="h-1 w-12 bg-[#34c759] rounded-full opacity-50" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 bg-white rounded-[8px] border border-[#e5e5ea] shadow-sm p-4 flex items-end gap-2 pb-5 relative overflow-hidden">
                  <div className="absolute top-3 right-4 text-[9px] font-bold text-[#1d1d1f]">Activity</div>
                  {[40, 70, 45, 90, 65, 80, 55, 100, 75, 60, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#1434cb] rounded-t-sm opacity-90 transition-all" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </>
            )}

            {styleType === 1 && (
              <div className="flex flex-col gap-4 h-full">
                <div className="flex gap-4 h-1/2">
                  <div className="flex-1 bg-white rounded-[8px] border border-[#e5e5ea] shadow-sm p-4 relative">
                     <div className="w-20 h-20 rounded-full border-[5px] border-[#f5f5f7] border-l-[#1434cb] border-t-[#1434cb] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45" />
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[14px] font-bold text-[#1d1d1f]">72%</div>
                  </div>
                  <div className="flex-[1.5] bg-white rounded-[8px] border border-[#e5e5ea] shadow-sm p-4 flex flex-col gap-2 justify-center">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="flex items-center gap-3">
                         <div className="w-5 h-5 rounded-full bg-[#f5f5f7] flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-[#f7b600]" /></div>
                         <div className="flex-1 h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden"><div className="h-full bg-[#1434cb]" style={{ width: `${100 - i * 15}%` }}/></div>
                       </div>
                     ))}
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-[8px] border border-[#e5e5ea] shadow-sm flex flex-col justify-end relative overflow-hidden">
                   <svg className="w-full h-12 absolute bottom-0 left-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                     <path d="M0,100 L0,50 Q25,20 50,60 T100,30 L100,100 Z" fill="#1434cb" opacity="0.1" />
                     <path d="M0,50 Q25,20 50,60 T100,30" fill="none" stroke="#1434cb" strokeWidth="2" />
                   </svg>
                </div>
              </div>
            )}

            {styleType === 2 && (
              <div className="flex gap-4 h-full">
                <div className="flex-1 flex flex-col gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex-1 bg-white rounded-[8px] border border-[#e5e5ea] shadow-sm p-3 flex flex-col justify-between">
                       <div className="h-1.5 w-1/2 bg-[#f5f5f7] rounded-full" />
                       <div className="flex justify-between items-end">
                          <div className="h-5 w-16 bg-[#1434cb] rounded-sm opacity-20" />
                          <div className="h-3 w-3 rounded-full bg-[#f7b600]" />
                       </div>
                    </div>
                  ))}
                </div>
                <div className="flex-[1.5] bg-[#1d1d1f] rounded-[8px] shadow-sm p-4 relative overflow-hidden">
                   <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #1434cb 25%, transparent 25%, transparent 75%, #1434cb 75%, #1434cb), linear-gradient(45deg, #1434cb 25%, transparent 25%, transparent 75%, #1434cb 75%, #1434cb)', backgroundSize: '12px 12px', backgroundPosition: '0 0, 6px 6px' }} />
                   <div className="relative z-10 flex flex-col gap-2 h-full justify-end pb-2">
                     <div className="text-[10px] text-white/50 font-mono">&gt; SYSTEM.STATUS</div>
                     <div className="text-[12px] text-[#34c759] font-mono">ALL AGENTS ONLINE_</div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// Easing/duration for the video's expand-to-fill-the-folder move.
const VIDEO_EASE = 'cubic-bezier(.22,1,.36,1)';
const VIDEO_MS = 520;

type Origin = { x: number; y: number };

/** Place a pinned element over a viewport rect. `origin` is where the element's
 *  own (0,0) actually lands on screen: a fixed element inside an animated (and
 *  therefore transformed) panel is positioned against that panel, not the
 *  viewport, so its coordinates have to be rebased. */
function applyRect(el: HTMLElement, rect: DOMRect, origin: Origin) {
  el.style.top = `${rect.top - origin.y}px`;
  el.style.left = `${rect.left - origin.x}px`;
  el.style.width = `${rect.width}px`;
  el.style.height = `${rect.height}px`;
}

/** Video-backed projects: a poster with a play button that, once played,
 *  expands out of the screenshot slot to take over the whole folder panel. */
function VideoShot({
  project,
  panelRef,
  stage,
  onExpandedChange,
}: {
  project: ApiProject;
  panelRef: RefObject<HTMLDivElement | null>;
  stage: StageState;
  onExpandedChange: (expanded: boolean) => void;
}) {
  // The slot keeps the layout space; the box is what flies out of it.
  const slotRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const originRef = useRef<Origin>({ x: 0, y: 0 });
  // Pending "collapse finished" cleanup, so a second transition cannot strand it.
  const settleRef = useRef<((e?: TransitionEvent) => void) | null>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const minimiseRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [started, setStarted] = useState(false);

  const targetRect = () => panelRef.current?.getBoundingClientRect() ?? null;
  const report = useRef(onExpandedChange);
  report.current = onExpandedChange;
  useEffect(() => {
    report.current(expanded);
  }, [expanded]);
  // Codec fallback sibling, by convention: foo.mp4 ships alongside foo.webm.
  const webm = project.videoUrl?.endsWith('.mp4') ? project.videoUrl.replace(/\.mp4$/, '.webm') : null;

  const expand = () => {
    const box = boxRef.current;
    const to = targetRect();
    if (!box || !to) return;
    const reduced = prefersReducedMotion();
    // FLIP: pin the box where it already is, then animate to the panel's box.
    const from = box.getBoundingClientRect();
    box.style.transition = 'none';
    box.style.position = 'fixed';
    box.style.zIndex = '40';
    // Probe where top:0/left:0 actually lands, then keep using that origin.
    box.style.top = box.style.left = '0px';
    const probe = box.getBoundingClientRect();
    const origin = { x: probe.left, y: probe.top };
    originRef.current = origin;
    applyRect(box, from, origin);
    void box.offsetWidth;
    box.style.transition = reduced
      ? 'none'
      : `top ${VIDEO_MS}ms ${VIDEO_EASE}, left ${VIDEO_MS}ms ${VIDEO_EASE}, width ${VIDEO_MS}ms ${VIDEO_EASE}, height ${VIDEO_MS}ms ${VIDEO_EASE}, border-radius ${VIDEO_MS}ms ${VIDEO_EASE}`;
    box.style.borderRadius = '20px';
    applyRect(box, to, origin);
    setExpanded(true);
    setStarted(true);
    void videoRef.current?.play().catch(() => {});
  };

  const collapse = () => {
    const box = boxRef.current;
    const slot = slotRef.current;
    videoRef.current?.pause();
    setExpanded(false);
    if (!box || !slot) return;
    const reduced = prefersReducedMotion();
    box.style.transition = reduced
      ? 'none'
      : `top ${VIDEO_MS}ms ${VIDEO_EASE}, left ${VIDEO_MS}ms ${VIDEO_EASE}, width ${VIDEO_MS}ms ${VIDEO_EASE}, height ${VIDEO_MS}ms ${VIDEO_EASE}, border-radius ${VIDEO_MS}ms ${VIDEO_EASE}`;
    box.style.borderRadius = '';
    applyRect(box, slot.getBoundingClientRect(), originRef.current);
    const settle = (e?: TransitionEvent) => {
      if (e && e.target !== box) return;
      box.removeEventListener('transitionend', settle);
      settleRef.current = null;
      box.style.transition = '';
      box.style.position = '';
      box.style.zIndex = '';
      box.style.top = box.style.left = box.style.width = box.style.height = '';
    };
    settleRef.current?.();
    settleRef.current = settle;
    if (reduced) settle();
    else box.addEventListener('transitionend', settle);
  };

  // Expanding unmounts the play button and mounts the minimise button (and the
  // reverse on collapse), so focus has to be handed between them. This runs at
  // layout time rather than on a frame callback: on a frame callback the button
  // being handed to may not exist yet, and focus is left stranded on <body>.
  const firstRender = useRef(true);
  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (expanded) minimiseRef.current?.focus();
    else (playRef.current ?? videoRef.current)?.focus();
  }, [expanded]);

  // While expanded: Escape minimises the video instead of closing the folder,
  // and a resize re-fits it to the panel.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      collapse();
    };
    const onResize = () => {
      const box = boxRef.current;
      const to = targetRect();
      if (!box || !to) return;
      // The panel recentres on resize, taking the pinned box's origin with it.
      const before = box.style.transition;
      box.style.transition = 'none';
      box.style.top = box.style.left = '0px';
      const probe = box.getBoundingClientRect();
      originRef.current = { x: probe.left, y: probe.top };
      applyRect(box, to, originRef.current);
      void box.offsetWidth;
      box.style.transition = before;
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', onResize);
    };
  }, [expanded]);

  useEffect(() => () => settleRef.current?.(), []);

  // The window is on its way out — the video must not outlive it.
  useEffect(() => {
    if (stage !== 'leaving') return;
    videoRef.current?.pause();
    const box = boxRef.current;
    if (box && expanded) {
      box.style.transition = 'opacity 220ms ease-out';
      box.style.opacity = '0';
    }
  }, [stage, expanded]);

  return (
    <div ref={slotRef} className="relative h-full w-full" data-testid="video-shot">
      <div
        ref={boxRef}
        className="absolute inset-0 overflow-hidden rounded-[14px] bg-black"
      >
        <video
          ref={videoRef}
          poster={project.previewImage ? `${BASE}images/${project.previewImage}` : undefined}
          preload="metadata"
          playsInline
          controls={expanded}
          onEnded={collapse}
          // Collapsed, the poster fills the slot like the reference's flat
          // screenshot; expanded, the whole frame has to be visible.
          className={`h-full w-full bg-black ${expanded ? 'object-contain' : 'object-cover'}`}
          data-testid="video-project"
        >
          {/* An .mp4 is expected to ship with a same-named .webm sibling: VP9/Opus
              first for browsers built without the proprietary codecs, H.264/AAC
              after it for Safari and everything else. */}
          {webm && <source src={`${BASE}${webm}`} type="video/webm" />}
          <source src={`${BASE}${project.videoUrl}`} type={project.videoUrl?.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
        </video>

        {/* Poster overlay with the play button — gone once the film has started */}
        {!expanded && (
          <button
            ref={playRef}
            type="button"
            onClick={(e) => { e.stopPropagation(); expand(); }}
            aria-label={started ? `Resume ${project.title} film` : `Play ${project.title} film`}
            data-testid="button-play-video"
            className={`group/play absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,.15)_0%,rgba(0,0,0,.65)_100%)] transition-opacity duration-300 hover:bg-black/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#f7b600] ${started ? "opacity-0 hover:opacity-100 focus-visible:opacity-100" : ""}`}
          >
            <span className="relative flex h-[74px] w-[74px] items-center justify-center rounded-full border border-white/40 bg-white/15 shadow-[0_10px_40px_rgba(0,0,0,.45)] backdrop-blur-md transition-transform duration-300 group-hover/play:scale-110">
              <span className="absolute inset-0 rounded-full border border-white/30 animate-[playPulse_2.6s_ease-out_infinite]" />
              <svg width="24" height="26" viewBox="0 0 24 26" fill="none" className="ml-[4px]">
                <path d="M2 2.6 22 13 2 23.4V2.6Z" fill="#f7b600" />
              </svg>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/85 drop-shadow">
              {started ? 'Resume the film' : 'Watch the film'}
            </span>
          </button>
        )}

        {/* Minimise back into the slot */}
        {expanded && (
          <button
            ref={minimiseRef}
            type="button"
            onClick={(e) => { e.stopPropagation(); collapse(); }}
            aria-label="Minimise video"
            data-testid="button-minimise-video"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white/80 backdrop-blur-md transition-colors hover:bg-black/75 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f7b600]"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M5 1v4H1M8 12V8h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/** The screenshot, flat inside the window — no nested browser chrome, no tilt.
 *  It keeps its own aspect ratio and is shown whole: the window scrolls to it
 *  rather than cropping it. */
/** A screenshot this much taller than it is wide is treated as "portrait": in a
 *  full-width window it would be a narrow strip with huge grey margins, so the
 *  window puts it in a slim column beside the text instead. 4:5 and taller. */
const PORTRAIT_RATIO = 1.25;
function AppShot({ project, className }: { project: ApiProject; className?: string | undefined }) {
  return (
    <img
      src={`${BASE}images/${project.previewImage}`}
      alt={`${project.title} preview`}
      decoding="async"
      className={className ?? 'block h-auto w-full bg-[#f2f2f2]'}
      data-testid="app-shot"
    />
  );
}

type StageState = 'open' | 'leaving';

/** Window chrome, matched to the reference: a macOS document window.
 *  Light title bar with the three lights, then the record itself — title,
 *  body copy, a centred meta grid — and the preview screenshot beneath it. */
const WIN_INK = '#111111';
const WIN_BODY = '#6e6e6e';
const WIN_META = '#5f5f5f';
const META_LABEL = 'text-[10px] font-bold uppercase leading-none tracking-[0.09em]';
const META_VALUE = 'mt-[7px] text-[14px] font-normal leading-snug';

function LaunchStage({
  project,
  index,
  stage,
  mobile,
  originRect,
  onClose,
  onExited,
}: {
  project: ApiProject;
  index: number;
  stage: StageState;
  mobile: boolean;
  /** The tile that was clicked, so the window can zoom out of it. */
  originRect: DOMRect | null;
  onClose: () => void;
  onExited: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const titleId = `launch-stage-title-${project.id}`;
  const isVideo = Boolean(project.videoUrl);
  // A tall, phone-shaped screenshot sits in a slim column beside the text on
  // desktop rather than full-width beneath it, which would make the window
  // enormously tall for a narrow strip of image. Mobile always stacks.
  const portraitShot = usePortraitShot(isVideo ? null : project.previewImage);
  const sideBySide = portraitShot && !mobile;

  const meta = [
    { label: 'Year', value: project.year ? String(project.year) : '' },
    { label: 'Project Type', value: project.category },
    { label: 'Status', value: project.status },
    { label: 'Credits', value: 'Daniel Barr' },
  ].filter((entry) => entry.value);

  // The window zooms out of the tile that was clicked — short enough that the
  // file still reads as opening straight away.
  useLayoutEffect(() => {
    if (!originRect || prefersReducedMotion() || mobile) return;
    const el = panelRef.current;
    if (!el) return;
    // Inside a transformed ancestor a rect collapses, so measure the layout box.
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const rect = el.getBoundingClientRect();
    if (!w || !h) return;
    const k = Math.max(0.05, originRect.width / w);
    const dx = originRect.left + originRect.width / 2 - (rect.left + w / 2);
    const dy = originRect.top + originRect.height / 2 - (rect.top + h / 2);
    const zoom = el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${k})`, opacity: 0 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: 260, easing: 'cubic-bezier(.2,.85,.3,1)' }
    );
    return () => zoom.cancel();
  }, []);

  // Move focus into the window without lighting up the close button's focus
  // ring — the panel itself takes it, and Tab then walks the window's controls.
  useEffect(() => {
    if (stage !== 'leaving') panelRef.current?.focus({ preventScroll: true });
  }, [stage]);

  const exitRef = useRef(onExited);
  exitRef.current = onExited;
  useEffect(() => {
    if (stage !== 'leaving') return;
    const delay = prefersReducedMotion() ? 0 : 200;
    const timer = window.setTimeout(() => exitRef.current(), delay);
    return () => window.clearTimeout(timer);
  }, [stage]);


  // Belt and braces: whatever moves focus out of the window — Tab, a click on
  // the desktop behind it, the browser's own focus handling — pulls it back.
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      const target = e.target as Node | null;
      if (target && panel.contains(target)) return;
      panel.focus({ preventScroll: true });
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);

  // Trap Tab / Shift+Tab within the window while open. This listens on the
  // document in the capture phase rather than on the panel: focus starts on the
  // panel itself and can be moved outside it by the browser, and a handler bound
  // to the panel stops seeing the key the moment that happens.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      // A playing <video> owns its own control bar, which lives in shadow DOM we
      // cannot enumerate. Hand Tab back to the browser while focus is in there;
      // the focusin guard below catches it if it tabs out the far side.
      if (document.activeElement instanceof HTMLVideoElement && panel.contains(document.activeElement)) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), video[controls], textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(
        (el) =>
          el.getAttribute('aria-hidden') !== 'true' &&
          (el.offsetParent !== null || el === document.activeElement)
      );
      e.preventDefault();
      if (focusable.length === 0) {
        panel.focus({ preventScroll: true });
        return;
      }
      const activeEl = document.activeElement as HTMLElement | null;
      const at = activeEl ? focusable.indexOf(activeEl) : -1;
      // Anything that isn't a listed control (the panel itself on open, or an
      // element outside the window) counts as sitting at the edge of the trap.
      const next = at === -1
        ? (e.shiftKey ? focusable.length - 1 : 0)
        : (at + (e.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
      focusable[next]?.focus();
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto" data-testid="panel-launch-stage">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 ${stage === 'leaving' ? 'animate-[fadeOut_0.2s_ease-out_forwards]' : 'animate-[fadeIn_0.25s_ease-out_forwards]'}`}
        onClick={onClose}
        data-testid="backdrop-launch-stage"
      />

      {/* The window. Mobile takes the whole screen and scrolls. */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: WIN_INK }}
        className={`relative flex flex-col overflow-hidden bg-white ${
          mobile
            ? 'h-[100dvh] w-full'
            : `${
                sideBySide ? 'h-auto max-h-[88dvh] w-[760px]' : 'h-[min(780px,90dvh)] w-[880px]'
              } max-w-[92vw] rounded-[20px] shadow-[0_50px_130px_rgba(0,0,0,.5),0_2px_10px_rgba(0,0,0,.2)]`
        } ${stage === 'leaving' ? 'pointer-events-none animate-[windowOut_0.2s_ease-in_forwards]' : ''}`}
      >
        {/* Title bar */}
        <div
          className={`flex shrink-0 items-center gap-[14px] border-b border-[#e4e4e4] bg-[#f1f1f1] px-[16px] ${
            mobile ? 'pb-[12px] pt-[calc(12px+env(safe-area-inset-top))]' : 'h-[42px]'
          }`}
        >
          <div className="flex shrink-0 items-center gap-[8px]">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              // Hidden behind the expanded film — and out of the tab order with it.
              disabled={videoExpanded}
              aria-hidden={videoExpanded}
              data-testid="button-close-detail"
              className={`group/light flex h-[12px] w-[12px] items-center justify-center rounded-full bg-[#ff5f57] transition-transform hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#f7b600] ${
                videoExpanded ? 'pointer-events-none opacity-0' : ''
              } ${mobile ? 'scale-[1.35]' : ''}`}
            >
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none" className="opacity-0 transition-opacity group-hover/light:opacity-100">
                <path d="M1 1l5 5M6 1L1 6" stroke="#7a0d05" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
            <span className={`h-[12px] w-[12px] rounded-full bg-[#febc2e] ${mobile ? 'scale-[1.35]' : ''}`} aria-hidden="true" />
            <span className={`h-[12px] w-[12px] rounded-full bg-[#28c840] ${mobile ? 'scale-[1.35]' : ''}`} aria-hidden="true" />
          </div>
          <span className="truncate text-[13px] font-medium tracking-[-0.01em] text-[#4a4a4a]" data-testid="text-window-title">
            {project.title}
          </span>
        </div>

        {/* Record — title, body, meta, then the screenshot. The window scrolls
            so the whole screenshot can be read, however tall it is. */}
        <div className={`win-scroll flex min-h-0 flex-1 overflow-y-auto overscroll-contain ${sideBySide ? 'flex-row items-center' : 'flex-col'}`}>
          <div
            className={`${sideBySide ? 'min-w-0 flex-1 pl-[30px] pr-[6px] py-[26px]' : 'shrink-0'} ${
              sideBySide ? '' : mobile ? 'px-[22px] pb-[22px] pt-[22px]' : 'px-[30px] pb-[26px] pt-[26px]'
            }`}
          >
            <h2
              id={titleId}
              className={`font-bold leading-[1.02] tracking-[-0.035em] ${mobile ? 'text-[34px]' : 'text-[clamp(34px,4.6vw,50px)]'}`}
              data-testid="text-detail-title"
            >
              {project.title}
            </h2>

            {project.description && (
              <p
                className="mt-[16px] text-[15px] font-light leading-[1.62]"
                style={{ color: WIN_BODY }}
                data-testid="text-detail-description"
              >
                {project.description}
              </p>
            )}

            <dl
              className={`mx-auto grid w-full max-w-[600px] grid-cols-2 text-center ${
                mobile ? 'mt-[24px] gap-x-[24px] gap-y-[18px]' : 'mt-[28px] gap-x-[40px] gap-y-[20px]'
              }`}
              data-testid="text-detail-meta"
            >
              {meta.map((entry) => (
                <div key={entry.label}>
                  <dt className={META_LABEL} style={{ color: '#1a1a1a' }}>{entry.label}</dt>
                  <dd className={META_VALUE} style={{ color: WIN_META }}>{entry.value}</dd>
                </div>
              ))}

              {project.useCases.length > 0 && (
                <div className="col-span-2">
                  <dt className={META_LABEL} style={{ color: '#1a1a1a' }}>Use Cases</dt>
                  <dd className={META_VALUE} style={{ color: WIN_META }}>{project.useCases.join('  ·  ')}</dd>
                </div>
              )}
            </dl>

            {project.url && (
              <div className="mt-[24px] text-center">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group/cta inline-flex items-center gap-[7px] text-[13px] font-semibold tracking-[.01em] text-[#111111] underline decoration-[#cfcfcf] underline-offset-[5px] transition-colors hover:decoration-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f7b600]"
                  data-testid="link-project-cta"
                >
                  Open {project.title}
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="transition-transform duration-200 group-hover/cta:translate-x-[2px]">
                    <path d="M1 7h11M7.5 2.5 12 7l-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          {/* Preview screenshot — inset from the window edge, corners rounded */}
          <div
            className={
              sideBySide
                ? 'flex w-[268px] shrink-0 items-center justify-center py-[26px] pl-[18px] pr-[30px]'
                : `shrink-0 ${mobile ? 'px-[18px] pb-[calc(20px+env(safe-area-inset-bottom))]' : 'px-[30px] pb-[30px]'}`
            }
          >
            {/* A film keeps a fixed 16:9 slot; a screenshot keeps its own shape.
                The video's box must not be clipped here — it expands out of it. */}
            <div className={`relative rounded-[14px] bg-[#f2f2f2] ${sideBySide ? 'flex w-fit max-w-full items-center justify-center' : 'w-full'} ${isVideo || !project.previewImage ? 'aspect-video' : ''} ${isVideo ? '' : 'overflow-hidden ring-1 ring-black/[.07]'}`}>
              {isVideo ? (
                <VideoShot project={project} panelRef={panelRef} stage={stage} onExpandedChange={setVideoExpanded} />
              ) : project.previewImage ? (
                <AppShot
                  project={project}
                  className={
                    sideBySide
                      ? 'block h-auto max-h-[min(520px,66dvh)] w-auto max-w-full bg-[#f2f2f2]'
                      : undefined
                  }
                />
              ) : (
                <MockDashboard project={project} index={index} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* DBLABS wordmark — "DBL[flask]BS" with the lab flask standing in for the A. */
function DblabsWordmark() {
  return (
    <span
      className="inline-flex select-none items-baseline font-[900] leading-none tracking-[-.035em] drop-shadow-[0_1px_2px_rgba(255,255,255,.6)]"
      style={{ fontSize: 'clamp(20px, min(2.2vw, 3.6vh), 36px)' }}
      aria-label="DBLABS"
      data-testid="brandmark"
    >
      <span className="text-[#0b1b42]">DB</span>
      <span className="text-[#2B3FD6]">L</span>
      <span className="mx-[.015em] inline-flex translate-y-[.045em] items-end">
        <svg width="0.62em" height="0.88em" viewBox="0 0 100 120" className="block text-[#0b1b42]" aria-hidden="true">
          <path
            d="M40 9 H60 M44 13 V39 L73.5 90.5 Q78.5 100.5 67.5 105 H32.5 Q21.5 100.5 26.5 90.5 L56 39 V13"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M37 74.5 L63 74.5 L71.5 90.5 Q75 98 67 101 H33 Q25 98 28.5 90.5 Z" fill="#BFD62F" />
        </svg>
      </span>
      <span className="text-[#2B3FD6]">BS</span>
    </span>
  );
}


export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Daniel Barr \u2014 Agentic Build Portfolio' },
      {
        name: 'description',
        content:
          'Daniel Barr \u2014 Agentic Build Portfolio. A collection of agentic systems and product design work.',
      },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: 'Daniel Barr \u2014 Agentic Build Portfolio' },
      {
        property: 'og:description',
        content:
          'Daniel Barr \u2014 Agentic Build Portfolio. A collection of agentic systems and product design work.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Daniel Barr \u2014 Agentic Build Portfolio' },
      {
        name: 'twitter:description',
        content:
          'Daniel Barr \u2014 Agentic Build Portfolio. A collection of agentic systems and product design work.',
      },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  const [active, setActive] = useState<number | null>(null);
  // 'open' — the window is up; 'leaving' — it is fading back out.
  const [stage, setStage] = useState<StageState>('open');
  const [origin, setOrigin] = useState<DOMRect | null>(null);
  const { data: projects, isLoading, isError } = useListProjects();
  const isMobile = useIsMobile();

  // Element (folder tile) that opened the modal — used to restore focus on close.
  const openerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<StageState>('open');
  stageRef.current = stage;

  // The desktop scene doubles as the drag surface for the folder tiles.
  const sceneRef = useRef<HTMLElement | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);

  // The layout lives on the server, so an arrangement one visitor makes is the
  // one everybody sees. A project with no saved position keeps its scatter slot.
  const serverOffsets = useMemo(() => {
    if (!projects) return undefined;
    const out: Record<string, FolderOffset> = {};
    for (const p of projects) {
      if (typeof p.positionX === 'number' && typeof p.positionY === 'number') {
        out[String(p.id)] = { fx: p.positionX, fy: p.positionY };
      }
    }
    return out;
  }, [projects]);

  const savePosition = useUpdateProjectPosition();
  const saveRef = useRef(savePosition.mutateAsync);
  saveRef.current = savePosition.mutateAsync;

  const drag = useFolderDrag(sceneRef, dockRef, {
    serverOffsets,
    // The rejection is passed through on purpose: the hook needs to see a failed
    // save so it can keep the folder where this visitor dropped it.
    onPersist: (key, offset) =>
      saveRef.current({ id: Number(key), data: { positionX: offset.fx, positionY: offset.fy } }),
  });

  const openProject = (id: number, opener: HTMLElement) => {
    openerRef.current = opener;
    // The closed file zooms out of the tile that was clicked.
    const art = opener.querySelector('[data-folder-art]') ?? opener;
    setOrigin(art.getBoundingClientRect());
    setStage('open');
    setActive(id);
  };

  // Start the exit animation; the window calls back once it has faded out.
  const closeProject = () => {
    if (stageRef.current === 'leaving') return;
    setStage('leaving');
  };

  const finishClose = () => {
    setActive(null);
    setStage('open');
    setOrigin(null);
    const opener = openerRef.current;
    openerRef.current = null;
    // Restore focus to the folder tile that opened the modal — but only once
    // React has unmounted the window, or the window's own focus guard pulls it
    // straight back and focus is left on <body> when the window disappears.
    window.requestAnimationFrame(() => opener?.focus());
  };

  // Lock the page behind the full-screen mobile stage so only the stage scrolls.
  useEffect(() => {
    if (!isMobile || active == null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isMobile, active]);

  // Measure every preview up front so a window knows on its first render
  // whether its screenshot is portrait — otherwise the layout would settle a
  // frame late, mid zoom-open.
  useEffect(() => {
    for (const project of projects ?? []) {
      if (project.previewImage && !project.videoUrl) void measureShot(project.previewImage);
    }
  }, [projects]);

  // A folder must never stay stuck to the pointer behind the open window.
  useEffect(() => {
    if (active != null) drag.cancelDrag();
  }, [active, drag.cancelDrag]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeProject();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sorted: ApiProject[] = (projects ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // A folder with nowhere to go is a dead tile — only projects that can actually
  // open get a place on the desktop.
  const launchable: ApiProject[] = sorted.filter((p) => Boolean(p.url || p.videoUrl));

  const activeIndex = active != null ? sorted.findIndex((p) => p.id === active) : -1;
  const activeProject = activeIndex >= 0 ? sorted[activeIndex] : null;

  return (
    <main
      ref={sceneRef}
      className={`relative min-h-[100dvh] w-full bg-[#d9dadd] text-[#0b1b42] selection:bg-[#f7b600] selection:text-[#0b1b42] ${isMobile ? 'overflow-x-hidden' : 'overflow-hidden'}`}
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        ...sceneVars,
        // Touch targets don't scale with the viewport — the mobile dock is fixed
        // at a comfortable finger size.
        ...(isMobile ? ({ '--dock-icon': '52px' } as CSSProperties) : null),
      }}
      data-testid="page-portfolio"
    >
      {/* Backdrop — looping video, pinned to the viewport on mobile so it covers
          the screen behind the scrolling grid instead of stretching with the content. */}
      <video
        src={BACKDROP_VIDEO_URL}
        poster={backdropPoster.url}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className={`z-0 w-full object-cover object-center ${isMobile ? 'fixed inset-0 h-[100dvh]' : 'absolute inset-0 h-full'}`}
      />

      <div className={`pointer-events-none z-[1] bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(190,193,198,.26)_100%)] ${isMobile ? 'fixed inset-0' : 'absolute inset-0'}`} />

      {isMobile ? (
        /* ---------------- Mobile: header + vertically scrolling folder grid ---------------- */
        <div className="relative z-10 flex flex-col px-4 pb-[calc(112px+env(safe-area-inset-bottom))] pt-[calc(18px+env(safe-area-inset-top))]">
          <header className="flex items-center justify-between">
            <img src={`${BASE}images/brandmark.png`} alt="Brandmark" className="h-6 w-auto drop-shadow-[0_1px_2px_rgba(255,255,255,.6)]" />
          </header>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[42px] font-extrabold leading-[.92] tracking-[.01em] text-[#0b1b42] drop-shadow-[0_1px_2px_rgba(255,255,255,.7)]" style={{ fontFamily: "'Minasans', sans-serif" }} data-testid="text-name">DANIEL<br />BARR</p>
              <p className="mt-2 text-[10px] tracking-[.2em] text-[#0b1b42]/60">Agentic Build Portfolio</p>
            </div>
            <img src={`${BASE}images/engineer.png`} alt="Daniel Barr, expert engineer" className="h-[132px] w-auto shrink-0 object-contain drop-shadow-[0_3px_6px_rgba(11,27,66,.25)]" data-testid="img-engineer" />
          </div>

          {isError && (
            <div className="mt-10 rounded-2xl border border-white/70 bg-white/70 px-6 py-4 text-center shadow-[0_12px_24px_rgba(24,38,68,.14)] backdrop-blur-md" data-testid="status-error">
              <p className="text-[13px] font-semibold tracking-[.04em] text-[#0b1b42]">Unable to load projects.</p>
              <p className="mt-1 text-[11px] text-[#0b1b42]/60">Please try again shortly.</p>
            </div>
          )}

          {isLoading && (
            <div className="mt-7 grid grid-cols-3 gap-x-3 gap-y-6">
              {Array.from({ length: SKELETON_TILES }, (_, i) => (
                <div key={`skeleton-${i}`} className="flex flex-col items-center gap-1.5" data-testid={`skeleton-tile-${i}`}>
                  <div className="relative aspect-[85/68] w-full">
                    <svg viewBox="0 0 100 80" className="h-full w-full animate-pulse overflow-visible drop-shadow-[0_4px_6px_rgba(0,0,0,.15)]">
                      <path d="M 6 22 L 6 10 C 6 6 8.5 4 12 4 L 33 4 C 36 4 38 5 39 8 L 44 15 C 45 16 47 17 49 17 L 90 17 C 94 17 96 19 96 23 L 96 74 C 96 78 94 80 90 80 L 10 80 C 6 80 4 78 4 74 Z" fill="rgba(255,255,255,0.45)" />
                      <path d="M 3 27 C 3 23 5.5 21 9 21 L 91 21 C 94.5 21 97 23 97 27 L 97 74 C 97 78 94.5 80 91 80 L 9 80 C 5.5 80 3 78 3 74 Z" fill="rgba(255,255,255,0.6)" />
                    </svg>
                  </div>
                  <span className="h-[13px] w-14 animate-pulse rounded-[4px] bg-white/60" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && !isError && (
            <div className="mt-7 grid grid-cols-3 gap-x-3 gap-y-6">
              {launchable.map((project, i) => {
                const slot = scatter[i] ?? scatter[i % scatter.length]!;
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={(e) => openProject(project.id, e.currentTarget)}
                    aria-label={project.title}
                    title={project.title}
                    className="group flex flex-col items-center gap-1.5 text-center outline-none transition-transform duration-150 active:scale-95"
                    data-testid={`button-project-${project.id}`}
                  >
                    <div data-folder-art className="relative aspect-[85/68] w-full">
                      <FolderThumb tone={slot.tone} mark={project.code} index={i} hue={slot.hue} active={false} artwork={project.iconImage} preview={project.previewImage} />
                    </div>
                    {/* A translucent navy chip keeps labels legible over both the
                        bright tarmac and the dark tyres of the backdrop. */}
                    <span className="line-clamp-2 w-full rounded-[5px] bg-[#0b1b42]/60 px-1.5 py-[2px] text-[11px] font-medium leading-tight tracking-tight text-white" data-testid={`text-project-title-${project.id}`}>{project.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ---------------- Desktop / tablet: the fluid scatter scene ---------------- */
        <>
          <header className="absolute left-8 top-7 z-20 flex items-center gap-4 md:left-12 md:top-9">
            <DblabsWordmark />
          </header>
          <div className="absolute right-[3vw] top-[3vh] z-20 flex items-start gap-[1.5vw] text-right">
            <div>
              <p className="font-extrabold leading-[.92] tracking-[.01em] text-[#0b1b42]" style={{ fontFamily: "'Minasans', sans-serif", fontSize: 'clamp(32px, min(5.2vw, 9vh), 92px)' }} data-testid="text-name">DANIEL<br />BARR</p>
              <p className="mt-2.5 tracking-[.22em] text-[#0b1b42]/50" style={{ fontSize: 'clamp(9px, min(.85vw, 1.5vh), 14px)' }}>Agentic Build Portfolio</p>
            </div>
            <img src={`${BASE}images/engineer.png`} alt="Daniel Barr, expert engineer" className="w-auto object-contain drop-shadow-[0_3px_6px_rgba(11,27,66,.25)]" style={{ height: 'clamp(96px, min(14.6vw, 24vh), 260px)' }} data-testid="img-engineer" />
          </div>

          {/* Error state — keeps the approved layout, surfaces a subtle message */}
          {isError && (
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/70 bg-white/70 px-6 py-4 text-center shadow-[0_12px_24px_rgba(24,38,68,.14)] backdrop-blur-md" data-testid="status-error">
              <p className="text-[12px] font-semibold tracking-[.04em] text-[#0b1b42]">Unable to load projects.</p>
              <p className="mt-1 text-[10px] text-[#0b1b42]/60">Please try again shortly.</p>
            </div>
          )}

          {/* Loading state — folder-shaped skeleton tiles in the same scatter positions */}
          {isLoading && scatter.slice(0, SKELETON_TILES).map((slot, i) => (
            <div
              key={`skeleton-${i}`}
              className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[2px]"
              style={{ left: slotLeft(slot.x), top: slot.y, width: TILE_W, transform: CENTRE_TRANSFORM }}
              data-testid={`skeleton-tile-${i}`}
            >
              <div className="relative" style={{ width: ART_W, height: ART_H }}>
                <svg viewBox="0 0 100 80" className="h-full w-full animate-pulse overflow-visible drop-shadow-[0_4px_6px_rgba(0,0,0,.15)]">
                  <path d="M 6 22 L 6 10 C 6 6 8.5 4 12 4 L 33 4 C 36 4 38 5 39 8 L 44 15 C 45 16 47 17 49 17 L 90 17 C 94 17 96 19 96 23 L 96 74 C 96 78 94 80 90 80 L 10 80 C 6 80 4 78 4 74 Z" fill="rgba(255,255,255,0.45)" />
                  <path d="M 3 27 C 3 23 5.5 21 9 21 L 91 21 C 94.5 21 97 23 97 27 L 97 74 C 97 78 94.5 80 91 80 L 9 80 C 5.5 80 3 78 3 74 Z" fill="rgba(255,255,255,0.6)" />
                </svg>
              </div>
              <span className="w-2/3 animate-pulse rounded-[4px] bg-white/60" style={{ height: LABEL_SIZE }} />
            </div>
          ))}

          {!isLoading && !isError && launchable.slice(0, scatter.length).map((project, i) => {
            const slot = scatter[i]!;
            const key = String(project.id);
            const held = drag.draggingKey === key;
            const off = drag.offsetPx(key);
            return (
              <button
                key={project.id}
                type="button"
                onClick={(e) => {
                  // The tail of a drag is not a click.
                  if (drag.consumeClickSuppression()) return;
                  openProject(project.id, e.currentTarget);
                }}
                onPointerDown={(e) => drag.onPointerDown(e, key)}
                onPointerMove={drag.onPointerMove}
                onPointerUp={drag.onPointerUp}
                onPointerCancel={drag.onPointerCancel}
                onDragStart={(e) => e.preventDefault()}
                draggable={false}
                aria-label={project.title}
                title={project.title}
                className={`group absolute z-10 flex flex-col items-center gap-[2px] text-center outline-none hover:z-30 hover:scale-[1.14] ${held ? 'cursor-grabbing transition-[scale] duration-150' : 'cursor-grab transition-transform duration-300'}`}
                style={{
                  left: slotLeft(slot.x),
                  top: slot.y,
                  width: TILE_W,
                  transform: CENTRE_TRANSFORM,
                  translate: `calc(-50% + ${off.x}px) calc(-50% + ${off.y}px)`,
                  touchAction: 'none',
                  ...(held
                    ? { zIndex: 50, scale: '1.18', filter: 'drop-shadow(0 14px 22px rgba(11,27,66,.38))' }
                    : null),
                }}
                data-testid={`button-project-${project.id}`}
              >
                <div data-folder-art className="relative transition-transform duration-300" style={{ width: ART_W, height: ART_H }}>
                  <FolderThumb tone={slot.tone} mark={project.code} index={i} hue={slot.hue} active={false} artwork={project.iconImage} preview={project.previewImage} />
                </div>
                <span
                  className={`max-w-[160%] truncate rounded-[4px] px-[5px] py-[1px] font-medium tracking-tight transition-colors ${slot.onDark ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,.9)]' : 'text-[#1d1d1f] drop-shadow-[0_1px_2px_rgba(255,255,255,0.9),0_0_1px_white]'} ${activeProject ? '' : 'group-hover:bg-[#0b63ce]/80 group-hover:text-white group-hover:drop-shadow-none group-focus-visible:bg-[#0b63ce] group-focus-visible:text-white group-focus-visible:drop-shadow-none'}`}
                  style={{ fontSize: LABEL_SIZE }}
                  data-testid={`text-project-title-${project.id}`}
                >{project.title}</span>
              </button>
            );
          })}
        </>
      )}

      {/* Dock — a floating macOS dock on desktop, a fixed touch bar on mobile.
          Apple's glass is not one blur: it is a refracting slab (blur +
          saturation + brightness), a bright top specular sweep, a hairline
          inner rim that fades toward the bottom, and a soft contact shadow. */}
      <div
        ref={dockRef}
        className={`group/dock isolate z-40 flex items-center rounded-[26px] ${
          isMobile
            ? 'fixed bottom-[calc(14px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 gap-4 px-5 py-2.5'
            : 'absolute bottom-7 left-1/2 -translate-x-1/2 gap-3 px-5 py-3 md:bottom-8'
        }`}
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,.58) 0%, rgba(255,255,255,.30) 42%, rgba(226,232,242,.26) 100%)',
          backdropFilter: 'blur(32px) saturate(190%) brightness(1.06)',
          boxShadow:
            '0 1px 0 0 rgba(255,255,255,.75) inset, 0 -1px 0 0 rgba(255,255,255,.18) inset, 0 0 0 .5px rgba(255,255,255,.55), 0 0 0 1px rgba(20,32,58,.10), 0 22px 44px -12px rgba(16,28,54,.42), 0 6px 14px -6px rgba(16,28,54,.30)',
        }}
      >
        {/* Specular sweep across the top third — the giveaway of real Apple glass. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[26px]"
          style={{
            background:
              'radial-gradient(120% 90% at 50% -30%, rgba(255,255,255,.85) 0%, rgba(255,255,255,.30) 38%, rgba(255,255,255,0) 68%)',
            maskImage: 'linear-gradient(180deg, #000 0%, transparent 78%)',
          }}
        />
        {/* Faint edge chromatic lift so the rim reads as glass, not plastic. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-[26px] opacity-60"
          style={{
            background:
              'linear-gradient(100deg, rgba(120,180,255,.22) 0%, rgba(255,255,255,0) 26%, rgba(255,255,255,0) 74%, rgba(255,170,210,.18) 100%)',
          }}
        />

        <div className="group/tile relative shrink-0" style={{ width: 'var(--dock-icon)', height: 'var(--dock-icon)' }} data-testid="dock-profile">
          {!isMobile && (
            <span className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-[9px] px-2.5 py-1 text-[12px] font-medium text-[#1d1d1f] opacity-0 backdrop-blur-xl backdrop-saturate-150 transition-all duration-200 ease-out group-hover/tile:translate-y-0 group-hover/tile:opacity-100" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.48))', boxShadow: '0 0 0 .5px rgba(255,255,255,.7), 0 0 0 1px rgba(20,32,58,.10), 0 8px 20px -6px rgba(16,28,54,.35)' }}>Daniel Barr</span>
          )}
          <div className={`h-full w-full overflow-hidden rounded-[22.37%] border border-white/70 bg-gradient-to-b from-[#eef2f8] to-[#cfd8e6] shadow-[0_2px_5px_rgba(0,0,0,.2)] ${isMobile ? '' : 'transition-transform duration-300 [transition-timing-function:cubic-bezier(.2,.9,.25,1.15)] hover:-translate-y-3 hover:scale-[1.35]'}`}>
            <img src={`${BASE}images/avatar.png`} alt="Daniel Barr" className="h-full w-full object-cover object-top" />
          </div>
        </div>
        <span className="w-px rounded-full" style={{ height: 'calc(var(--dock-icon) * .75)', background: 'linear-gradient(180deg, rgba(20,32,58,0), rgba(20,32,58,.18) 50%, rgba(20,32,58,0))', boxShadow: '1px 0 0 rgba(255,255,255,.55)' }} />

        {(Object.keys(DOCK_LINKS) as (keyof typeof DOCK_LINKS)[]).map((kind) => {
          const link = DOCK_LINKS[kind];
          return (
            /* The label sits in this untransformed wrapper, not in the anchor:
               inside the anchor it would inherit the icon's hover scale and
               drift away from the dock. The group is named per icon so hovering
               the dock itself doesn't light up all three labels at once. */
            <div key={kind} className="group/dock-link relative shrink-0" style={{ width: 'var(--dock-icon)', height: 'var(--dock-icon)' }}>
              {!isMobile && (
                <span className="pointer-events-none absolute -top-11 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[7px] border border-black/10 bg-[rgba(250,250,252,.92)] px-2.5 py-1 text-[12px] font-medium text-[#1d1d1f] opacity-0 shadow-[0_4px_12px_rgba(0,0,0,.18)] backdrop-blur-md transition-opacity duration-150 group-hover/dock-link:opacity-100">
                  {link.label}
                </span>
              )}
              <a
                href={link.href}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                aria-label={link.label}
                data-testid={`button-dock-${kind}`}
                className={`relative block h-full w-full rounded-[22.37%] shadow-[0_2px_5px_rgba(0,0,0,.2)] focus-visible:outline-2 focus-visible:outline-[#f7b600] ${isMobile ? 'active:scale-95 transition-transform duration-150' : "transition-transform duration-200 after:absolute after:-bottom-[5px] after:left-1/2 after:h-[3px] after:w-[3px] after:-translate-x-1/2 after:rounded-full after:bg-black/55 after:content-[''] hover:-translate-y-3 hover:scale-[1.35]"}`}
              >
                <DockIcon kind={kind} />
              </a>
            </div>
          );
        })}
      </div>

      {activeProject && (
        <LaunchStage
          project={activeProject}
          index={activeIndex}
          stage={stage}
          mobile={isMobile}
          originRect={origin}
          onClose={closeProject}
          onExited={finishClose}
        />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        /* A quiet scrollbar for the document window. */
        .win-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,.22) transparent; }
        .win-scroll::-webkit-scrollbar { width: 11px; }
        .win-scroll::-webkit-scrollbar-track { background: transparent; }
        .win-scroll::-webkit-scrollbar-thumb { background-clip: padding-box; border: 3px solid transparent; border-radius: 999px; background-color: rgba(0,0,0,.22); }
        .win-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(0,0,0,.34); }
        @keyframes fadeOut { to { opacity: 0; } }
        @keyframes playPulse { 0% { transform: scale(1); opacity: .7; } 70% { transform: scale(1.45); opacity: 0; } 100% { transform: scale(1.45); opacity: 0; } }
        /* The window drops away when it is closed. */
        @keyframes windowOut { to { opacity: 0; transform: scale(.965); } }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: .01ms !important; } }
      `}</style>
    </main>
  );
}

const LABEL_SIZE = 'max(9px, calc(var(--tile) * .125))';

const ART_W = 'calc(var(--tile) * .885)';

const TILE_W = 'var(--tile)';

/**
 * The centring offset that stacks on top of the tile's `translate` property.
 * Together they place the tile a full tile-width/height back from its slot —
 * the approved composition, inherited from the old float animation, which the
 * drag offset rides in `translate` so it never cancels either half.
 */
const CENTRE_TRANSFORM = 'translate(-50%, -50%)';
/**
 * A scatter slot's `left` percentage, floored so the tile can never cross the
 * left edge on narrow viewports. The tiles are offset a further half-tile left
 * by `CENTRE_TRANSFORM` stacking on Tailwind's `translate` property, which is
 * part of the approved composition — the floor only kicks in for the outermost
 * slot when the viewport gets tight.
 */
const slotLeft = (x: string) => `max(${x}, calc(var(--tile) + 6px))`;

const ART_H = 'calc(var(--tile) * .708)';

function measureShot(previewImage: string): Promise<void> | void {
  if (shotRatios.has(previewImage)) return;
  const img = new Image();
  img.src = `${BASE}images/${previewImage}`;
  const record = () => {
    if (img.naturalWidth) shotRatios.set(previewImage, img.naturalHeight / img.naturalWidth);
  };
  if (img.complete) {
    record();
    return;
  }
  return new Promise<void>((resolve) => {
    const done = () => { record(); resolve(); };
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', () => resolve(), { once: true });
  });
}

/** True once the preview is known to be portrait. Unknown reads as landscape,
 *  so an unmeasured image keeps the standard stacked layout until it resolves. */
function usePortraitShot(previewImage: string | null | undefined): boolean {
  const isPortrait = (file: string | null | undefined) =>
    Boolean(file) && (shotRatios.get(file as string) ?? 0) >= PORTRAIT_RATIO;

  const [portrait, setPortrait] = useState(() => isPortrait(previewImage));

  useLayoutEffect(() => {
    setPortrait(isPortrait(previewImage));
    if (!previewImage) return;
    let cancelled = false;
    void Promise.resolve(measureShot(previewImage)).then(() => {
      if (!cancelled) setPortrait(isPortrait(previewImage));
    });
    return () => { cancelled = true; };
  }, [previewImage]);

  return portrait;
}

/** Natural height/width per preview file, filled in as soon as the browser has
 *  the image. Cached across windows so a re-open never re-measures — and so the
 *  window can pick its layout on the very first render. */
const shotRatios = new Map<string, number>();
