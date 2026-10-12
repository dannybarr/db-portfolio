import type { ReactNode } from "react";

import { BRIEF, BRIEF_LABEL } from "@/components/project-window/brief";
import {
  ABOUT_ME,
  CV,
  DAY_JOB,
  EDUCATION,
  THINKING,
  type SectionCard,
} from "@/lib/section-content";

/**
 * The inside of a section window, laid out like the project windows: portrait
 * top right, Inter Black navy title, IBM Plex Mono body, blue labels, white
 * bordered cards and the briefing's solid blue call to action.
 */
export function SectionBody({
  section,
  titleId,
  mobile,
}: {
  section: SectionCard;
  titleId: string;
  mobile: boolean;
}) {
  return (
    <>
      {/* Title block, with the portrait where project windows put the mascots. */}
      <div className="flex items-start justify-between gap-[24px]">
        <div className="min-w-0">
          <p className={BRIEF_LABEL} style={{ color: BRIEF.blue }}>
            Exhibition Piece
          </p>
          <h2
            id={titleId}
            className={`mt-[10px] font-black leading-[.98] tracking-[-0.035em] ${mobile ? "text-[32px]" : "text-[clamp(32px,3.6vw,44px)]"}`}
            style={{ fontFamily: BRIEF.display, color: BRIEF.navy }}
            data-testid="text-section-title"
          >
            {section.title}
          </h2>
          <p
            className="mt-[8px] text-[11px] uppercase tracking-[0.14em]"
            style={{ color: BRIEF.muted }}
          >
            {section.subtitle}
          </p>
        </div>
        {section.image && section.portrait !== false && (
          <img
            src={section.image}
            alt=""
            className={`shrink-0 rounded-[6px] border bg-white object-cover object-[center_15%] p-[4px] shadow-[0_10px_30px_-18px_rgba(26,31,113,.35)] ${mobile ? "h-[96px] w-[78px]" : "h-[132px] w-[106px]"}`}
            style={{ borderColor: BRIEF.border }}
          />
        )}
      </div>

      <div className="mt-[22px]">
        {section.id === "day-job" && <DayJob mobile={mobile} />}
        {section.id === "thinking" && <Thinking />}
        {section.id === "education" && <Education mobile={mobile} />}
        {section.id === "about-me" && <AboutMe />}
        {section.id === "cv" && <Cv />}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- shared */

function Heading({ children }: { children: ReactNode }) {
  return (
    <h3
      className="text-[16px] font-extrabold tracking-[-0.02em]"
      style={{ fontFamily: BRIEF.display, color: BRIEF.navy }}
    >
      {children}
    </h3>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[4px] border bg-white ${className}`}
      style={{ borderColor: BRIEF.border }}
    >
      {children}
    </div>
  );
}

const rowBorder = (i: number) => (i > 0 ? { borderTop: `1px solid ${BRIEF.border}` } : undefined);

function Chevron() {
  return (
    <svg
      className="section-chev shrink-0 transition-transform duration-300"
      viewBox="0 0 12 12"
      width="11"
      height="11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M2 4 L6 8 L10 4" />
    </svg>
  );
}

function ActionLink({
  href,
  children,
  primary = false,
  icon,
  external = true,
  download,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
  icon?: ReactNode;
  external?: boolean;
  /** File name to save as; makes the link a download. */
  download?: string;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      {...(download ? { download } : {})}
      className={`inline-flex items-center gap-[9px] rounded-[4px] border px-[16px] py-[10px] text-[13.5px] font-bold tracking-[-0.01em] transition-[background-color,transform] active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#f7b600] ${
        primary ? "text-white hover:bg-[#0F2AAE]" : "bg-white hover:bg-[#F3F5FF]"
      }`}
      style={{
        fontFamily: BRIEF.display,
        backgroundColor: primary ? BRIEF.blue : undefined,
        borderColor: primary ? BRIEF.blue : BRIEF.border,
        color: primary ? "#fff" : BRIEF.navy,
      }}
    >
      {icon}
      {children}
    </a>
  );
}

/* ---------------------------------------------------------------- day job */

function DayJob({ mobile }: { mobile: boolean }) {
  return (
    <>
      <div
        className={
          mobile
            ? "flex flex-col gap-[22px]"
            : "grid grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-x-[34px]"
        }
      >
        <p className="min-w-0 text-[13px] leading-[1.62]">{DAY_JOB.lead}</p>

        <div className="flex min-w-0 flex-col gap-[16px]">
          <ul className="grid grid-cols-1 gap-[8px]">
            {DAY_JOB.highlights.map((item) => (
              <li
                key={item}
                className="flex items-center gap-[9px] rounded-[4px] border bg-white px-[11px] py-[8px] text-[11.5px] leading-[1.35]"
                style={{ borderColor: BRIEF.border }}
              >
                <span
                  className="h-[6px] w-[6px] shrink-0 rounded-full"
                  style={{ backgroundColor: BRIEF.blue }}
                />
                {item}
              </li>
            ))}
          </ul>
          <News />
        </div>
      </div>

      <section className="mt-[24px]">
        <Heading>Experience</Heading>
        <Card className="mt-[10px]">
          {DAY_JOB.experience.map((role, i) => (
            <details key={role.title} className="section-details group" style={rowBorder(i)}>
              <summary className="flex cursor-pointer list-none items-center gap-[12px] px-[14px] py-[10px]">
                <span
                  className="w-[22px] shrink-0 text-[12px] font-semibold"
                  style={{ color: BRIEF.blue }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="flex-1 text-[14px] font-bold tracking-[-0.01em]"
                  style={{ fontFamily: BRIEF.display, color: BRIEF.navy }}
                >
                  {role.title}
                </span>
                <span style={{ color: BRIEF.muted }}>
                  <Chevron />
                </span>
              </summary>
              <div className="grid gap-[10px] pb-[14px] pl-[48px] pr-[16px] text-[12.5px] leading-[1.6]">
                {role.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </details>
          ))}
        </Card>
      </section>
    </>
  );
}

function News() {
  const { news } = DAY_JOB;
  return (
    <div>
      <p className={BRIEF_LABEL} style={{ color: BRIEF.blue }}>
        In the News
      </p>
      <a
        href={news.url}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-[8px] flex items-stretch gap-[12px] rounded-[4px] border bg-white p-[10px] transition-colors hover:bg-[#F7F8FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#f7b600]"
        style={{ borderColor: BRIEF.border }}
      >
        <img
          src={news.image}
          alt=""
          className="h-[56px] w-[56px] shrink-0 rounded-[3px] object-cover"
        />
        <span className="flex min-w-0 flex-col justify-center">
          <span className="flex flex-wrap items-center gap-[8px]">
            <span
              className="rounded-[2px] border px-[6px] py-[1px] text-[9px] uppercase tracking-[0.16em]"
              style={{ color: BRIEF.blue, borderColor: BRIEF.border }}
            >
              {news.tag}
            </span>
            <span
              className="text-[9.5px] uppercase tracking-[0.14em]"
              style={{ color: BRIEF.muted }}
            >
              {news.source}
            </span>
          </span>
          <span
            className="mt-[4px] text-[12.5px] font-bold leading-[1.35]"
            style={{ fontFamily: BRIEF.display, color: BRIEF.navy }}
          >
            {news.title}
          </span>
        </span>
      </a>
    </div>
  );
}

/* ---------------------------------------------------------------- thinking */

function Thinking() {
  return (
    <>
      <div className="grid gap-[10px] text-[13px] leading-[1.62]">
        {THINKING.lead.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <section className="mt-[22px]">
        <Heading>{THINKING.heading}</Heading>
        <div className="mt-[12px]">
          <ActionLink
            href={THINKING.cta.url}
            primary
            icon={
              // The official X mark.
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            }
          >
            {THINKING.cta.label}
          </ActionLink>
        </div>
      </section>
    </>
  );
}

/* ---------------------------------------------------------------- education */

function Education({ mobile }: { mobile: boolean }) {
  const [current, certifications, aLevels] = EDUCATION;
  const group = (g: (typeof EDUCATION)[number]) => (
    <section key={g.group}>
      <Heading>{g.group}</Heading>
      <Card className="mt-[10px]">
        {g.items.map((item, i) => (
          <div
            key={`${item.title}-${i}`}
            className="flex items-center gap-[12px] px-[12px] py-[9px]"
            style={rowBorder(i)}
          >
            {item.logo && item.logoFit === "descriptor" ? (
              <span className="relative min-h-[72px] w-[64px] shrink-0 self-stretch">
                <img
                  src={item.logo}
                  alt="MasterClass Executive and Chicago Booth founding cohort"
                  className="absolute inset-0 h-full w-full object-contain object-left"
                />
              </span>
            ) : item.logo ? (
              <img
                src={item.logo}
                alt=""
                className="h-[36px] w-[36px] shrink-0 rounded-[4px] border bg-white object-contain"
                style={{ borderColor: BRIEF.border }}
              />
            ) : (
              <span
                className="grid h-[36px] w-[36px] shrink-0 place-items-center rounded-[4px] text-[12px] font-bold text-white"
                style={{ backgroundColor: BRIEF.navy, fontFamily: BRIEF.display }}
                aria-hidden="true"
              >
                {item.monogram}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span
                className="block text-[13.5px] font-bold leading-[1.25] tracking-[-0.01em]"
                style={{ fontFamily: BRIEF.display, color: BRIEF.navy }}
              >
                {item.title}
              </span>
              <span
                className="mt-[2px] block text-[11.5px] leading-[1.4]"
                style={{ color: BRIEF.muted }}
              >
                {item.detail}
              </span>
            </span>
            {item.grade && (
              <span
                className="text-[18px] font-black"
                style={{ fontFamily: BRIEF.display, color: BRIEF.blue }}
              >
                {item.grade}
              </span>
            )}
          </div>
        ))}
      </Card>
    </section>
  );

  // One column keeps the original order; two columns balance their heights.
  if (mobile) return <div className="flex flex-col gap-[22px]">{EDUCATION.map(group)}</div>;
  return (
    <div className="grid grid-cols-2 gap-x-[28px]">
      <div className="flex flex-col gap-[22px]">
        {group(current!)}
        {group(aLevels!)}
      </div>
      {group(certifications!)}
    </div>
  );
}

/* ---------------------------------------------------------------- about me */

function AboutMe() {
  return (
    <>
      <p
        className="text-[18px] font-extrabold leading-[1.3] tracking-[-0.02em]"
        style={{ fontFamily: BRIEF.display, color: BRIEF.navy }}
      >
        {ABOUT_ME.lead}
      </p>
      <div className="mt-[9px] grid gap-[9px] text-[13px] leading-[1.62]">
        {ABOUT_ME.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-[18px] flex flex-wrap gap-[10px]">
        {ABOUT_ME.links.map((link, i) => (
          <ActionLink
            key={link.label}
            href={link.url}
            primary={i === 0}
            external={link.kind !== "email"}
            icon={
              link.kind === "email" ? (
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 5L2 7" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                </svg>
              )
            }
          >
            {link.label}
          </ActionLink>
        ))}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- cv */

function Cv() {
  return (
    <>
      <div className="flex flex-col gap-[12px]">
        {CV.pages.map((page, i) => (
          <img
            key={page}
            src={page}
            alt={`CV page ${i + 1}`}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className="block w-full rounded-[4px] border bg-white shadow-[0_10px_30px_-18px_rgba(26,31,113,.35)]"
            style={{ borderColor: BRIEF.border }}
          />
        ))}
      </div>
      <div className="mt-[20px]">
        <ActionLink
          href={CV.pdf}
          primary
          external={false}
          download={CV.fileName}
          icon={
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M7 10l5 5 5-5" />
              <path d="M12 15V3" />
            </svg>
          }
        >
          Download CV
        </ActionLink>
      </div>
    </>
  );
}
