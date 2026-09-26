# Train Desktop Overhaul

## Goal
Replace the current video backdrop and Finder-folder presentation with the uploaded train world, while preserving the live portfolio content, DBLABS identity, draggable saved positions, and contact dock.

## What will change
- Introduce the uploaded illustrated cliff-and-bridge scene as the full-screen desktop background.
- Add the animated locomotive and project-preview carriages. Eligible project screenshots will rotate in groups of three only while the train is offscreen, preventing visible content swaps.
- Replace the current blue folder tiles with the uploaded neutral graphite Apple-style file folders, including restrained lift, selection, focus, drag, and label states.
- Carry each project's existing file artwork into the new folder face without overpowering the native file silhouette.
- Refine project windows to the uploaded macOS document-window benchmark: neutral chrome, accurate traffic lights, origin-based open animation, smooth close motion, dimmed desktop, full-screen phone treatment, and quiet scrolling.
- Preserve each project's current title, description, metadata, screenshot/video, and external link inside the upgraded window.
- Keep keyboard opening, Escape/backdrop close, focus trapping, focus restoration, reduced-motion handling, and accessible labels.
- Restyle the DBLABS/name treatment and dock only as needed to sit coherently within the new illustrated world; retain the existing Gmail, WhatsApp, LinkedIn, and profile destinations.
- Preserve live project loading and shared drag-position persistence.

## Technical details
- Adapt the uploaded React modules to TanStack Start rather than importing its standalone Vite shell.
- Add focused train modules for geometry, preview grouping, animation timing, and rendering.
- Add the supplied SVG scenery, cliff, locomotive, and carriage artwork to the app's public assets.
- Feed existing project records into both desktop files and train carriages; projects without screenshots will remain valid desktop files but will not create blank train cargo.
- Keep the train mounted while windows open so its animation never resets.
- Replace component-level hardcoded visual colors with semantic train/file/window tokens in the global design system where practical.
- Record the train architecture decision in the project guidance file.

## Verification
- Check desktop and mobile layouts in the live preview.
- Verify train movement, project-carriage rotation, and reduced-motion static behavior.
- Verify file click, keyboard open, drag/drop persistence, window close, focus return, project links, videos, and dock links.
- Confirm no overlaps at common viewport sizes and no build, runtime, console, or missing-asset errors.
