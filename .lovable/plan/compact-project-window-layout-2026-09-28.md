# Compact project window layout

## Goal
Rework every project pop-up to follow the annotated three-zone composition, without changing project data or behaviour.

## Layout
- Desktop: use a two-column window. The left column contains the title, description, and project link. The right column stacks the screenshot above the use cases.
- Mobile: preserve the same reading order in one compact vertical flow: title and description, link, screenshot, then use cases.
- Remove Year, Status, Project Type, and Credits from every pop-up.
- Keep video expansion, window controls, scrolling, focus handling, and external links unchanged.

## Validation
- Check a project with a horizontal screenshot on desktop and mobile.
- Check a project without a supplied screenshot uses the same layout.
- Confirm removed metadata never appears and the window remains usable without overlap or clipping.
