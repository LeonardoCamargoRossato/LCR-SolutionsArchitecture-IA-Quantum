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

## V3 — WhatsApp compatibility hotfix (2026-11-24)

The owner's native WhatsApp test displayed text but no image. The approved PNG (976095 bytes) exceeded Meta's documented 600 KB thumbnail recommendation; the previous HTTP smoke test incorrectly accepted up to 1 MB. Source: https://developers.facebook.com/documentation/business-messaging/whatsapp/link-previews/ . The V2 description above is historical.

- Primary Open Graph and Twitter image: `public/assets/branding/social/lcr-portfolio-og.jpg` (1200×630, 260603 bytes, SHA-256 `6b06f48081d7d8bac09c296a79b5d1ae7018791b3b52d2ad69590015642bf7fa`, baseline JPEG, quality 92, Pillow 12.0.0). No change to composition, dimensions, PNG, or WebP. JPEG is an explicitly derived delivery asset; PNG and WebP remain versioned and public. No new runtime dependency or Home request.
- Static tags use absolute HTTPS JPEG URL with `?v=3`, MIME `image/jpeg`. Canonical page URL unchanged.
- Reproduce only when needed: install Pillow==12.0.0 in an isolated environment and run `python3 scripts/generate-social-preview.py`. The checked-in JPEG is the deployed artifact; CI checks exact digest, baseline markers, size strictly below 300 KB, dimensions, and preserved approved assets. Public check exercises the documented Android/iOS/web WhatsApp user agents plus LinkedIn and X. Native platform rendering remains a separate manual acceptance.
- Re-test canonical link; if cached, share a new message using `?share=v3` and wait for the preview before sending. Governance: LCR_ASSET_ORGANIZATION_STANDARD v1.1 and LCR_PERFORMANCE_STANDARD. Rollback: revert the V3 commit without deleting approved source assets.

## V4 — ultralight mobile preview (2026-11-24)

The owner reported V3 still displayed text only in native WhatsApp despite HTTP checks. The cause remains unconfirmed; this revision reduces resolution/weight and changes the image path to avoid the previous image cache. Primary: `public/assets/branding/social/lcr-portfolio-og-wa.jpg`, 600×315, 40303 bytes, baseline JPEG quality 80, SHA-256 `8257715ef682aa239331ca3c72cb31e20911299751ed5f320e55bdab0dbbeae9`. Secondary: `public/assets/branding/social/lcr-portfolio-og-wa.webp`, 600×315, 19644 bytes, WebP quality 50, SHA-256 `c63c4b55ba1b201bc907af96dd32553326a930003a9b4d8ed6727a8255437b9b`. Both are conventional resampling/compression of the exact approved PNG, no crop or new art. Prior PNG, WebP and JPEG remain unchanged. New OG/Twitter URL has no query string; secure_url points to the same JPEG. No runtime preloading. CI validates dimensions, MIME, exact hashes, budgets, HTTPS URLs, original assets and live crawler HTTP; the native WhatsApp rendering is a separate human acceptance test. Test a fresh message with the canonical link or `?share=v4` if cached. Reproduce using Pillow==12.0.0 and `scripts/generate-mobile-social-preview.py`. Roll back by reverting V4; no originals deleted. LCR asset standard v1.1 consulted.
