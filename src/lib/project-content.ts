import nfcLogo from "@/assets/nfc-desk-tracker-logo.png.asset.json";
import nfcPreview from "@/assets/nfc-desk-tracker-preview.png.asset.json";
import grilledLogo from "@/assets/grilled-folder-art.png.asset.json";
import grilledPreview from "@/assets/grilled-preview.png.asset.json";
import aeoArt from "@/assets/aeo-folder-art.png.asset.json";
import aeoGuide from "@/assets/aeo-guide.pdf.asset.json";

/**
 * Everything a desktop folder says and shows lives here, in the repo. The
 * `projects` table in Supabase only remembers where visitors dropped each
 * folder, matched on `id`.
 *
 * Images use CDN asset URLs or legacy file names from `public/images/`.
 * - `iconImage`: the art on the front of the folder. Transparent PNG, trimmed
 *   tight to the artwork, at least 256px on its longest side.
 * - `previewImage`: the screenshot at the foot of the project window.
 */

/** macOS folder tints. The palette itself is defined in `FOLDER_COLORS`. */
export type FolderColor =
  "blue" | "purple" | "pink" | "red" | "orange" | "yellow" | "green" | "graphite";

export type ProjectContent = {
  id: number;
  code: string;
  title: string;
  description: string;
  category: string;
  status: string;
  year: number;
  sortOrder: number;
  color: FolderColor;
  useCases: string[];
  url: string | null;
  previewImage: string | null;
  videoUrl: string | null;
  iconImage: string | null;
  /** An interactive document replaces the screenshot when present. */
  documentUrl?: string;
  /** Shrinks the folder art from its full-face size, e.g. 0.85. Defaults to 1. */
  artScale?: number;
};

/** Resolve CDN assets while preserving existing public image filenames. */
export function projectImageUrl(image: string): string {
  return image.startsWith("/") || image.startsWith("https://")
    ? image
    : `/images/${image}`;
}

/** Front and back faces of each folder, top and bottom of their gradients.
 *  Each tint is built from Apple's system colour of the same name. */
export const FOLDER_COLORS: Record<
  FolderColor,
  { frontTop: string; frontBottom: string; backTop: string; backBottom: string }
> = {
  blue: { frontTop: "#93cff8", frontBottom: "#62b9f5", backTop: "#4baff3", backBottom: "#2ca1f1" },
  purple: {
    frontTop: "#d9acef",
    frontBottom: "#c786e8",
    backTop: "#bf75e5",
    backBottom: "#b45ce0",
  },
  pink: { frontTop: "#ff9fb2", frontBottom: "#ff738f", backTop: "#ff5f7f", backBottom: "#ff4369" },
  red: { frontTop: "#ffa19c", frontBottom: "#ff766e", backTop: "#ff6259", backBottom: "#ff473c" },
  orange: {
    frontTop: "#ffcc85",
    frontBottom: "#ffb54d",
    backTop: "#ffaa33",
    backBottom: "#ff9b0f",
  },
  yellow: {
    frontTop: "#ffe785",
    frontBottom: "#ffdb4d",
    backTop: "#ffd633",
    backBottom: "#ffcf0f",
  },
  green: { frontTop: "#9ee4af", frontBottom: "#71d88b", backTop: "#5dd27a", backBottom: "#40ca63" },
  graphite: {
    frontTop: "#c9c9cb",
    frontBottom: "#b0b0b3",
    backTop: "#a5a5a9",
    backBottom: "#959599",
  },
};

const COMING_SOON = {
  code: "CS",
  title: "Coming Soon",
  description: "This build is still in the garage. Check back soon.",
  category: "Agentic AI",
  status: "Coming Soon",
  year: 2026,
  color: "graphite",
  useCases: [],
  url: null,
  previewImage: null,
  videoUrl: null,
  iconImage: null,
} as const;

export const PROJECTS: ProjectContent[] = [
  {
    id: 1,
    code: "CG",
    title: "Cognitive",
    description:
      "A communication terminal for leaders. 153 principles from negotiation, rapport and behavioural psychology, each with the science, how to use it and real examples.",
    category: "Applied Research",
    status: "Live",
    year: 2026,
    sortOrder: 1,
    color: "blue",
    useCases: [
      "Prepare for a negotiation or high-stakes meeting",
      "Look up the science behind a persuasion technique",
      "Build leadership communication one principle at a time",
      "Callable by an AI agent via MCP enablement",
    ],
    url: "https://cognitve.replit.app/",
    previewImage: "cognitive-preview.webp",
    videoUrl: null,
    iconImage: "cognitive-art.png",
  },
  {
    id: 2,
    code: "LK",
    title: "Linky",
    description:
      "The human layer for AI. Experts publish one link with their rate, and people or AI agents pay them in USDC for judgment a model can't give. Settled instantly on Base.",
    category: "Agentic AI",
    status: "Live",
    year: 2026,
    sortOrder: 2,
    color: "yellow",
    useCases: [
      "Get paid for expertise that isn't online",
      "Let AI agents buy human verification and sign-off",
      "Accept instant USDC payments with no invoicing",
      "Share one link that works for people and agents",
    ],
    url: "https://linkyconnect.replit.app/",
    previewImage: "linky-preview.webp",
    videoUrl: null,
    iconImage: "linky-art.png",
  },
  {
    id: 3,
    code: "BC",
    title: "Business Card",
    description:
      "An NFC business card that opens a digital profile with one tap. Visitors save my details straight to their phone and reach me on any channel from one page. Built with Replit.",
    category: "Growth",
    status: "Live",
    year: 2026,
    sortOrder: 3,
    color: "blue",
    useCases: [
      "Share contact details with a single tap",
      "Save straight to a phone's contacts, no typing",
      "Update details anytime without reprinting cards",
      "Make a memorable first impression",
    ],
    url: "https://db-visa.replit.app/",
    previewImage: "business-card-preview.webp",
    videoUrl: null,
    iconImage: "business-card-avatar.png",
  },
  {
    id: 4,
    code: "EL",
    title: "Elevate",
    description:
      "A practice curriculum for high agency and emotional intelligence. Work through real dilemmas, write your judgment in prose, and get a rubric grade and critique from an AI tutor. Human skills AI can't replace.",
    category: "EdTech",
    status: "Live",
    year: 2026,
    sortOrder: 4,
    color: "purple",
    useCases: [
      "Practise high-stakes judgment on real dilemmas",
      "Get graded feedback on how you'd handle a situation",
      "Build emotional intelligence through deliberate practice",
      "Turn your own workplace dilemma into a case study",
    ],
    url: "https://agencyeq.lovable.app/",
    previewImage: "elevate-preview.webp",
    videoUrl: null,
    iconImage: "elevate-art.png",
  },
  {
    id: 5,
    code: "ND",
    title: "NFC Desk Tracker",
    description:
      "Tap your phone on an NFC tag at your desk to start a focus session. Set objectives, pick a duration, and track focus time and streaks by day, week and month.",
    category: "Hardware",
    status: "Live",
    year: 2026,
    sortOrder: 5,
    color: "graphite",
    useCases: [
      "Start a timed focus session with one tap",
      "Track deep work against personal objectives",
      "Build consistency with daily streaks",
      "Review where your focus time goes each week",
    ],
    url: "https://deskfocus.replit.app/",
    previewImage: nfcPreview.url,
    videoUrl: null,
    iconImage: nfcLogo.url,
  },
  {
    id: 6,
    code: "LP",
    title: "LP Education Platform",
    description:
      "An AI portal for a fund's limited partners. Ask anything about the portfolio, generate podcasts, briefings and study guides on each company, and speak to the founders.",
    category: "Venture",
    status: "Live",
    year: 2026,
    sortOrder: 6,
    color: "blue",
    useCases: [
      "Answer LP questions on the portfolio and thesis instantly",
      "Generate briefings, podcasts and study guides per company",
      "Keep LPs engaged between quarterly reports",
      "Compare portfolio companies side by side",
    ],
    url: "https://db-lp-platform.lovable.app",
    previewImage: "lp-education-preview.webp",
    videoUrl: null,
    iconImage: "lp-education-art.png",
  },
  {
    id: 7,
    code: "VT",
    title: "Venture Thesis Fit",
    description:
      "Founders upload a pitch deck and AI benchmarks it against a fund's live thesis. It returns a fit score, strengths, red flags and the questions a partner will ask before a first call.",
    category: "Venture",
    status: "Live",
    year: 2026,
    sortOrder: 7,
    color: "blue",
    useCases: [
      "Screen inbound decks against a fund's thesis in minutes",
      "Give founders instant, specific feedback",
      "Prepare partners with questions before a first call",
      "Filter deal flow before it reaches the team",
    ],
    url: "https://db-custompitchscreener.lovable.app",
    previewImage: "venture-thesis-preview.webp",
    videoUrl: null,
    iconImage: "venture-thesis-art.png",
  },
  {
    id: 8,
    code: "DB",
    title: "Personal Website",
    description:
      "My personal site: day job, ideas, education, CV and side quests, all in one place.",
    category: "Personal",
    status: "Live",
    year: 2026,
    sortOrder: 8,
    color: "graphite",
    useCases: [
      "Introduce myself to new contacts",
      "Share my CV and background",
      "Link to my thinking and side projects",
    ],
    url: "https://dbarr.xyz/",
    previewImage: "personal-website-preview.webp",
    videoUrl: null,
    iconImage: "personal-website-art.png",
  },
  {
    id: 9,
    code: "TD",
    title: "The Dip",
    description:
      "A research terminal for falling stocks. It scans for names down on the day or week, explains the catalyst behind each drop, and scores them from Buy the Dip to Avoid.",
    category: "Markets",
    status: "Live",
    year: 2026,
    sortOrder: 9,
    color: "graphite",
    useCases: [
      "Spot quality companies trading down",
      "Separate temporary setbacks from real problems",
      "Filter dips by sector, timeframe and verdict",
      "Follow a disciplined, rules-based entry process",
    ],
    url: "https://the-dip-roan.vercel.app/",
    previewImage: "the-dip-preview.webp",
    videoUrl: null,
    iconImage: "the-dip-art.png",
  },
  {
    id: 10,
    code: "SC",
    title: "Stablecoin Simulation",
    description:
      "A live demo of how stablecoins move money. Each person picks an identity on their own phone, then sends funds between wallets and spends on card, with transfers settling live across devices. All funds are simulated.",
    category: "Fintech",
    status: "Live",
    year: 2026,
    sortOrder: 10,
    color: "yellow",
    useCases: [
      "Explain stablecoin payments in a live room demo",
      "Show instant transfers between wallets across phones",
      "Demonstrate spending stablecoins on a card",
      "Teach the basics with no real money at risk",
    ],
    url: "https://stablecoin-simulation.replit.app",
    previewImage: "stablecoin-preview.webp",
    videoUrl: null,
    iconImage: "stablecoin-art.png",
  },
  {
    id: 11,
    code: "GR",
    title: "Grilled",
    description:
      "Rehearse a presentation against a panel of skeptical senior stakeholders. They challenge every slide, draft the 20 hardest questions with suggested answers, and score your practice responses.",
    category: "Agentic AI",
    status: "Live",
    year: 2026,
    sortOrder: 11,
    color: "orange",
    useCases: [
      "Stress-test a board or investor deck before the meeting",
      "Find weak slides and gaps in your story",
      "Prepare answers to the toughest questions",
      "Practise under pressure with scored feedback",
    ],
    url: "https://grill-mastermind.replit.app/",
    previewImage: grilledPreview.url,
    videoUrl: null,
    iconImage: grilledLogo.url,
  },
  {
    id: 12,
    code: "SN",
    title: "SCREEN",
    description:
      "Paste in a meeting or conversation transcript and SCREEN reads what was really said: word choice, concealed information, blind spots and where decision power sits. It ends with a ranked playbook of next moves. Grounded in Chris Voss and Robert Cialdini's research. Built at the Visa AI Lab.",
    category: "Agentic AI",
    status: "Live",
    year: 2026,
    sortOrder: 12,
    color: "purple",
    useCases: [
      "Read the subtext of a client or sales call",
      "Catch the signals you missed in the moment",
      "Plan your next move from evidence in the transcript",
      "Keep transcripts private, with nothing stored on a server",
    ],
    url: "https://screen-fbi.replit.app/",
    previewImage: "screen-preview.webp",
    videoUrl: null,
    iconImage: "screen-art.png",
  },
  {
    id: 13,
    code: "PS",
    title: "Passported",
    description:
      "A member app prototype for Soho House. Each house you visit becomes a passport stamp that opens a dossier of your notes, photos and the house's history. Your profile tracks your stats across the global house network.",
    category: "Prototype",
    status: "Live",
    year: 2026,
    sortOrder: 13,
    color: "red",
    useCases: [
      "Turn house visits into a collectable passport",
      "Keep memories and photos tied to each house",
      "Encourage members to discover new houses",
      "Deepen each member's connection to the brand",
    ],
    url: "https://passported.lovable.app/",
    previewImage: "passported-preview.webp",
    videoUrl: null,
    iconImage: "passported-art.png",
  },
  {
    id: 14,
    code: "ML",
    title: "11LABS Mandarin Learning Hotline",
    description:
      "A voice tutor built with ElevenLabs. Speak Mandarin out loud and it corrects your tones and phrasing live, adapts to your level and teaches new vocabulary. I use it to practise speaking towards the BCT.",
    category: "Voice AI",
    status: "Live",
    year: 2026,
    sortOrder: 14,
    color: "blue",
    useCases: [
      "Practise speaking Mandarin out loud, anytime",
      "Get live corrections on tones and pronunciation",
      "Learn vocabulary through natural conversation",
      "Build towards a business Chinese qualification",
    ],
    url: "https://mandarin-mentor-ai-88.lovable.app",
    previewImage: "mandarin-preview.webp",
    videoUrl: null,
    iconImage: "mandarin-art.png",
  },
  {
    id: 15,
    code: "VP",
    title: "11LABS Playground",
    description:
      "Six live voice agents built with ElevenLabs, from a gym receptionist to a tradesman's booking line. Each handles the routine calls in a people-heavy business, so staff can focus on the work that needs a human.",
    category: "Voice AI",
    status: "Live",
    year: 2026,
    sortOrder: 15,
    color: "pink",
    useCases: [
      "Answer calls and book appointments around the clock",
      "Qualify leads and triage urgent requests",
      "Screen founders for a VC fund by voice",
      "Show businesses what a voice agent can do",
    ],
    url: "https://voice-agent-playground.lovable.app",
    previewImage: null,
    videoUrl: null,
    iconImage: null,
  },
  {
    id: 16,
    code: "WD",
    title: "Wardrobe",
    description:
      "Drop in a photo of an outfit and AI separates each piece into a clean product shot for your digital wardrobe. Track what you own, build outfits and keep a wishlist.",
    category: "Consumer AI",
    status: "Live",
    year: 2026,
    sortOrder: 16,
    color: "green",
    useCases: [
      "Digitise your wardrobe from your camera roll",
      "See everything you own in one place",
      "Plan outfits from the clothes you already have",
      "Keep a wishlist alongside your wardrobe",
    ],
    url: "https://wardrobe-vaulted.lovable.app",
    previewImage: "wardrobe-preview.webp",
    videoUrl: null,
    iconImage: "wardrobe-art.png",
  },
  {
    id: 17,
    code: "AC",
    title: "AI Compute Cost Analysis",
    description:
      "Built with Claude Code. An analysis of seven frontier AI models across two enterprise workloads, showing a 23.6x cost spread and when routing between models saves money. Every figure updates live as you change the assumptions.",
    category: "Research",
    status: "Live",
    year: 2026,
    sortOrder: 17,
    color: "orange",
    useCases: [
      "Compare the real cost of frontier models at scale",
      "Test routing savings against your own workload",
      "Weigh routing platforms on cost, governance and security",
      "Brief decision-makers on AI spend",
    ],
    url: "https://the-value-of-ai-routers.vercel.app/",
    previewImage: "ai-compute-preview.webp",
    videoUrl: null,
    iconImage: "ai-compute-art.png",
  },
  {
    id: 18,
    sortOrder: 18,
    code: "AEO",
    title: "AEO",
    description: "Danny's Guide to AEO — answer engine optimisation, discovery and commerce.",
    category: "Research",
    status: "Live",
    year: 2026,
    color: "purple",
    useCases: [],
    url: aeoGuide.url,
    previewImage: null,
    videoUrl: null,
    iconImage: aeoArt.url,
    documentUrl: aeoGuide.url,
  },
  { id: 19, sortOrder: 19, ...COMING_SOON, useCases: [] },
  { id: 20, sortOrder: 20, ...COMING_SOON, useCases: [] },
];
