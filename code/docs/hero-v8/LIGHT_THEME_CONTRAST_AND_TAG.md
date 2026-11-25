# LCR Portfolio — Hero V8: contrast hotfix for Light theme

Date: 2026-11-23  
Scope: light-theme colors + fifth specialization tag only.  
Original V7 performance remains authoritative.

## Changes

- Added `public/assets/home/hero/lcr-hero-blue-code-v8-light-navy.svg` as a **static, transparent, dark-navy color derivative** of `lcr-hero-blue-code-v7-lite.svg`. Source shape, gradients, code density and perspective remain the same; only palette and visibility of details change.
- `HeroBackgroundGraph` obtains theme via the existing `ThemeProvider` and loads **one image source** per theme: V8 navy SVG in Light; original V7 SVG in Dark. No runtime SVG filter, duplicated asset layer, animation loop, Canvas or network dependency.
- Reduced previous light-theme transparency, darkened only light-theme neural colors and accent trace. **Dark styles and SVG unchanged**.
- Restored fifth tag `Quantum Computing` directly beside `Data & Optimization` on the second tag row on desktop. Skills list already contains Quantum Computing elsewhere.
- Extended existing Hero smoke + V4 compatibility test and CI budgets for both static image variants.

## Asset inventory and safety

| Asset | Path | Status |
| --- | --- | --- |
| V6 original animated blue SVG | `public/assets/home/hero/lcr-hero-blue-code-v1.svg` | Preserved unchanged |
| V7 optimized dark SVG | `public/assets/home/hero/lcr-hero-blue-code-v7-lite.svg` | Preserved unchanged; active on Dark |
| V8 light navy SVG | `public/assets/home/hero/lcr-hero-blue-code-v8-light-navy.svg` | New; active on Light |
| V5 legacy network SVG | `public/assets/home/hero/lcr-data-network-background.svg` | Preserved load-error fallback |

All SVGs are sourced locally within the Home Hero functional folder. The light variant retains 1,676 individual text elements and **zero SVG animations**. CI rejects a per-theme compressed transfer size at or above 28 KiB, motion markup, and unexpected glyph counts.

## Acceptance checklist

1. Light theme: glyphs, data curves and neural connectors visibly darker blue; no pale-on-white washout.
2. Dark theme: identical V7 source SVG, colors and behavior (regression).
3. Theme toggle selects the appropriate SVG and does not load two different visible layers.
4. All five tags present, with `Data & Optimization` and `Quantum Computing` together on desktop.
5. Verify mobile/tablet wrapping and avoid horizontal overflow.
6. CI build, browser smoke, and regression workflows green before merge; Pages deploy green after.

No unrelated project/SQL PR changes or asset deletion. Rollback via squash merge revert preserves originals.
