# Three-mascot kick-up performance

## Build
- Restore Claude and Grok beside Codex in the existing bottom overlay.
- Choreograph one continuous football path between all three mascots, with timed receiving kicks, body reactions, eye attention, and ball rotation.
- Keep the performance compact, responsive, paused behind open project windows, and fully transparent to file dragging.
- Provide a composed static pose when reduced motion is enabled.

## Technical details
- Keep all work isolated in `src/components/home-mascot` and preserve the existing `suspended`-only interface.
- Use CSS keyframes and the existing SVG mascot artwork; no new runtime dependencies or page-state ownership.
- Verify the loop visually on desktop and mobile, test dragging through the stage, and confirm a clean build.
