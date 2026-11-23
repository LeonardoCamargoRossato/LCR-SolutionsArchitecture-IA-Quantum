# LCR Test Component Lab — Component Inventory

Updated: 2026-11-23. This is a human-readable inventory for LCR Workflow governance. See V2_ASSET_INVENTORY.md for imported backgrounds, components, JSON/PNG/ZIP.

| ID | Component | Type | Category | Location | Default preset | State |
| --- | --- | --- | --- | --- | --- | --- |
| `particle-wave` | Particle Wave | React/TypeScript + Canvas 2D | Motion / Generative | `src/components/test-component-lab/particle-wave/ParticleWave.tsx` | `lcr-dark` | V1 renderer preserved; V2 editor integration in PR #27 (tests tracked separately) |

## Preset registry

| Preset ID | Visual definition | Target background | Intention |
| --- | --- | --- | --- |
| `codarox` | Neutral-gray floating particles | White | Study organic topology and wave form |
| `lcr-light` | Dark-blue particles | Near white | LCR light contrast |
| `lcr-dark` | Cyan-blue particles | Dark navy | LCR dark technical aesthetic |

Settings: `particleCount`, `amplitude`, `frequency`, `speed`, `size`, `depth`, `color`, `background`, `mouseInteraction`. Input bounds and presets live in `particle-wave-types.ts` as canonical configuration.

### Dependencies and resource inventory

- Runtime libraries added: **none**. Uses existing React 19, React Router 7 and Lucide icons for controls.
- Remote assets/APIs: **none**. Canvas is generated locally on the client, not image/GIF/video material.
- Supabase/Auth: **none**, route-split from portfolio providers.
- WebGL context: **not created**; Canvas 2D selected for simpler lightweight rendering.
- Sensitive content: **none**; public route with standalone developer-only tools.
- Original CodePen code: **not copied**; inspiration link documented.
- Existing portfolio components and Home Hero: **unchanged**; no deletion or content move.
- Screenshot test artifacts: GitHub Actions `lcr-test-component-lab-v1-evidence`; snapshots are generated during browser CI and not committed as synthetic reference media.

### Lifecycle and safe limits

- Maximum active count: 4,200 desktop / 1,700 mobile; interval throttled to 24–36 target FPS.
- Pixel ratio: capped at 1.5 desktop / 1.25 mobile.
- requestAnimationFrame canceled and observers/listeners detached on remount/unmount.
- Pauses automatically when tab hidden, off-screen, user selects Pause or user prefers reduced motion.
- Rendered entirely within local Lab view, which is loaded dynamically by the hash route.

### Planned candidates — **not implemented**

AI Systems Graph, Engineering Workspace, Animated Background and Interactive Architecture Diagram. Implement these only through future individually reviewed changes with component contracts, tests and updated inventory.

### Audit gates

- Production `tsc -b && vite build`.
- Route split and exclusion from Home initial bundle.
- Playwright real interaction, responsive viewport, copy/pause/reduced-motion, no-Supabase and Home regression.
- CI and GitHub Pages success on the final merged commit.
- Reversible PR; no destructive migration or deletion.
