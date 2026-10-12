/** Shared between the intro and the document <head> (see __root.tsx), kept
 *  separate so the head never imports the intro's artwork or styles. */

export const INTRO_CLASS = "dblabs-intro";

/** Runs in <head> before paint and flags <html> when the intro should play:
 *  every visit to the home page, except for visitors who prefer reduced
 *  motion. ?intro forces it regardless. */
export const INTRO_HEAD_SCRIPT = `(function(){try{var f=/[?&]intro\\b/.test(location.search);var r=matchMedia("(prefers-reduced-motion: reduce)").matches;if(location.pathname==="/"&&(f||!r))document.documentElement.classList.add("${INTRO_CLASS}")}catch(e){}})();`;

/** Covers the page from first paint until the intro mounts. Fades on its own
 *  after a few seconds so a script failure can never leave the site hidden. */
export const INTRO_HEAD_STYLE = `html.${INTRO_CLASS}::after{content:"";position:fixed;inset:0;z-index:2147483000;background:#0a0a0c;animation:dblabs-intro-failsafe .4s 6s forwards}@keyframes dblabs-intro-failsafe{to{opacity:0;visibility:hidden}}`;
