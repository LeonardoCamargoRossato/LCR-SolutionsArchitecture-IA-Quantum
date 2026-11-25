# P0 02 — Image demand

Baseline: `63adb1332ad41b55f08281cc7be1a2bb6e2aaf71` (stage 01). PR #51. No asset moves, URL migration, editorial order or new storage policy.

- The shared visibility gate uses positive viewport intersection and clipping ancestors, zero observer margin, hidden/inert checks, and bounded event-driven fallback. Source attributes are not populated before admission. Mounted images retain admitted sources.
- Gallery cards use their existing WebP paths. The original is requested for the active lightbox item or explicit download only; failed preview does not trigger a heavy original fallback. Existing legacy non-gallery assets without alternate format and institution logo fallbacks are preserved.
- Portal readiness still includes the selected mechanical artwork, required for the visible opening. The hidden Home decorative SVG is admitted at reveal. Lab light/counter modes do not decode the unused artwork; background-only mode decodes only its background.
- Run `npm run test:isolated -- node tests/image-demand-smoke.mjs`. The workflow reconstructs the immutable baseline, records CDP request/response/cache/encoded-byte timelines and screenshots, and compares the same scenarios. These local fixtures do not measure Supabase billing or production latency.
- First baseline measurement: three gallery previews, 286527 encoded bytes at 1440×900 and 390×844. First candidate measurement: zero initial gallery preview requests in both. The original diagnostic run had a grep syntax failure after collecting evidence; an additional no-observer run exposed an existing particle renderer incompatibility, corrected in this PR. Final acceptance depends on the latest full CI.
- Rollback: revert PR #51 as a new commit, preserving the stage 01 isolation changes and existing assets. Do not revert the isolation independently.
