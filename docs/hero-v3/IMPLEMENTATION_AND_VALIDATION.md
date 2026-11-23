# LCR Hero V3 — Living Systems Graph

Date: 2026-11-22 · Scope: Home Hero only · Branch: `feat/hero-v3-living-graph-20261122`

## Problem addressed
The previous Hero showed a conventional boxed dashboard with two toggled modes. The requested replacement makes the **large connected network itself** the primary visual language of AI Engineering, Software Development and Systems Architecture, with convergence into a **small, secondary engineering trace**.

## Approved decisions and invariants
- Existing typed H1 `AI Engineering & Software Development`, subtitle, short description, navigation, projects and CMS remain intact.
- Buttons and skills now precede the graph in the source order, not merely by CSS; on mobile the graphical composition follows them.
- Restore **Quantum Computing** as fifth tag. Other abilities in Capabilities remain untouched.
- Remove the large boxed editor and tabs from the Hero. A subtle, translucent, noninteractive engineering trace appears near convergence on desktop.
- Light theme uses white background with blue/cyan strands; dark theme is navy/near-black with brighter luminous network. No separate raster image or externally loaded asset is required.
- Wide composition spans the **whole Hero** in desktop/landscape and uses a dedicated **mobile SVG** with fewer, larger nodes. Neither is a rescaled screenshot.
- Interactive parallax uses event-triggered, coalesced `requestAnimationFrame` on pointer movement **only**; there is no RAF animation loop, continuous JS simulation or mouse-tracking React rerender.
- CSS owns the 16-second scatter → flow → convergence → technical outcome sequence. An accessible 44px Pause/Play button is available. Offscreen, hidden tab, explicit pause and `prefers-reduced-motion` suspend animation.
- Reduced motion shows the meaningful **static** SVG graph and hides the transition/terminal.
- All visual assets are inline SVG geometry created by `AiSystemsGraph.tsx`. Their purpose is animated DOM geometry, so generating separate static SVG and PNG copies would create unnecessary duplication. No existing assets were altered or deleted.

## Architecture
```text
Home.tsx
  Hero V3 content (H1, subtitle, description, CTAs, five tags)
  InteractiveAiVisual.tsx        # pointer/visibility/reduced-motion state
    HeroGraphDesktop             # 66 scattered vertices, convergent streams
    HeroGraphMobile              # unique 15-node compact diagram
    EngineeringWorkspace.tsx     # intentionally small engineering trace
  hero-visual.css                # responsive themes, transitions, graph depth
```

**Provenance:** Pure deterministic SVG network, an original illustration of the documented retrieval/reasoning workflow, not an actual live operational graph. No private data, Supabase connection, customer metrics, language-model call or personal data is displayed.

## Design skill application
- `frontend-design`: subject-specific artwork instead of generic dashboard card; visual-first opening.
- `ui-ux-pro-max`: optimized SVG, stable dimensions, separated mobile design, theme tokens, reduced motion, 44px control.
- `impeccable` (reference only, no native executable): visual hierarchy, restrained technical detail, network convergence as central concept.
- `web-design-guidelines`: accessibility semantics, focus visibility, pausable long decorative motion, responsive overflow, contrast.
- The third-party Impeccable launcher is not run or installed globally.

## Verification
CI uses TypeScript/Vite build, source-size budget, desktop/tablet/mobile browser screenshots, full animation cycle, theme switch, pause/resume, pointer response, reduced-motion static fallback, no horizontal overflow and existing portfolio/card/case/carousel regression tests.

After a green PR and merge, verify the GitHub Pages deployment and the live Home route. Performance is approached with no new runtime libraries, no raster media, no network calls, a single input-driven RAF and offscreen suspension, not merely with an aesthetic claim about speed.

## Rollback
Revert the single merge commit. Original Hero V2 remains available in the Git history and the legacy test entrypoint delegates to the current V3 test. No storage, database, asset deletions or migrations occurred.
