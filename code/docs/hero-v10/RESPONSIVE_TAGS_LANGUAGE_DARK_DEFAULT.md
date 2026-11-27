# LCR Portfolio — Hero V10, Header Language & Default Theme

**Date:** 2026-11-23 · **Scope:** header controls, product defaults, and Hero responsive styles only.

## Requirements and implementation

| View | Requirement | Implementation |
| --- | --- | --- |
| Desktop ≥901px | All four Hero chips in one line | Scoped no-wrap flex row, responsive 8–10px chip font and reduced chip padding. Tags remain readable and inside the Hero copy column. |
| Mobile ≤900px | Stage tabs higher, shorter and farther right; never cover Code or Hamlet AI | Stage selector top 2px/right 8–22px; 39px touch targets and tighter paddings. The mobile code/assistant scenes are lowered within the same graphics area without touching the background graphics or their animation code. |
| Mobile ≤600px | Smaller Hero description and CTA buttons | Scoped paragraph 12.5–14px/1.58, CTA font 10.5–12px and 40px minimum height. |
| All viewports | Display visible 🇺🇸 EN USA / 🇧🇷 PT BR picker | Permanent header control outside hamburger menu. Dropdown shows both labels with lightweight in-repository SVG vectors; supports keyboard focus, Escape, outside click and persists user's selection. |
| First visit | English by default irrespective of browser/OS | `I18nProvider.initialLocale` returns `en-US` if no explicit stored choice. Existing `portfolio-locale` selection persists to respect deliberate user choice. |
| First visit | Dark theme by default irrespective of OS | `ThemeProvider.getInitialTheme` returns `dark` if no stored manual preference. Inline small HTML theme initialization prevents a light-theme flash; a saved manual light selection continues to work. |

## Asset inventory and LCR Workflow

| asset_id | Logical function | Canonical source | Versions | Production status |
| --- | --- | --- | --- | --- |
| `header-us-flag-v10` | Language selector EN USA | `src/components/header/FlagIcon.tsx` (branch-safe inline SVG) | Source vector rendered inline, no PNG/WebP duplicate necessary | Public, bundled; newly authored technical icon |
| `header-br-flag-v10` | Language selector PT BR | `src/components/header/FlagIcon.tsx` (branch-safe inline SVG) | Source vector rendered inline, no PNG/WebP duplicate necessary | Public, bundled; newly authored technical icon |
| `hero-data-background-v7` | Dark Hero background | `public/assets/home/hero/lcr-hero-blue-code-v7-lite.svg` | Existing V7 canonical asset, unchanged | Preserved |
| `hero-light-background-v8` | Light Hero background | `public/assets/home/hero/lcr-hero-blue-code-v8-light-navy.svg` | Existing V8 canonical asset, unchanged | Preserved |
| `hamlet-ai-illustration` | Assistive AI demo | `public/assets/home/hero/ai-hamnet-enterprise-v2.svg` | Existing vector source, unchanged | Preserved |

No remote flag resources, runtime dependencies, video, raster resampling or asset migration were added. Inline SVG flag vectors are trusted code, not user-uploaded SVGs. Styles remain scoped to the Hero and header; other pages and sections are unaffected. The original sources and Git history are preserved. Alignment checked against **LCR_ASSET_ORGANIZATION_STANDARD v1.0** in the LCR Framework Google Drive directory.

## Testing and rollback

- `npm ci && npm run build`.
- Existing Hero V5 scene/theme regression and V9 mobile two-line headline/gutters regression.
- Dedicated V10 browser checks at 320, 360, 390, 430, 600, 768, 900, 901, 1024 and 1440px, starting with a simulated Portuguese browser locale and light OS theme.
- Verify fresh English + dark default, both flag options in popup, persistent manual PT/EN and light/dark overrides, dropdown focus/Escape/outside click, four desktop chips on exactly one row, smaller mobile copy/buttons and no overlap between stage selector and Code/Hamlet scenes.
- Existing project/portfolio/gallery regressions and publication workflow must pass on the exact merged commit.

The PR can be reverted without deleting assets or modifying the Supabase catalog. The legacy locale and theme keys remain unchanged, preventing accidental erasure of previously selected preferences.
