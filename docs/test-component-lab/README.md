# LCR Test Component Lab — V1

**Status:** Public developer preview, bundled into the LCR Portfolio repository.  
**First component:** Particle Wave — Animated Particle System.  
**Method:** LCR Workflow; preserve existing components and document changes before using them in production.

## Access

- Published (after approved merge and Pages deployment): https://leonardocamargorossato.github.io/LCR-SolutionsArchitecture-IA-Quantum/#/test-component-lab
- Local: `npm ci && npm run dev`, then open `http://localhost:5173/LCR-SolutionsArchitecture-IA-Quantum/#/test-component-lab` (use the actual port shown by Vite).
- Public portfolio: `#/ ` (without the space); the laboratory has a dedicated **Return to Portfolio** link and is intentionally **not** added to the main menu.
- The page is public. Do not add credentials, sensitive customer content, private assets or internal production components.

## Architecture

```text
src/
  RootRouteGate.tsx                         # lazy route switch, no CMS/Auth in Lab
  PortfolioExperience.tsx                   # site-only providers, lazy
  pages/TestComponentLab.tsx                # standalone Lab shell, presets and actions
  components/test-component-lab/
    particle-wave/
      ParticleWave.tsx                      # independent Canvas 2D renderer
      particle-wave-types.ts               # typed settings, limits and presets
      particle-wave.css                    # renderer fallback/style only
  features/test-component-lab/
    config/component-registry.ts            # component ID/name/category/React/defaults
    components/LabControls.tsx              # parameter inputs
    components/LabPreview.tsx               # preview and execution controls
    styles/test-component-lab.css           # scoped professional Lab UI
tests/test-component-lab-smoke.mjs          # Playwright desktop/tablet/mobile
.github/workflows/test-component-lab-ci.yml
docs/test-component-lab/COMPONENT_INVENTORY.md
```

**Why Canvas 2D rather than WebGL?** The first experiment needs thousands of independent particles, but not physically modeled geometry or new dependencies. An efficient bounded Canvas 2D loop, based on real sinusoidal wave functions and depth projection, is simpler to audit on lower-powered laptops. Three.js/WebGL can be evaluated later if measured performance requires it; **no WebGL context is currently created**. Therefore WebGL context-loss handlers are not applicable in this version.

The renderer stays outside React's render loop. Input changes update the component's typed props; frames use requestAnimationFrame and direct Canvas drawing without React state updates. The renderer uses a maximum of 4,200 particles on desktop and 1,700 on mobile, a device-pixel-ratio cap, adaptive FPS target, reduced-motion handling, tab visibility, offscreen IntersectionObserver, ResizeObserver and complete cleanup on unmount. A static explanation is rendered if Canvas 2D is unavailable.

## Usage

1. Open the direct Lab hash route.
2. Select **Particle Wave** in the Component field (the only registered V1 component).
3. Pick **Codarox Inspired**, **LCR Light** or **LCR Dark** as the starting configuration.
4. Adjust Particle Count, Wave Amplitude, Wave Frequency, Animation Speed, Particle Size, Depth, Particle Color, Background and Mouse Interaction. Particle Count updates are debounced by 170 ms.
5. Use **Play / Pause**, **Reset** (to the selected preset), **Copy Configuration** (JSON clipboard), or toggle **Claro / Escuro / Transparência**.
6. On mobile, the Controls panel moves below the preview and collapses through its heading.

The copy action reports success only after the browser clipboard API confirms the write; if permission is denied, it provides a recovery message.

## Extending V1

Implement a new reusable component with its own typed props and no Lab-specific imports, then register a matching `Component`, `id`, `name`, `description`, `category`, and `defaultSettings` in `component-registry.ts`. As the Lab evolves, registry entries can adopt independent parameter schemas; V1 intentionally does not build an oversized library framework.

ParticleWave can be reused in another React view by importing it from `src/components/test-component-lab/particle-wave/ParticleWave` and passing `settings` plus `running`. **Do not integrate it into the Home/Hero in this phase.**

## Testing and caching

GitHub Actions runs `npm ci && npm run build`, static route/scope/performance checks, then Playwright desktop 1440 px, tablet 820 px and mobile 390 px with reduced motion. Tests exercise presets, all parameter groups, Light/Dark/Transparency, pause, reset, copy JSON, mobile cap, collapsed controls, reload of the same hash route and no Supabase requests. A Home navigation regression checks that existing Header and Hero are unaffected.

The Lab has **no app-specific persistent cache**, authentication or remote API. Vite generates hashed asset filenames for the page's lazy JavaScript/CSS chunks, so normal new deployments invalidate changed chunks. GitHub Pages may still cache the HTML entrypoint: force-refresh in browser (`Ctrl + Shift + R`) if a prior version persists. The route survives hard refresh because of HashRouter.

## Reference and provenance

Inspiration, **not source code**: [Animated Particle Wave Hero Background — CodePen](https://codepen.io/kasunshana/pen/MYaGNPO). The original reference uses Three.js/GSAP with many particles. The LCR implementation is newly written, uses its own wave equations and design, and embeds no third-party script. Existing pinned design skills in `.agents/skills` were reviewed read-only; no installer or native binary was executed.

CI evidence and the PR are the source of truth for actual test status. Keep both docs and component inventory updated after future additions.
