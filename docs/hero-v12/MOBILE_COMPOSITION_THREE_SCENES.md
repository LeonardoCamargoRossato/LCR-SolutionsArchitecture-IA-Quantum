# LCR Portfolio — Hero V12 | Compact mobile layout and three-scene story

**2026-11-23** · React / TypeScript / GitHub Pages · Frontend-only hotfix.

## Request and verified implementation

1. **Mobile specialty chips (≤900px):** four chips on a single line, grouped from the left; `justify-content: flex-start` replaces the V11 `space-between` that spread them across the width. Controlled 3–8px gaps and padding on both sides improve readability. Fluid font ≈8.8px at 320px and ≈10px at 390px, growing up to 11.75px on tablets; full labels remain accessible and visible on desktop.
2. **More separation between chips and art:** an approximately 30–38px scene margin replaces the previous 22–25px without increasing image/asset weight.
3. **Only three interactive stages:** `neural → code → hamnet → neural`. The first frame is **AI Graph / Rede IA** on all motion preferences, with **Code / Código** and **Hamlet AI** as the other two tabs. The Data/Dados tab and the former standalone scatter phase are no longer accessible in the rotation or selector. All three scenes still support direct manual selection; the selected stage pauses autoplay until Play is pressed. Reduced-motion behavior remains static by default.
4. **Compact mobile controls:** selector button target 32px, short 4px vertical padding; Play/Pause visible control 34×34px, positioned to the left of the selector. Keep focus indicators and proper accessible names.
5. **Desktop graphic:** lift the neural composition by extending the existing illustration plane upward (`top:-8%; height:95%` for ≥901px). Preserve its 90% scale introduced in V11, node geometry, interactions and right-side composition.
6. **Preservation:** approved SVG versions V7/V8, older originals, original Hamlet vector, color tokens, language picker, EN/dark defaults, gallery assets and CMS records unchanged.

## Sources and code changes

- `src/components/hero/InteractiveAiVisual.tsx`: three-scene state machine and first-frame neural graph.
- `src/components/hero/hero-responsive-v12.css`: scoped responsive layout, imported *after* V11.
- `src/main.tsx`: stylesheet registration.
- `tests/hero-v5-smoke.mjs`, `tests/hero-mobile-v9-layout-smoke.mjs`, `tests/hero-v10-header-smoke.mjs`, `tests/hero-v11-responsive-i18n-smoke.mjs`: keep prior themes, preferences, animation, 3D panels, accessibility and locale regressions while updating stage indices.
- `tests/hero-v12-composition-smoke.mjs`: real Chromium geometry assertions, screenshots/JSON at 320–1440px and EN/PT.
- `.github/workflows/hero-v2-ci.yml`: run V12 smoke alongside V5–V11 and product positioning smoke before merge.

**Provenance:** the V4 scatter SVG source and old CSS history remain in Git for audit/rollback; only the independent Data stage is retired from active UI. No destructive data or asset deletion.

## Acceptance checklist

- [ ] TypeScript production build
- [ ] Hero budget and original SVG transparency/performance safety
- [ ] V5 animation, keyboard/drag, theme and Hamlet replay
- [ ] V9 heading/gutters/mobile scene clearance
- [ ] V10 flag picker and saved theme/language defaults
- [ ] V11 bilingual public pages, SEO, About, Workflow and 3D scenes
- [ ] V12 mobile layout at 320, 360, 390, 430, 600, 768, 900px and desktop at 1024/1440px; EN/PT
- [ ] Existing project, carousel and gallery CI
- [ ] Exact PR head CI green → squash merge → Pages deploy success → post-deploy published smoke green

**Rollback:** revert the V12 squash commit, which removes the V12 scoped stylesheet and restores the previous phase controller/tests. No CMS, Supabase, SVG or PNG/WebP storage changes.
