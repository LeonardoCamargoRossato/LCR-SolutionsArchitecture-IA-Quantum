# Social sharing — official artwork V2

**Visual approval:** 2026-11-24, Drawer Chat 1, reported by owner. **Release gate:** both exact approved binaries must pass CI before merge. Do not regenerate or re-encode. The owner supplied the original 1672×941 PNG. Builder reproduced both approved outputs exactly (same byte sizes and SHA-256) without generative modification. The current production V1 remains intact until the verified replacement is merged.

## Contract

- Official PNG: `public/assets/branding/social/lcr-portfolio-og.png`, 1200 × 630, 976095 bytes, SHA-256 `5b140d90e3c03fac7518784dea7fb4ce7a61b9e73175ff11bdf254cf3bb324cb`.
- Optimized WebP: `public/assets/branding/social/lcr-portfolio-og.webp`, 1200 × 630, 137928 bytes, SHA-256 `fc85e54e320df31bc7f28f8a86916ba328af784c13ddd50de097c941c39a59db`.
- PNG is the only Open Graph/Twitter Card image; both absolute URLs use `?v=2`. WebP is an optimized asset, not a crawler fallback or an additional Home request.
- Original provisional PNG is recoverable from commit 9e507eb5db8d5445bc9b98d6eef4e421f4ca518d; original `public/og-cover.svg` remains unchanged.
- Governance: LCR_ASSET_ORGANIZATION_STANDARD v1.0, 2026-11-16, verified in Drive. The inventory records approval, source, exact target sizes and hashes and previous release. No new dependencies.

## Release procedure

1. The original was resized proportionally to 1119×630 with LANCZOS; 40/41 px edge-extended side margins preserve the entire composition. PNG optimize=True; WebP quality=91, method=6. Both output hashes exactly match the Drawer handoff. The verified files are archived in Drive under LCR Apps/LCR-SolutionsArchitecture-IA-Quantum/branding/social, without changing sharing permissions. CI must confirm the repository and built bytes.
2. Run `npm ci`, `npm run build`, `python3 tests/social-sharing-smoke.py --dist dist`. CI also validates the legacy SVG and captures published preview assets as evidence.
3. Merge only after all required checks pass. The deploy workflow runs `python3 tests/social-sharing-smoke.py --live` after publication, checking the static HTML, both files, HTTP 200, MIME type, dimensions and SHA-256 for simulated WhatsApp, LinkedIn and Twitter crawler user agents.
4. Share the canonical root URL (no hash/replay parameters). Use LinkedIn Post Inspector (https://www.linkedin.com/post-inspector/) to rescrape the root; verify actual draft preview without posting. Test WhatsApp in self-chat, optionally share `?share=v2` if a previous preview is cached. Native app cache/rendering is not proven by HTTP simulation.
5. Roll back by reverting the approved-artwork commit; original provisional bytes and v1 metadata remain available in Git history.

No modifications to Home, loading portal, animations, routes or runtime dependencies.
