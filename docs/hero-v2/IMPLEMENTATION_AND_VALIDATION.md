# LCR Hero V2 — Interactive AI Engineering Workspace

**Status:** Implementation and review record  
**Scope:** Home Hero only, November 2026  
**Method:** LCR Workflow — maintainability, evidence, reversible commits, accessible performance  
**Source prompt:** `LCR DEVELOPMENT — BUILDER / HERO V2`.

## Visual direction

**Visual subject:** engineering intelligence, not decorative abstract AI. The first view is the real *query → router → structured/statistical/semantic retrieval → LLM → response* flow documented in AnimeFinder; the second reveals the software interface that could implement those stages.

**Palette:** existing LCR white (#ffffff) and primary tech blue; instrument surface #f5f9ff, stage #0b1a32, data highlight #48d7f1, evidence green #65d6b1. Dark-mode instrumentation inherits current page tokens.

**Typography:** existing LCR site font and weights for the copy; monospace is reserved exclusively for conceptual code and technical state. No new web fonts, tokens or dependencies.

**Layout:** 52% copy / 48% interactive panel on desktop; one-column responsive sequence on tablet and mobile: name, animated heading, subtitle, short description, interactive visualization, existing actions, four priority skills.

**Principle:** one visually dominant idea (information flowing into built software), two self-contained scenes, one intentional crossfade with slight spatial continuity. Never re-create a commercial code editor or dashboard.

## Design skills consulted (project-local)

- `.agents/skills/frontend-design/SKILL.md`: grounded subject, deliberate typographic hierarchy, single orchestrated motion, content-specific architecture.
- `.agents/skills/ui-ux-pro-max/SKILL.md` and `references/quick-reference.md`: legible contrast, focus/touch targets, responsive grid, capped motion, reduced-motion and performance.
- `.agents/skills/impeccable/SKILL.md` and `reference/{new-work,craft-floor,polish,bolder,distill}.md`: continuity with existing LCR visual identity, visual contrast balanced against restraint, no redundant hero text, state/refinement checks.
- `.agents/skills/web-design-guidelines/SKILL.md` and `references/command.md`: native button controls, readable text, semantics, focus, motion, no horizontal overflow.
- **Security:** did not run the Impeccable launcher (it may download an executable). No skill files were changed or reinstalled.

## Data provenance and content precedence

The one display sentence is a constant in `src/config/portfolioPositioning.ts` and is deliberately independent from existing `home.description` in Supabase. This means an older cached or remotely hydrated paragraph cannot overwrite the one-line Hero; all existing About, project and CMS data remain intact. Title and subtitle retain the existing portfolio positioning constants and the original `HeroTypeTitle` component. Exactly four strings are exported as the priority Hero tags, with remaining competencies preserved in the existing Capabilities section.

The graph follows `AnimeFinder/docs/hamlet-self-knowledge-v1-architecture.md` for **classification → structured/statistical/semantic retrieval → evidence → Gemini reasoning → answer**. Graph/Workspace text is **a conceptual illustration**, not a real execution monitor or a user-specific session. No API calls, tokens, personal catalog records, backend connections or generated images are used.

## Component responsibilities

```text
src/components/hero/
  InteractiveAiVisual.tsx     // scene switching, visibility, reduced motion, user controls
  AiSystemsGraph.tsx          // static SVG shape/paths and CSS-based flow
  EngineeringWorkspace.tsx    // conceptual editor + orchestration, retrieval and results
  hero-visual.css             // scoped design and adaptive layout (loaded last)
```

All SVG shapes are generated inside the React component because the paths/nodes are animated and theme-aware; there is no standalone, reusable raster asset to duplicate under `public/assets`. No existing images or assets were touched.

## Animation/interaction lifecycle

- Default state `graph`; the original typing animation finishes independently.
- Automatically alternate `graph → workspace → graph` every **7 seconds**, with a coordinated **980ms** scene transition.
- Manual selection pauses the automatic cycle until the explicitly labeled Play control resumes it. Pause control remains available during auto cycling.
- Suspend timer/particles on hover, focus within controls, offscreen viewport, hidden document or reduced-motion preference. Cleanup uses effect timer cleanup, IntersectionObserver disconnect, matchMedia listener removal and visibility listener removal.
- A single `setTimeout` controls the 7-second state; motion frames use CSS/inline SVG only, never `requestAnimationFrame`, WebGL, canvas or third-party animation packages.
- Under `prefers-reduced-motion: reduce`, autoplay and particles are disabled and both scenes remain manually accessible without transitions.

## Performance and fallback

- No new npm dependencies; no network calls or images in Hero.
- Constant stage height by breakpoint limits layout shifts.
- CSS opacity/transform scene changes; one timer and one observer per mounted Hero only.
- React independent stage: the heading, subtitle and existing action buttons render even if motion is unsupported; the graph scene displays as a static SVG.
- Original routes, project ordering, galleries, About/Experience/Contact, authentication, database schema and existing page sections are untouched.

## Verification gates

CI `.github/workflows/hero-v2-ci.yml`:
1. `npm ci && npm run build` (`tsc -b`).
2. No new external animation dependencies, raster media or per-frame JS; size budget.
3. `tests/hero-v2-smoke.mjs`: desktop, notebook, tablet, mobile, light/dark, title typing, subtitle, no overflow, 7s cycle, manual selection, keyboard, reduced motion, controlled stage height, existing CTAs and console errors.
4. Updated `tests/ai-positioning-smoke.mjs`: only four Hero tags (existing full skills inventory preserved) and otherwise existing case studies, SEO and catalog order.
5. Existing portfolio CI workflows still cover reusable carousels, gallery, About and project cards.

No merge until all required CI checks show green. A prior user message explicitly authorizes a merge after passing CI.
