import { SECTIONS, type SectionId } from "@/lib/section-content";

/**
 * The "about Daniel" cards: frosted glass tiles with a portrait and a serif
 * title. On the desktop they sit centred at the foot of the scene; on mobile
 * they run as a sideways-scrolling row under the folders.
 */
export function SectionDock({
  mobile,
  onOpen,
}: {
  mobile: boolean;
  onOpen: (id: SectionId, opener: HTMLElement) => void;
}) {
  return (
    <nav
      aria-label="About Daniel"
      className={mobile ? "section-dock section-dock--mobile" : "section-dock"}
      data-testid="section-dock"
    >
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          className="section-card"
          onClick={(e) => onOpen(section.id, e.currentTarget)}
          data-section-card
          data-testid={`button-section-${section.id}`}
        >
          <span className="section-card-img">
            {section.image ? (
              <img src={section.image} alt="" decoding="async" loading="lazy" />
            ) : (
              <span className="section-card-blank" aria-hidden="true" />
            )}
          </span>
          <span className="section-card-title">{section.title}</span>
        </button>
      ))}
    </nav>
  );
}
