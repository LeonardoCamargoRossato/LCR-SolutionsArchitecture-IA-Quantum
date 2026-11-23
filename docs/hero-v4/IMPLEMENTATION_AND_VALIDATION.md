# ADR — LCR Hero V4: From Data to AI Hamnet

Status: implementation under CI validation · 22 November 2026  
Scope: **Home Hero only** · `feat/hero-v4-neural-hamnet-20261122`

## User-approved story

**Dispersed data → fully connected neural layers (2.5D) → generated code → AI Hamnet greeting.**

- Scattered data: distributed nodes and low-opacity links on the Hero background, replacing the former hexagonal/atomic nucleus.
- Neural network: four layers with explicit full adjacency between successive layers. Desktop and mobile use **different layouts and counts**. CSS gives slow depth and orientation movement.
- While the neural scene is active, a desktop mouse can grab and rotate the layers within constrained pitch/yaw; arrow keys provide equivalent keyboard exploration. Drag suspends automatic progression. This is **2.5D CSS perspective**, not WebGL or a heavy true-3D engine.
- Code: coherent concept TypeScript route turning data/context into reasoning and responses. It is displayed, never executed or copied into the user's application.
- AI Hamnet: original robot vector and simulated greeting (“Hello!” with an explanatory message). This **does not start a real chat or call a model**.
- Cycle uses one cleanup-safe timer per phase (3.3 s → 7.9 s → 5.6 s → 6.6 s); interactions use a single coalesced `requestAnimationFrame` only when movement occurs. No continuous JS animation engine.
- Preserve the current typed title, subtitle, description, navigation, 3+2 Hero specialization tags, links, About and all case studies.
- Light uses white/blue. Dark uses navy/cyan. Mobile renders fewer, bigger nodes and a simplified composition.
- Accessible pause/resume and `prefers-reduced-motion` static neural fallback; offscreen and hidden-document motion suspend automatically. An invisible accessible description is clipped visually, fixing the text leak seen in the screenshot.

## LCR architecture and assets

```text
src/components/hero/
  AiSystemsGraph.tsx        # original scatter and fully connected SVG neural scenes
  EngineeringWorkspace.tsx  # generated-code scene and simulated AI Hamnet message
  InteractiveAiVisual.tsx   # state, one timer, drag/keyboard, pause, visibility
  hero-visual.css           # scoped visual design, desktop/mobile, themes, motion
public/assets/home/hero/
  ai-hamnet-robot.svg       # original standalone vector, never duplicated as a raster
tests/hero-v4-smoke.mjs    # browser and static verification
```

**Design skill review:** frontend-design for specific visual metaphor and hierarchy; ui-ux-pro-max for responsive and performance checks; impeccable reference materials for critique/polish (native launcher not executed); web-design-guidelines for focus, semantics, reduced motion and contrast.

**No dependency, database, storage migration, user data or external request** is introduced. Existing Hero source is tracked in Git for rollback. The vector asset lives only under the Home/Hero functional folder per LCR asset organization rules.

## Validation and release

- `npm ci && npm run build`
- `node tests/hero-v4-smoke.mjs`: desktop 1440 light with full cycle and bot asset; 1024 dark with drag and keyboard; tablet 768; mobile 390 and 360 with reduced-motion, plus light/dark toggles and zero horizontal overflow.
- Existing regression suites for About, galleries, carousels, project routing and positioning.
- Merge only after green CI; verify GitHub Pages deploy and provide live link.

## Accessibility and performance notes

- The graph is decorative SVG and has a separate clipped explanation available to screen readers. The exploration target has a keyboard-accessible role, a clear label and visible focus.
- No new packages, remote scripts or runtime AI.
- CSS transforms/opacity drive depth; the pointer handler coalesces repeated moves rather than re-rendering React.
- The bot asset is a small vector in the canonical Home/Hero folder.
