# LCR Portfolio — agent instructions

This repository follows the LCR Workflow: human-readable organization, traceability, maintainability, security, and validated incremental changes. See [LCR agent orchestration](docs/LCR_AGENT_ORCHESTRATION.md).

## Design skills (project-local, not global)

The design skills live in `.agents/skills/`; see [documentation](docs/design-skills/README.md), [inventory](docs/design-skills/SKILLS_INVENTORY.md), and [integration guide](docs/design-skills/INTEGRATION_GUIDE.md).

Read **only the relevant skill** when a task specifically involves interface design:
- Art direction, visual composition, high-impact Hero: `.agents/skills/frontend-design/SKILL.md`.
- UI/UX system, color, typography, spacing, React guidance: `.agents/skills/ui-ux-pro-max/SKILL.md`.
- Visual critique and polish (`critique`, `polish`, `bolder`, `distill`): `.agents/skills/impeccable/SKILL.md`.
- UI accessibility/usability audit: `.agents/skills/web-design-guidelines/SKILL.md` and its bundled `references/command.md`.

## Safe use

1. Explicit user requests, existing architecture, privacy/security requirements, and LCR rules override third-party design suggestions.
2. Skills guide design tasks; their presence **does not** authorize a redesign, modifying React/CSS, adding assets, migrations, deployment, or extra functionality. Ask for user authorization where required.
3. No global installation, added runtime dependencies, automatic hooks, unreviewed executables, or secret access. The Impeccable launcher can download a separate binary: **do not run it automatically**. Obtain approval after reviewing its source and download/verification behavior.
4. UI UX Pro Max scripts and data are local; invoke them from the repository root as documented in `docs/design-skills/INTEGRATION_GUIDE.md`. Do not overwrite saved design-system files without explicit authorization.
5. Verify visual changes with existing tests, build, responsive and accessibility checks. Do not claim successful checks without evidence.
6. Preserve upstream licenses, pinned revisions, and original project files. Do not silently upgrade vendored skills; inventory and review each revision.
7. This setup-only PR must not modify the Hero, current site design, React/CSS, or application content.

## Test isolation (P0)

- All ordinary browser tests must run with `npm run test:isolated -- node tests/<script>.mjs` on Linux. No production Supabase variables, external API calls or published-site browser suites in ordinary CI. See [test isolation](docs/testing/TEST_ISOLATION.md).
- The Linux network namespace has only loopback; the fixture server supplies deterministic local REST/Auth/Storage contracts. Do not bypass the guard when fixtures or tests fail. Production build/deploy is separate; real integration remains pending until an authorized environment and budget exist.
