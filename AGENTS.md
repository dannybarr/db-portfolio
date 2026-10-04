<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the animated project train isolated in `src/components/project-train`; it consumes project records but must never own project data or window state, so the backdrop remains mounted across file interactions.
- Size the bottom-anchored scenery and rail position from the same geometry ratio so distance adjustments keep the train on the bridge without exposing horizontal loop resets.
- Keep the three-mascot football kick-up isolated in `src/components/home-mascot`; mount it as a pointer-transparent bottom overlay receiving only `suspended`, so it never reserves or blocks folder drag space.
- Resolve project image references through `projectImageUrl` so CDN asset pointers and legacy public filenames render consistently in folder artwork and previews.
- Keep each project-window link in its screenshot column at full width; size media and copy against the available window height so standard viewports need no scrolling while overflow remains accessible on exceptionally small screens.
