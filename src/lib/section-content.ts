/**
 * The "about Daniel" cards at the foot of the desktop: Day Job, Thinking,
 * Education, About Me and CV. Copy is taken word for word from dbarr.xyz.
 * Images live in `public/images/sections/`.
 */

export type SectionId = "day-job" | "thinking" | "education" | "about-me" | "cv";

export type SectionCard = {
  id: SectionId;
  title: string;
  /** The small caps line under the title in the window. */
  subtitle: string;
  /** Card and window portrait; null when the section has no portrait. */
  image: string | null;
  /** Show the image as a portrait in the window as well as on the card. */
  portrait?: boolean;
};

const img = (file: string) => `/images/sections/${file}`;

export const SECTIONS: SectionCard[] = [
  { id: "day-job", title: "Day Job", subtitle: "Professional Career", image: img("day-job.webp") },
  { id: "thinking", title: "Thinking", subtitle: "Written Works", image: img("thinking.webp") },
  {
    id: "education",
    title: "Education",
    subtitle: "Academic Journey",
    image: img("education.webp"),
  },
  { id: "about-me", title: "About Me", subtitle: "Who I Am", image: img("about-me.webp") },
  // The CV card returns once the corrected PDF is in public/files/ and its
  // pages are in public/images/sections/ (see CV below).
];

export const DAY_JOB = {
  lead: "I am currently enrolled on Visa's leadership apprentice program, rotating through different business functions to build comprehensive capability. I currently work in Growth Products team, on the frontier of payments including scaling stablecoins, blockchain, and AI led product development & efficiency / productivity with an emphasis on vibe-coded exploration for commercial impact. I got here having left a footprint in Risk and Fraud, Client Services, and Sales (AE / BD).",
  highlights: [
    "Risk work submitted to ECB / BOE",
    "Led client optimisation reviews",
    "Signed Visa commercial deals",
    "Scaling stablecoin adoption at industry level",
  ],
  focus: {
    kicker: "Creating the next wave of",
    words: ["STABLECOINS", "AGENTIC PAYMENTS", "WEB3", "INNOVATION"],
    line: "Operating where payments, blockchain and AI meet, inside Visa's Growth Products team.",
    more: [
      "Bringing traditional finance on chain, helping Web3 players plug into Visa's payments infrastructure, and shaping how AI agents will transact. Opening up new clients and industries along the way.",
      "Day to day that means translating stablecoins and blockchain into plain commercial value for clients and internal teams, and turning frontier technology into things Visa can actually sell.",
    ],
  },
  news: {
    tag: "Stablecoins",
    source: "Visa Investor Relations · 2026",
    title: "Visa Accelerates Stablecoin Momentum, Adding Five Blockchains for Settlement",
    url: "https://investor.visa.com/news/news-details/2026/Visa-Accelerates-Stablecoin-Momentum-Adding-Five-Blockchains-for-Settlement/default.aspx",
    image: img("news-stablecoin-momentum.webp"),
  },
  experience: [
    {
      title: "Risk & Fraud",
      body: [
        "Led competitive intelligence across Risk and Fraud, with product-level analysis that fed directly into Visa's strategic positioning.",
        "Kicked off the refresh of Visa's Systemic Risk Analysis submitted to the European Central Bank.",
        "Ran industry-level vulnerabilities benchmarking in response to Bank of England expectations.",
        "Helped revamp Visa's Risk Events Programme, tightening process and reporting.",
      ],
    },
    {
      title: "Client Services",
      body: [
        "As a Client Success Manager, I ran card scheme optimisation reviews for mid-market and enterprise clients, turning the analysis into measurable commercial wins.",
        "Led AI and Power BI initiatives at a global level, building sharper KPI frameworks and workflows that improved how the team served clients.",
        "Supported clients across end-to-end implementation projects, reporting directly to VP level on senior strategic work.",
      ],
    },
    {
      title: "Digital Sales",
      body: [
        "Account Management: a portfolio of 10+ clients across issuers and acquirers, from fintechs to national banks. Deepening relationships, spotting opportunities, and partnering with them to grow on Visa.",
        "Business Development: a BDR remit. Cold outreach, cross-functional pipeline building, booking meetings and opening doors.",
        "Sales Operations: led a team of AI ambassadors, scaling adoption of digital tools and laying the groundwork for structured sales plays, sprints and segmentation.",
      ],
    },
    {
      title: "Growth Products",
      body: [
        "My current rotation, on the frontier of payments. Working across stablecoins, on-chain finance, and how AI agents will pay.",
        "Translating blockchain and stablecoins into plain commercial value for clients and internal teams, and helping Visa turn frontier technology into things it can actually sell.",
      ],
    },
    { title: "Next Rotation", body: ["The next chapter begins September 2026."] },
  ],
};

export const THINKING = {
  lead: [
    "Intentional walks spent thinking critically. The source to creativity.",
    "Notice the Meta Glasses? Superpower. Chuck them on, Wispr Flow attached and speak my thoughts",
  ],
  cta: { label: "Danny's Substack", url: "https://substack.com/@dannybarr" },
};

type EducationItem = {
  title: string;
  detail: string;
  /** A logo file, or a short monogram when there is no logo. */
  logo?: string;
  monogram?: string;
  grade?: string;
};

export const EDUCATION: { group: string; items: EducationItem[] }[] = [
  {
    group: "Current Academics",
    items: [
      {
        title: "BSc Chartered Management Degree",
        detail: "Corndel College London",
        logo: img("logo-corndel.png"),
      },
      {
        title: "MasterClass Executive Founding Cohort",
        detail: "A new kind of business education for the age of AI",
        monogram: "MC",
      },
    ],
  },
  {
    group: "Completed Certifications",
    items: [
      {
        title: "Oxford AI Programme (Grade 91%)",
        detail: "Saïd Business School, Oxford",
        logo: img("logo-oxford.png"),
      },
      {
        title: "LSE Managerial Finance",
        detail: "London School of Economics",
        logo: img("logo-lse.png"),
      },
      {
        title: "High Impact Sales Communication",
        detail: "Dale Carnegie",
        logo: img("logo-dale-carnegie.png"),
      },
      {
        title: "HSK Level: 1 (Grade 85%)",
        detail: "Mandarin Chinese Proficiency",
        logo: img("logo-hsk.png"),
      },
    ],
  },
  {
    group: "A-Levels",
    items: [
      { title: "Business Studies", detail: "Edexcel", logo: img("logo-edexcel.png"), grade: "A" },
      { title: "Geography", detail: "OCR", logo: img("logo-ocr.png"), grade: "A" },
      {
        title: "Government and Politics",
        detail: "Edexcel",
        logo: img("logo-edexcel.png"),
        grade: "B",
      },
    ],
  },
];

export const ABOUT_ME = {
  lead: "I turn frontier technology into products and commercial value.",
  body: [
    "I work in Growth Products at Visa, on the frontier of payments: stablecoins, blockchain, and AI for new product development and efficiency / productivity optimisation. My job is to take technology most people are still reading about and turn it into something financial companies can leverage for tangible upside and offer value to their customers.",
    "Outside Visa I run DBLABS, a side project built on the principle of exploring and learning artificial intelligence by building consumer AI apps and workflows. Getting creative, taking ideas to real products, serving real customers.",
    "Alongside that, I'm studying towards a BSc Chartered Management Degree, part of the Masterclass Executive x Chicago Booth x OpenAI founding cohort and am continuing to learn Chinese Mandarin. I am always looking for new opportunities, a chance to learn and meet new people.",
  ],
  links: [
    { label: "Let's speak", url: "mailto:dannybarr092@gmail.com", kind: "email" as const },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/dannybarr22",
      kind: "linkedin" as const,
    },
  ],
};

export const CV = {
  pages: [img("cv-page-1.webp"), img("cv-page-2.webp")],
  pdf: "/files/Daniel_Barr_CV.pdf",
  fileName: "Daniel_Barr_CV.pdf",
};
