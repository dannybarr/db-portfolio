/**
 * The official DBLABS wordmark, as drawn in the DBLABS Premium Brand System:
 * Inter Black, ink for "DB" and the flask, blue for the letters around it,
 * lime only in the liquid. The flask stands in for the A at cap height.
 */
const INK = "rgba(15, 12, 8, 0.92)";
const BLUE = "#2B3FD6";
const LIME = "#BFD62F";

export function DblabsLogo({ size = 19 }: { size?: number }) {
  return (
    <span
      className="inline-flex select-none items-baseline leading-none"
      style={{
        fontFamily: "'Inter', -apple-system, sans-serif",
        fontWeight: 900,
        fontSize: size,
        letterSpacing: "-0.035em",
      }}
      aria-label="DBLABS"
      role="img"
      data-testid="dblabs-logo"
    >
      <span style={{ color: INK }} aria-hidden="true">
        DB
      </span>
      <span style={{ color: BLUE }} aria-hidden="true">
        L
      </span>
      <span
        className="inline-flex items-end"
        style={{ transform: "translateY(.045em)", margin: "0 .015em" }}
        aria-hidden="true"
      >
        <svg
          width="0.62em"
          height="0.88em"
          viewBox="0 0 100 120"
          style={{ color: INK }}
          focusable="false"
        >
          <path
            d="M40 9 H60 M44 13 V39 L73.5 90.5 Q78.5 100.5 67.5 105 H32.5 Q21.5 100.5 26.5 90.5 L56 39 V13"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M37 74.5 L63 74.5 L71.5 90.5 Q75 98 67 101 H33 Q25 98 28.5 90.5 Z" fill={LIME} />
        </svg>
      </span>
      <span style={{ color: BLUE }} aria-hidden="true">
        BS
      </span>
    </span>
  );
}
