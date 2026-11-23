# LCR Portfolio Hero V9 — Mobile Typography and Hamlet AI

**Date:** 2026-11-23 · Scope: Hero only.

## Requested changes and applied solution

1. **Mobile Hero gutters:** apply a 7% left/right inset to the text-and-actions container only at widths up to 600px; no modifications to other sections or the full-width animation. The viewport-based test asserts a 5–10% gutter on both edges.\n2. **Mobile title:** The exact professional title `AI Engineering & Software Development` must occupy **two visible lines** at 320–600px, including during typewriter animation. Its mobile font size is lowered with a `clamp(1.375rem, 6.7vw, 2.6rem)`; the HTML title, semantic accessibility label and typing behavior are preserved. No desktop font size is modified.
3. **Spacing:** The mobile Hero visualization is separated from the end of the specialization tags by **60 CSS pixels**, more than the existing 44px button-height benchmark. The four-stage visual and selector remain part of the same continuous Hero section.
4. **Name:** The fourth scene's visible tab (PT/EN), robot label, illustrative chat header, greeting and stage caption display **Hamlet AI**. The older technical identifiers (`hamnet` phase key, CSS class names, test IDs and vector asset paths) are intentionally retained as stable implementation details; renaming assets without migration is out of scope.

5. **Hero tags:** remove **Python & Software Engineering** from the shared `PORTFOLIO_HERO_TAGS` for mobile and desktop; preserve the other four. Desktop tags now use a balanced 2×2 grid, mobile tags wrap responsively. The separate full skills inventory in Capabilities stays untouched.\n\n## Preserved assets and behavior

- `public/assets/home/hero/lcr-hero-blue-code-v7-lite.svg`: dark theme static source, untouched.
- `public/assets/home/hero/lcr-hero-blue-code-v8-light-navy.svg`: light theme static source, untouched.
- `public/assets/home/hero/ai-hamnet-enterprise-v2.svg`: robot original preserved; no image rewrite or removal.
- Four scenes, desktop layout, four tags (including Quantum Computing), pause/play, dark/light toggles and reduced-motion behavior: unchanged.
- No new dependencies, resources or animation loops.

## Validation gate

CI runs the existing Hero V8 smoke and professional-positioning regression, then `tests/hero-mobile-v9-layout-smoke.mjs` at **320, 360, 390, 430, 600, 768, 1280 and 1440px** (390px in both reduced and normal motion). The test measures actual title line count (reserved and visibly typed), at least 44px separation between chips and animation, four approved tags, 5–10% mobile gutters, horizontal overflow, stage-selector touchability, and the literal `Hamlet AI` on desktop/mobile in PT/EN. GitHub Actions retains screenshots and JSON evidence.

Merge only with passing branch/PR CI and verify GitHub Pages deploy on the squash-merge SHA. Reverting the PR restores V8 without deleting any assets.
