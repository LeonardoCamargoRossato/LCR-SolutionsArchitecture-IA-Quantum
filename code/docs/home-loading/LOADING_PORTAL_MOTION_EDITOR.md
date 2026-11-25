# Loading Portal V2 — Motion Editor

In Test Component Lab, select Loading Portal. The default is the editable entrance door; V1 history and V2 readiness preview remain accessible.

The editor reuses the seven approved WebP references and transparent mechanical sprites, the canonical geometry and the existing SVG paths. It only changes the preview, never Home boot. Opening and closing are reversible; explicit controls can interrupt motion and scrub the position. The full cycle simulates loading, activates, opens, holds and closes; optional repetition. Reduced motion skips mechanical travel. The original background is rendered only at exact closure; all moving leaves are the original layers. The core is a child of the left leaf. No screenshot, frame sequence, remote dependency or imported code execution.

Default parameters: opening 1800 ms, closing 1800 ms, illumination 72%, speed 1x, activation 450 ms, simulated load 5000 ms, open hold 900 ms. The configuration export records all editable values and the selected variant. The real readiness contract stays in the existing V2 preview and Home boot coordinator. The new editor does not authorize production opening.

Sources: PortalMotionEditor.tsx, PortalMotionPreview.tsx, portal-motion-settings.ts and portal-motion-editor.css. Shared source and WebP assets remain under src/components/loading-portal/v2 and public/assets/home/loading-portal. No originals removed.
