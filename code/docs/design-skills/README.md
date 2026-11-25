# Design Skills — LCR Portfolio

Four project-local design skills support future tasks for Builder, Codex and compatible agents. This is **development infrastructure only**; installing it does not change the public site's visuals or add production dependencies.

| Skill | Purpose | When to read |
| --- | --- | --- |
| **Frontend Design** (Anthropic) | Creative direction, typography, hierarchy, layout and distinctive visual language | Before planning the future Hero redesign or a new major visual concept |
| **UI UX Pro Max** (Next Level Builder) | Searchable UI/UX rules, design-system proposals, responsive patterns and React-specific guidance | While planning/refining the LCR design system |
| **Impeccable** (Paul Bakaus) | Structured critique, polish, distill, bolder and interface craft | After a visual direction exists, for review or polishing |
| **Web Design Guidelines** (Vercel Labs) | Audits of accessibility, usability and web interface quality | Reviewing implemented pages, followed by real browser/performance/a11y tests |

All four use **one canonical copy** under `/.agents/skills/<skill-name>/`. Read each `SKILL.md` on demand; `AGENTS.md` defines which skill to consult. Consultations must not trigger unsanctioned edits.

## Installation method

The official `skills` CLI from [vercel-labs/skills](https://github.com/vercel-labs/skills) is preferred where supported. The reviewed v1.9.0 documentation requires **Node.js 22.20+**; the Builder's local tool runtime has Node 22.16.0 and no direct GitHub/npm network access. Accordingly, this repository uses **controlled, revision-pinned vendoring** of the official source folders instead of executing an unreviewed or global installer. The local snapshot remains directly discoverable under `.agents/skills/`.

See [inventory](SKILLS_INVENTORY.md) for exact source SHAs, licenses, copied resources, versions and test status; see [integration](INTEGRATION_GUIDE.md) for examples and limits.

## Update procedure

1. Review upstream release notes, scripts and license changes; compare against pinned SHAs.
2. Update the snapshot in a dedicated branch, retaining entire required skill subtrees, attribution and licenses.
3. Update the inventory and repeat static validation, UI UX search smoke, TypeScript build and CI.
4. Open a separate PR for review. **Never auto-update third-party skills** and never merge without human approval.

## LCR governance

The [LCR_ASSET_ORGANIZATION_STANDARD](https://docs.google.com/document/d/1mnoxV1gak5x_kX6KclcEH7PEN8QzYU3dX4JNzHUYHwI/edit) was located and consulted in the connected Drive. Use kebab-case folders, one shared source of truth for reusable resources, inventories, provenance and gradual validation; do not delete existing source assets merely because a new copy exists.
