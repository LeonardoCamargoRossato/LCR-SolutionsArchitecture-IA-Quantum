# Design Skills — Inventory

**Snapshot date:** 2026-11-23  
**Installation scope:** `LCR-SolutionsArchitecture-IA-Quantum` only, `.agents/skills`.  
**Source validation:** public GitHub repositories queried; exact source commits pinned (no floating `main` in the installation).  
**State distinction:** copied source ≠ validated functionality ≠ available in every ChatGPT environment. The one-time pinned vendor job completed successfully ([evidence](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/actions/runs/45092578775)) and removed itself.

| Skill | Author | Official source | Pinned source revision | Local path | Dependencies | License | State |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Frontend Design | Anthropic | [anthropics/skills/skills/frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | `e4bb5d960d87126ff3b3a8af1a104b7db67560ba` | `.agents/skills/frontend-design/` | `SKILL.md`, `LICENSE.txt`; no scripts | Apache-2.0 (folder license) | Installed; static validation passed in one-time snapshot job |
| UI UX Pro Max | Next Level Builder | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `6ec2bb58334ca3014573c4cbd4834ee3a40afd9d` | `.agents/skills/ui-ux-pro-max/` | `SKILL.md`, `scripts/`, `references/`, `data/`, Python 3 | MIT; copied `LICENSE` | Installed; static validation passed in one-time snapshot job |
| Impeccable | Paul Bakaus | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | `b49177d32788f2dc585c42831d845dacf1ebed2c` | `.agents/skills/impeccable/` | `SKILL.md`, `agents/`, `reference/`, `scripts/`; optional native engine download on first invocation | Apache-2.0; copied `LICENSE` and `NOTICE.md` | Installed (71 files); static checks passed; launcher not executed |
| Web Design Guidelines | Vercel Labs | [vercel-labs/agent-skills/skills/web-design-guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) | `5a37a6329fbad3666c3207392a6a7c0110e92efb` | `.agents/skills/web-design-guidelines/` | `SKILL.md`, `references/command.md` | Bundled command snapshot derives from MIT-licensed [web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines); its LICENSE is included; the agent-skills repository does not expose its own root LICENSE | Installed; static validation passed in one-time snapshot job |

## Core files and provenance

- The source SHA above is the **repository commit**, not a separately generated vendor version.
- Frontend Design must preserve its bundled `LICENSE.txt`.
- UI UX Pro Max copies the official standalone `.claude/skills/ui-ux-pro-max/` tree, not a stub. Only in its local `SKILL.md`, `${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/` commands are adapted to `.agents/skills/ui-ux-pro-max/` for project-root invocation. All scripts, references, data and their original content are retained.
- Impeccable copies the complete upstream `.agents/skills/impeccable/` subtree. The launcher is available, **but the native engine is not preinstalled or executed by this PR**. The executable may download a SHA-verified binary if later explicitly approved; passive skill documents can be read without it.
- Vercel's `references/command.md` is a pinned snapshot of `vercel-labs/web-interface-guidelines@434b7f91364665f2f733b310ec54809bf8f37937` (the upstream skill documents its SHA-256). This is not a live network fetch; the canonical rules are vendored.
- No remote third-party code runs as part of the production app; no `package.json` or `package-lock.json` changes.
- No automatic Impeccable hooks, scheduled tasks, executables or global installs are activated.

## Validation evidence (fill with CI results)

| Check | Result |
| --- | --- |
| Four `SKILL.md` files, valid frontmatter names and complete subtrees | PASS — 2 / 82 / 71 / 3 files, pinned official source trees |
| Linked references and resource paths | PASS — static validation |
| Python UI UX search smoke (read-only) | Pending |
| Impeccable command/reference files present; native engine invocation | Static-only; engine invocation intentionally deferred |
| Codex native discovery | Not directly available through connector; directory structure checked statically |
| UI/React files unchanged vs base `main` | Pending independent PR diff check; snapshot installer touched only `.agents/skills` |
| `npm ci && npm run build` | Pending |
| CI | Pending |
