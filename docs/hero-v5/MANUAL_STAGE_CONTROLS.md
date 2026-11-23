# Hero V5.1 — Manual stage navigation and safe continuity

Status: implemented in isolated branch, CI/deploy to be verified.  
Scope: Home Hero only; no external services, no migrations, no deletions.  
Base version: V5 commit `6884ede6acedbfe4cc45fa9178aef6919f23a9b8`.

## Behaviour

- The approved four-stage narrative stays intact: **Data → Neural Architecture → Code → AI Hamnet**.
- A compact, keyboard-operable control on the right side lets visitors select any stage. Every control declares `aria-pressed`.
- Selecting a scene intentionally pauses the automatic timer, so it cannot replace the manually selected scene. **Play** resumes it.
- With `prefers-reduced-motion: reduce`, the entire showcase is static by default, but visitors can still open each scene manually.
- On phones and tablets the controls have their own vertical band, avoiding overlaps with the graph/code/Hamnet scenes.
- Home Hero retains exactly four role tags as specified in the original V2 brief; Quantum Computing is preserved in the skills area.

## Preserved components and assets

- `public/assets/home/hero/lcr-data-network-background.svg`
- `public/assets/home/hero/ai-hamnet-enterprise-v2.svg`
- `public/assets/home/hero/ai-hamnet-robot.svg` (historical original)
- Existing React/SVG scenes, dark/light palettes, and CSS-only motion
- Existing GitHub Pages workflow and Supabase integration, without changed credentials

No new asset was generated: the previously validated V5 SVGs already represent the desired continuous background and assistant. No files were renamed, converted or deleted.

## Validation evidence required

1. `npm run build`: TypeScript and Vite build.
2. `node tests/hero-v5-smoke.mjs`: mobile, desktop, themes, four-stage cycle, manual selection, keyboard and reduced motion.
3. `node tests/ai-positioning-smoke.mjs`: existing hero/content regression.
4. Verify V5.1 PR CI and Pages deployment on the merged `main` commit.
5. Preserve unrelated PRs; assess their purpose and mergeability independently.

Reference: LCR_ASSET_ORGANIZATION_STANDARD in the connected Drive, consulted 2026-11-23. Source of truth remains Git.
