# LCR Portfolio — Hero V7 Performance Hotfix

Date: 2026-11-23  
Scope: Home Hero background **only**; no design or copy revisions.

## Incident and root cause

The approved V6 blue perspective SVG looked good but was too costly for a low-powered laptop. Its **3,194 source glyphs**, multiplied by `<use>` in long repeated columns, were animated simultaneously in **116 CSS-animated groups** plus **12 SMIL motion elements**. This created frequent rerasterization of a large transparent visual layer. Continuous mousemove-driven parallax and full-layer color filters added unnecessary work.

## Decision

Retain the approved look with a static, transparent and lower-density **derived SVG**, and let the foreground V5/V5.1 four-stage carousel continue to provide meaningful motion. Only one small CSS light trace moves with transform/opacity on desktop; it is paused with the stage and disabled on mobile and for reduced-motion users.

| Asset | Path | Status |
|---|---|---|
| Original approved V6 SVG | `public/assets/home/hero/lcr-hero-blue-code-v1.svg` | **Preserved, unchanged** |
| Lightweight derived V7 SVG | `public/assets/home/hero/lcr-hero-blue-code-v7-lite.svg` | **Active** |
| Previous V5 architectural SVG | `public/assets/home/hero/lcr-data-network-background.svg` | Preserved as load-error fallback |
| Original Hamnet assistant assets | `public/assets/home/hero/ai-hamnet-*.svg` | Preserved |

Original vs optimized derivative:

- Original: 3,194 SVG glyphs, 480 SVG clones, 116 animated rain groups, 12 SMIL path movements.
- Optimized: approximately 1,676 text glyphs, 348 static clones, **0 SVG animations**.
- Approximate source transfer sizes: 335 KiB → 198 KiB; gzip approximately 34 KiB → 23 KiB.

No PNG/WebP derivative, file deletion, rewrite of AI/Hamnet scenes, DB/Supabase modification, or new dependency. No canvas/JS animation loop is introduced.

## Local isolated Chromium comparison

With the original and derived SVG rendered individually as `<img>`, comparing ~129 requestAnimationFrame intervals in the same Chromium setup:

| Metric | V6 animated | V7 static |
|---|---:|---:|
| Mean frame interval | 105.94 ms | 17.05 ms |
| Frames above 25 ms | 129 / 129 | 1 / 129 |

**Caution:** these are isolated browser measurements under a container runtime, not an FPS guarantee for the full GitHub Pages site or any particular device. Real-site CI browser tests and the user's own laptop should be used to confirm the improvement.

## Controls and accessibility

- Existing four scene tabs and mouse/keyboard neural interaction unchanged.
- Background is no longer re-transformed on pointer movement.
- The tiny composited light trace respects `data-playing=false`, `prefers-reduced-motion`, and mobile.
- Light/dark modes and transparent SVG background retained.
- An image load error still falls back to the earlier verified V5 asset.

## Verification gate

- GitHub Actions: npm/Vite build, static SVG safety and gzip/source budgets, no animated SVG nodes.
- Browser: 1440px, 1024px, tablet, reduced-motion mobile, dark/light, all four scenes, Hamnet replay and CTA accessibility.
- Merge only when current commit CI succeeds; verify Pages deploy separately.
- Rollback: revert the squash merge, do not delete the V6 original.

LCR Workflow principles: preserve original and derived asset in the same feature folder; track provenance and test results; avoid destructive migrations.

