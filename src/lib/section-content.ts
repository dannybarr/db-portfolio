/**
 * The "about Daniel" cards at the foot of the desktop: Day Job, Thinking,
 * Education, About Me and CV. Copy is taken word for word from dbarr.xyz.
 * Images live in `public/images/sections/`.
 */

import masterclassCohort from "@/assets/masterclass-cohort-transparent.png";

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
  lead: "I work where strategy meets building. By day I'm in Visa's Corporate Strategy team, working on growth, long-range planning, top line performance and revenue planning. Alongside that, I founded and lead Visa's AI lab in Europe, a team of five turning frontier AI into products the business can actually use. I got here through rotations in Growth Products, Risk and Fraud, Client Services and Digital Sales, so I've seen payments from the client side, the regulator side and the P&L.",
  highlights: [
    "Founded and lead Visa's AI lab in Europe, team of five",
    "Corporate Strategy: long-range planning and growth",
    "Systemic risk work submitted to the ECB and Bank of England",
    "Stablecoin settlement pilot with a global systemically important bank",
  ],
  focus: {
    kicker: "Building the next wave of",
    words: ["AGENTIC COMMERCE", "AI AT VISA", "STABLECOIN RAILS", "PAYMENTS STRATEGY"],
    line: "Shaping long-range strategy by day, and leading a five-person AI lab that turns new ideas into working prototypes.",
    more: [
      "The lab exists to close the gap between what AI can do and what Visa actually ships. We run fast experiments across agentic commerce, cybersecurity and wider AI, working directly with the European Chief Product Officer, and turn the strongest ideas into prototypes the business can test.",
      "The strategy work covers growth, top line performance and revenue planning over the long term. It means my AI work always starts from a commercial question, never a technology looking for a home.",
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
      title: "Corporate Strategy (Current)",
      body: [
        "Working on growth, long-range planning, top line performance and revenue planning, and how the market's shifts shape where Visa invests next.",
        "Bringing an operator's view from four rotations to strategic questions, and a builder's view to how the business should adopt AI.",
      ],
    },
    {
      title: "AI Lab, Founder and Lead (Current)",
      body: [
        "Founded Visa's AI lab in Europe and lead a team of five, working directly with the European Chief Product Officer.",
        "We run rapid experiments and build prototypes across agentic commerce, cybersecurity and broader AI, and publish the thinking behind them.",
        "We build with frontier AI to create commercial value, run experiments that educate the wider business and collaborate across the industry to lead from the front.",
        "Train senior leaders to find where AI fits their workflows, build those use cases with them, and run AI workshops for Visa teams worldwide.",
      ],
    },
    {
      title: "Growth Products: Stablecoins",
      body: [
        "Built the stablecoin and onchain opportunity with traditional clients, crypto natives and new client types, winning stablecoin linked card issuing deals.",
        "Launched a stablecoin settlement pilot with a global systemically important bank, the first of its kind, coordinating risk, treasury, product, marketing and finance.",
        "Supported stablecoin settlement across Europe, scaling volumes and securing market approvals country by country, plus the Visa Stablecoin Platform launch in Switzerland.",
      ],
    },
    {
      title: "Risk & Fraud",
      body: [
        "Orchestrated Visa's systemic risk analysis for the European Central Bank and built vulnerability benchmarking for the Bank of England.",
        "Led competitive intelligence across 50 risk and fraud products to inform decisions at SVP level.",
        "Closed 5 operational risk audit actions in 3 months with 100% compliance.",
      ],
    },
    {
      title: "Client Services",
      body: [
        "Found issuers with below benchmark scheme performance, dug into their transaction data for the root causes and matched the findings to the right Visa solutions, supporting a 3% approval rate uplift for a major issuer.",
        "Reported directly to VP level and led AI and Power BI work that sharpened how the team served clients.",
      ],
    },
    {
      title: "Digital Sales",
      body: [
        "Managed a portfolio of 10+ issuers and acquirers, from fintechs to national banks.",
        "Identified $1.5 million in new AANR through outbound business development.",
        "Led a digital enablement sprint for Apple Pay and mobile apps end to end, generating $384,000 AANR, and unlocked a further $32,400 by bringing analytics to a high risk merchant portfolio.",
        "Led a team of AI ambassadors scaling adoption of digital tools across sales.",
      ],
    },
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
  logoFit?: "descriptor";
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
        title: "MasterClass Executive × Chicago Booth — Founding Cohort",
        detail: "The modern MBA — business education for the age of AI.",
        logo: masterclassCohort,
        logoFit: "descriptor",
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
  lead: "I'm on a mission to make an impact.",
  body: [
    "At Visa I'm in Corporate Strategy, working on growth, long-range planning, top line performance and revenue planning. I also founded and lead our AI lab in Europe, a team of five working alongside the European Chief Product Officer. We build with frontier AI to create commercial value, run experiments that educate the wider business, and collaborate across the industry to lead from the front.",
    "Outside Visa I run DBLABS, my own lab for building agentic products and consumer apps. Through it I help businesses adapt to an agentic world, from answer engine optimisation (AEO) audits to advising gyms and VCs. Compounding learning, daily.",
    "Alongside that I'm studying for a BSc in Chartered Management, I'm in the founding cohort of the Masterclass Executive programme with Chicago Booth and OpenAI, and I'm learning Mandarin.",
    "Always up for meeting people on a mission.",
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
