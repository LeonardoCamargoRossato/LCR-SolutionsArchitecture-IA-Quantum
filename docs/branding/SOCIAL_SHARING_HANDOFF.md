# Social sharing — handoff Builder → ChatDrawer

**Status:** infrastructure implemented; artwork provisional until approved. The previous `public/og-cover.svg` remains byte-identical. The new PNG is solely a rasterized compatibility derivative, not a ChatDrawer design. The source and SHA-256 are recorded in SOCIAL_ASSET_INVENTORY.json (LCR_ASSET_ORGANIZATION_STANDARD v1.0, 2026-11-16).

## Contract

- Target: `public/assets/branding/social/lcr-portfolio-og.png`, PNG, 1200 × 630 px, <= 1 MB recommended project budget.
- Public URL: `https://leonardocamargorossato.github.io/LCR-SolutionsArchitecture-IA-Quantum/assets/branding/social/lcr-portfolio-og.png?v=1`. Share the root URL, without hash/replay parameters.
- All Open Graph and Twitter Card fields are static in index.html, with HTTPS absolute URLs; Vite copies the public file into dist. SeoSync no longer overwrites the site-wide Open Graph card after hydration; localized page title, description and favicon remain unchanged. Admin SEO social fields are retained for compatibility but are not used to override the static card. Hash routes share one canonical preview.
- Temporary PNG uses the entire original 16:9 SVG, centered at 1120 × 630 with 40 px matching margins. Original artwork is not retouched.

## When ChatDrawer supplies the approved image

1. Preserve the provisional PNG in Git history/acervo; replace the target file with the approved 1200 × 630 PNG, without altering the old SVG.
2. Record source/provenance, rights, approval, SHA-256, size, alt text and update date in SOCIAL_ASSET_INVENTORY.json. Keep the file name stable. Increment cache_version and BOTH image URL query versions in index.html; update alt text if needed. Some platforms ignore query strings: if necessary, use a new versioned filename and update both URLs and inventory together.
3. npm ci; npm run build; python3 tests/social-sharing-smoke.py --dist dist. Review the preview at native size.
4. Open PR, pass CI, obtain approval before publishing final artwork. Verify public URLs return HTTP 200, image/png and correct bytes using python3 tests/social-sharing-smoke.py --live.
5. Use LinkedIn Post Inspector (https://www.linkedin.com/post-inspector/) for a fresh scrape of the root URL; verify title, description and image in a new post draft (do not publish).
6. WhatsApp: send/share the root URL in a self-chat or test conversation; wait for preview. Old messages do not necessarily refresh. For a fresh test, try a unique page query parameter before the hash (e.g. ?share=v2). Do not claim cache purge or force changes on users' devices.
7. Verify native previews on actual mobile/desktop. Simulated crawler user-agent requests only validate network/metadata access, not a platform's proprietary rendering or caches.

No changes to Home, portal animations, runtime dependencies, or deployment base.
