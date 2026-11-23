# Hero V5 — Data Fabric, 2.5D Perspective and Enterprise AI Hamnet

Status: pending CI verification  
Scope: portfolio Home Hero only, 2026-11-23  
Workflow: LCR — source control, preservation, test evidence, reversible deployment

## Intent

Make the **whole right-hand side** one continuous engineered system, including the regions above/below the foreground scene. A persistent perspective data network travels visually from **right to left**, and binary packet labels (`01`, `1010`, `0011`) flow over its tracks. The active story remains:
1. Data input: reduce random crisscross connections, show routed binary traffic.
2. Deep learning: preserve the successful fully connected 2.5D network, hover/drag and keyboard arrows.
3. Generated code: preserve the clear TypeScript concept with an improved angled perspective.
4. AI Hamnet: replace the juvenile rounded-face robot with a faceted enterprise assistant and show **Hello, Hamnet. → Hello! + professional message**. The robot button replays the transcript and responds to pointer tilt.

Every scene is a **simulation**, not a real running neural model, model response or chat service. No Supabase/LLM or private user data is requested or processed.

## Changes and performance budget

- Static architectural background is a source SVG (~4–5 KB), loaded from the canonical Home/Hero asset directory and visible in *every* phase.
- Twelve binary labels move with CSS transform/opacity, not hundreds of independently animated edges.
- Existing neural model remains CSS + SVG; code and AI message transitions are CSS-only.
- The bot SVG is original, local, ~3 KB, no raster counterpart needed for a vector icon.
- Existing Robot V4 asset is **preserved** as a recoverable original.
- No new dependencies, no video, no WebGL, no background interval, no external network requests.
- One phase timer already exists; visibility observer and reduced-motion support are preserved. The demo replay uses a local React counter.
- Mobile remains dedicated with fewer packets and simplified perspective; any movement is disabled by `prefers-reduced-motion`.

## Published asset inventory (LCR_ASSET_ORGANIZATION_STANDARD)

| asset_id | Description | Path in Git | Source / author | Format | Status | Used by |
|---|---|---|---|---|---|---|
| home-hero-data-fabric-v1 | Technical network perspective, vanishing to left | `public/assets/home/hero/lcr-data-network-background.svg` | Original procedural SVG, Builder | SVG vector | New; pending CI | `HeroBackgroundGraph.tsx` |
| home-hero-hamnet-enterprise-v2 | Enterprise AI assistant avatar, layered vector | `public/assets/home/hero/ai-hamnet-enterprise-v2.svg` | Original authored SVG, Builder | SVG vector | New; pending CI | `EngineeringWorkspace.tsx` |
| home-hero-hamnet-v1 | Preserved previous bot, for restoration | `public/assets/home/hero/ai-hamnet-robot.svg` | Earlier Builder asset | SVG vector | Preserved; not newly published in V5 scenes | Git history / legacy asset |

All three are public-owned website assets, no licensed third-party image, raw private original, derived PNG/WebP or Drive replica. They are authored as vectors; no lossy conversion or duplicated format is appropriate. Asset names follow kebab-case. No destructive migration or deletion.

*Documentation grounding:* the connected Drive file **LCR_ASSET_ORGANIZATION_STANDARD — Organização Humanizada e Migração de Assets**, 2026-11-16, was consulted. It calls for product/function-based folders, a clear inventory, originals preservation and controlled migration.

## Original files and rollback

Keep the prior V4 SVG, old component history and standard filenames. The update does not change databases, credentials, user records, the rest of the site or external resources. Revert the merge commit to restore V4. Do not delete V4 assets as part of this change.

## Four locally installed design skills applied

- `frontend-design`: engineering/data as the actual visual subject, continuous composition, not stock graphics.
- `ui-ux-pro-max`: touch/keyboard targets, responsive split, coherent themes, animation and page budgets.
- `impeccable`: visual review and restrained enterprise treatment. No unreviewed launcher is executed.
- `web-design-guidelines`: semantic buttons, visible focus, reduced motion, text clipping and accessible decorative background.

## Quality gates

1. TypeScript + Vite production build.
2. `tests/hero-v5-smoke.mjs`: SVG loaded at all viewports, packet layer present, full scene cycle, robot real click/replay, both themes, keyboard and mouse network rotation, mobile, no horizontal overflow, source asset safety.
3. Existing regression tests for About, project cards, galleries, site navigation and SEO.
4. PR green CI required before squash merge. Then verify `main` SHA and the GitHub Pages deployment status.
