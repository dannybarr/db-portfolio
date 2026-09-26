# Dock mascot motion system

## Goal
Create a polished decorative performance in the clear strip above the dock, using three original geometric mascots. The loop will move through football juggling, a penalty shootout, professional padel, working at desks, and a pub scene without covering folders, branding, or dock controls.

## Experience
- Reserve a bounded stage above the dock on desktop and within the mobile page flow.
- Keep all performers decorative and non-interactive; provide a discreet pause/resume control outside the artwork.
- Build a seamless cinematic loop with short transitions between five distinct scenes:
  1. Shared football keepy-uppies and passing.
  2. Penalty setup, kick, goalkeeper dive, net reaction, and celebration.
  3. Professional glass-backed padel court with rally, volley, wall rebound, and point reaction.
  4. Three desks with focused typing, screen glow, coffee, and a quick collaborative exchange.
  5. British pub booth with drinks, conversation, toast, and a playful football callback.
  6. Dock climb gag: the trio attempts to scramble up the glass dock, slides back down, runs off-screen, returns carrying a ladder, and reaches the top before returning to the opening pose.
- Use restrained scene dressing that fades and transforms in place so the bottom area feels alive without becoming visually noisy.

## Implementation
- Add a self-contained `src/components/home-mascot/` module containing:
  - reusable SVG mascots and scene props;
  - pure choreography and responsive geometry data;
  - a React controller using the browser animation engine;
  - scoped styling and secondary character motion.
- Keep animation independent of project records, train state, folder dragging, and window state.
- Mount the system adjacent to the dock, and pass the open-window state so all mascot motion pauses while a project is open.
- Measure the available area and relevant folder/dock bounds; let the dedicated climb sequence visually interact with the dock while every other scene remains safely clear of it. Suppress or simplify any scene that cannot fit safely.
- Use transform and opacity animation only, with scene transitions synchronized from one timeline.

## Quality and safeguards
- Preserve the current train, exact restored folder design, project positions, project windows, DBLABS identity, and fully clickable dock links; mascot visuals may cross the dock only without intercepting input.
- Respect reduced-motion, page visibility, off-screen pausing, and live viewport changes.
- Keep character art hidden from assistive reading while exposing a small accessible motion status and pause control.
- Add geometry tests for representative phone, tablet, laptop, and wide-screen widths.
- Verify all five scenes, dock access, folder opening/dragging, modal suspension, mobile layout, and console/build health in the browser.
