# LCR Portfolio — Hero V6: animated blue-code SVG background

**Status:** implementation on isolated PR branch; final CI/deploy evidence must be checked before closure.  
**Scope:** only Home Hero background. The four V5/V5.1 foreground scenes, tabs, subtitles, and CTAs are retained.  
**Date:** 2026-11-23.

## Design decision

The reference approved by the user is the **real animated SVG** created and previewed separately in ChatGPT, not a regenerated PNG/GIF or a screenshot of the panel. It is applied as a permanently visible *background* behind:

1. Data input.
2. Neural architecture.
3. Software generation.
4. AI Hamnet.

The original SVG source is stored at `public/assets/home/hero/lcr-hero-blue-code-v1.svg`. It has a transparent canvas, a 1440 × 800 viewBox, over 3,000 vector glyphs, blue/cyan light and network trajectories, and CSS/SMIL motion. A responsive CSS layout controls presentation without modifying the asset.

**No external APIs, raster video, AI inference, remote fonts, or additional frontend dependencies** are introduced. The SVG uses internal `prefers-reduced-motion` rules. External `img` loading keeps its glyph tree out of React rendering.

## Asset inventory (LCR Workflow)

| asset_id | Role / type | Git path | Origin | State |
|---|---|---|---|---|
| home-hero-blue-code-v1 | Approved animated SVG, canonical Hero background | `public/assets/home/hero/lcr-hero-blue-code-v1.svg` | Original vector preview from this ChatGPT work | New; deployed after CI |
| home-hero-data-fabric-v1 | Previous perspective architecture SVG, recoverable fallback | `public/assets/home/hero/lcr-data-network-background.svg` | Earlier V5 Builder original | Preserved, fallback on image load failure |
| home-hero-hamnet-enterprise-v2 | Foreground assistant SVG | `public/assets/home/hero/ai-hamnet-enterprise-v2.svg` | Earlier V5 Builder original | Preserved |
| home-hero-hamnet-v1 | Earlier assistant SVG | `public/assets/home/hero/ai-hamnet-robot.svg` | Earlier V4 Builder original | Preserved, historic |

### Technical rendering

- `HeroBackgroundGraph.tsx` mounts the V6 SVG **one time** beneath all four Hero phases.
- `hero-visual.css` uses the same full-bleed background canvas with theme-specific opacity and mobile-safe cropping.
- `InteractiveAiVisual.tsx`, `AiSystemsGraph.tsx`, and `EngineeringWorkspace.tsx` retain their current behavior.
- The old V5 floating binary packet elements are no longer mounted; code texture belongs to the approved SVG.
- A load error falls back to the versioned, original static V5 background.
- The existing foreground control, keyboard input, reduced-motion behavior, and scene timer are unchanged.

### Performance and safety

- Source file: approximately **335 KiB** uncompressed.
- Gzip transfer budget: **under 65 KiB**, checked in CI.
- No `script`, `foreignObject`, external image, or remote dependency in the vector.
- Do not inline the multi-thousand-node SVG as React JSX; keep it as a static asset.
- Preserve the SVG source as an editable vector original; no redundant PNG/WebP derivative is necessary for ordinary background rendering.

## Verification checklist

- TypeScript/Vite production build succeeds.
- `tests/hero-v5-smoke.mjs` checks that the **approved V6 SVG** loads (not the fallback), stays behind all scenes, responds to themes, has no horizontal overflow, and preserves desktop, notebook, tablet, and mobile variants.
- Existing `tests/ai-positioning-smoke.mjs` and the other PR regressions are green.
- CI validates the SVG budget, integrity, and avoidance of remote or active content.
- Merge only after PR CI passes; confirm the Pages workflow on the resulting `main` SHA and provide the live link.

## Governance

No deletion, asset rename, Supabase migration, service change, or alteration to the rest of the site is authorized here. To roll back, revert the PR merge; the V5 SVG is still available in Git.

This applies the principles in the connected Drive reference `LCR_ASSET_ORGANIZATION_STANDARD` previously consulted in this conversation: function-oriented asset path, provenance, preservation of originals, tests, and reversible changes.
