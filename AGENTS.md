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
- Keep the three-mascot football kick-up isolated in `src/components/home-mascot`; mount it as a pointer-transparent bottom overlay receiving only `suspended`, so it never reserves or blocks folder drag space.
