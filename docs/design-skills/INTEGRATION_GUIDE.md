# Builder / Codex — Design Skills Integration

## Discovery

Open the repository root and read `AGENTS.md`. Compatible agents (including Codex in project-local discovery environments) can read `.agents/skills/<name>/SKILL.md` directly. If automatic discovery is unavailable, read the requested file manually. Copying files into GitHub **does not** install capabilities globally in ChatGPT or guarantee automatic discovery in every chat.

Select the narrowest matching skill, without loading all four for backend-only changes:

- **Art direction:** `frontend-design` — future Hero concepts; keep implementation in a separate approved PR.
- **Design systems:** `ui-ux-pro-max` — palette, tokens, typography, React layout/accessibility guidance.
- **Refinement:** `impeccable` — `critique`, `polish`, `bolder`, `distill` using the included references, with the current LCR identity retained unless expressly changing it.
- **Audit:** `web-design-guidelines` — read the bundled `references/command.md` and review target source files, then verify issues in browser and dedicated accessibility/performance checks.

## Practical examples (from project root)

**Frontend Design:** ask your Builder or Codex agent to read `.agents/skills/frontend-design/SKILL.md` before planning typography and composition. Reading alone changes nothing.

**UI UX Pro Max (optional, read-only search):**

```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "portfolio interface grid typography" --stack react
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "responsive navigation focus" --domain ux
```

The local `SKILL.md` uses project-root paths rather than the upstream Claude-specific `${CLAUDE_PLUGIN_ROOT}` prefix. The data and scripts are vendored; Python 3 is needed to run the scripts. **Do not pass `--persist` or `--force` unless the user explicitly requests updating design-system files.**

**Impeccable:** read `.agents/skills/impeccable/SKILL.md` plus the relevant `reference/critique.md`, `reference/polish.md`, `reference/bolder.md` or `reference/distill.md`. The provided launcher `scripts/impeccable` can download a native engine; do not run it or activate hooks automatically. Human approval and review of download/cache behavior are required first. Reference-only critique is still possible.

**Web Design Guidelines:** read `.agents/skills/web-design-guidelines/SKILL.md` and `references/command.md`; audit, for example, `src/pages/Home.tsx` and related CSS. Issue reports should use file/line references and concrete tests. The rules are a pinned snapshot, not an automatic web fetch.

## Priorities and LCR approval gates

1. User brief and repository safety requirements prevail.
2. Respect the existing React/Vite structure, image inventories, localization, responsive behavior and deployed content.
3. Propose changes before implementing a redesign; no skill is permission to run third-party code or publish.
4. Avoid multiple sources of design truth: `.agents/skills/` is canonical and `docs/design-skills/` contains only metadata and integration rules.
5. Only agents explicitly running in this repository can access the local skill files; other Builder/ChatGPT sessions may need repository read access.
6. Compare pinned SHAs and license text before any update; keep changes in a reviewed PR.

## Compatibility and limitations

- The reviewed `skills` CLI v1.9.0 requires Node **22.20+**. The local Builder runtime has Node **22.16.0**, npm **10.9.2**, Python **3.13.5**, and no direct npm/GitHub network access. The controlled snapshot installer therefore avoids executing the CLI globally.
- The site's CI currently uses Node 22 and a normal `npm ci && npm run build`. Design skills are not production dependencies.
- Codex-compatible folder structure and `SKILL.md` discovery can be checked statically; live Codex auto-discovery cannot be proven from this GitHub connector.
- Impeccable includes a launcher but not a preinstalled native engine. The engine downloader and optional hook paths remain unused until separately approved.
- UI UX Pro Max recommendation data are third-party inputs, not immutable design decisions or approval to rewrite the current site.
