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
- Keep the mascot performance isolated in `src/components/home-mascot` (revision-2 artifact module: HomeMascot.tsx, mascots.tsx, mascotChoreo.ts, mascot.css). It must be mounted inside a `.mascot-host` wrapper as the scene's last in-flow child and receive only the `suspended` prop, never project data or window state. There is no dock: contact links live under the "Agentic Build Portfolio" label.
