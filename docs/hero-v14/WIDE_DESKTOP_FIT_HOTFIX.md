# LCR Workflow — Hero V14: wide-desktop fit and vertical cover

**Date:** 2026-11-23  
**Base:** Hero V13 + Loading Portal Home Boot PR #35 (`48a9584`).  
**Input:** two user-provided screenshots (1920×1047 including browser chrome): visible excessive left gutter and approximately 100px of the blue next section below the initial Hero.

## Diagnosis

The approved Hero uses a `--max-width: 1180px` content shell and `min-height: clamp(590px,56vw,750px)`. On an extra-wide landscape viewport, the 1180px shell leaves disproportionately broad side margins, while the 750px height ceiling is shorter than the usable window after its sticky header. The next section therefore becomes visible on the first screen.

The approved original backdrop SVG already has `object-fit: cover`. Enlarging the section vertically is sufficient to make it cover the available viewport, without scaling individual graphics with expensive JS transforms.

## Scoped implementation

- New `src/components/hero/hero-wide-desktop-v14.css`, loaded after V13.
- Only `min-width:1500px` **and** `min-aspect-ratio:17/10` trigger the wider variant.
- Desktop header and Hero shell change **together**, ensuring the avatar aligns horizontally with the Hero's left copy.
- The width increases continuously from the existing 1180px at exactly 1500px to `min(2000px, 85vw - 95px, 100% - 64px)`; no sudden breakpoint jump.
- Hero min-height becomes `100dvh - 67px` (66px header plus border), but can naturally grow taller when text or zoom demands; unlike a fixed viewport height, content is never chopped off.
- The Hero takes advantage of the wider shell, with its text column capped at 850px; existing SVG `object-fit:cover` fills the new height without adding media requests or modifying asset files.

## Explicitly preserved

- Notebook 1366×768 and standard 1440×900: existing Header, Hero typography, tags, CTA and timing.
- Mobile 390×844: existing V12/V13 left chip alignment, three stages, buttons and layout.
- Loading Portal V1: original 10 approved WebPs, exact object-cover frames, 100% viewport overlay, ready/opening coordination.
- Home particle Canvas and V7/V8 background assets, code stage, Hamlet AI and localization.
- Other pages, project cards, CMS/DB, Supabase/Auth and site build/deploy.
- No edits or deletions of originals; no new image or new JS dependency.

## Quality gates

1. Production build and Hero V5–V13 regressions unchanged.
2. `tests/hero-v14-wide-viewport-smoke.mjs` checks notebook (1366), standard desktop (1440), phone (390), and wide 1536/1640/1920/2560: viewport coverage, header/Hero x alignment, actual computed shell width, zero sideways overflow, complete SVG height, tags/selector and CTA availability, PT/EN, light/dark.
3. Checks that the original Loading Portal still covers an actual 1920×925 viewport before opening and reveals the genuine Home after.
4. Screenshot and JSON evidence uploaded by the PR workflow.
5. Squash merge only after green CI; verify GitHub Pages publication and five public smoke checks. Use `#/?portal=replay` to see both door opening and the new width/cover.

**Rollback:** revert the V14 merge commit. The new CSS is self-contained and imported last; removing its import restores the exact earlier Hero without touching the approved portal or assets.
