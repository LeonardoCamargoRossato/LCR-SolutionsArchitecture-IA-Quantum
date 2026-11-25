# LCR Portfolio — Hero V11 & PT/EN public UI audit
**2026-11-23** · Frontend only · GitHub Pages / React / TypeScript

## Change log and acceptance criteria

1. **Tags, mobile 320–900px:** four specialties on one line, without horizontal overflow or tiny unreadable sentences. The original full EN/PT labels remain in the DOM as accessible `aria-label` and a title tooltip; a shorter visual label is rendered only on small screens. Font scales ~7.5–9.5px depending on width. Desktop remains a single line with the full specialty names.
2. **Stage placement:** one-line chips reduce the top section. Stage margin decreases to 22–25px; no costly animations are added. The 4-tab selector stays at the upper right at ~43–45px high. The 40px pause/play control moves from bottom right to upper left, aligned with and outside the tab menu.
3. **Neural visualization:** the mobile layer is shifted toward the vertical center; the desktop neural representation is scaled to **90%** (10% smaller) while preserving original node geometry, event behavior and optimized background SVG.
4. **Code scene:** a smaller card and typography, raised within its stage, using a slight `perspective()/rotateY()/rotateX()/scale()` for 3D depth. Tabs must remain clear.
5. **Hamlet AI scene:** slightly smaller with subtle perspective; original message sequence and replay preserved, no live AI connection.
6. **Bilingual editing and SEO:** all owned, public-facing Hero headings/descriptions, capability labels, stable project status labels, code/assistant demo captions, 404/loading UI, site navigation accessibility labels, translated CMS fallback homepage/About metadata, and home SEO title/description are localized with `en-US` / `pt-BR`. First visit remains English + dark independent of device; user overrides remain persisted.

### Canonical bilingual content

| Surface | English (en-US) | Português (pt-BR) |
| --- | --- | --- |
| Hero title | AI Engineering & Software Development | Engenheiro de IA e Desenvolvimento de Software |
| Subtitle | Building Intelligent Solutions. | Construindo Soluções Inteligentes. |
| Hero sentence | I design and build intelligent software, combining AI, data, hybrid RAG, and systems architecture. | Projeto e desenvolvo software inteligente, combinando IA, dados, RAG híbrido e arquitetura de sistemas. |
| Mobile tags | LLMs & Agents · Hybrid RAG · Data & Opt. · Quantum | LLMs e Agentes · RAG Híbrido · Dados/Otim. · Quântica |

Names of external products and organizations (Python, OpenAI, GitHub, Streamlit, Supabase, React, Instituto Foton), source code syntax, paper titles and official document/file names **are not translated**.

## Scope of translation and editorial boundary

- `src/config/portfolioPositioning.ts` is the single source of Hero bilingual copy, not overwritten by CMS hydration.
- Existing `localizedAbout` and `localizedSiteSettings` rely on the stored `translations['pt-BR']` data, present in the reviewed default content. The previously English-only Portuguese fallback titles/headlines were corrected.
- `localizedProject` now consistently applies `captionPt/altTextPt` to galleries even if a project does not have a full `translations['pt-BR']` object. Common status badges are localized independently.
- The last unlocalized fallback project, Streamlit Tools, now has a PT-BR description/category/technology translation.
- Case studies from an **external CMS** may have newer editorial texts without a PT translation. The application retains the approved original text instead of inventing translations or altering Supabase records. This is an editorial gap to review in the CMS; there is no automatic unverified translation or destructive migration. Similarly, publication titles remain original.
- Technical workflows with locale-aware markdown stages remain unchanged except for a static English-only explanatory caption.

## LCR asset inventory — V11

| asset_id | Source | Type | Preservation | Usage |
| --- | --- | --- | --- | --- |
| `hero-background-dark-v7` | `public/assets/home/hero/lcr-hero-blue-code-v7-lite.svg` | static optimized SVG | **Unmodified** | dark background |
| `hero-background-light-v8` | `public/assets/home/hero/lcr-hero-blue-code-v8-light-navy.svg` | static optimized SVG | **Unmodified** | optional light background |
| `hero-hamlet-portrait-v2` | `public/assets/home/hero/ai-hamnet-enterprise-v2.svg` | SVG | **Unmodified** | Hamlet AI scene |
| `hero-neural-graph-v11` | `src/components/hero/AiSystemsGraph.tsx` | React/SVG code | same geometry, PT/EN caption | network diagram |
| `hero-v11-responsive-rules` | `src/components/hero/hero-responsive-v11.css` | source stylesheet | new feature file alongside original CSS | responsive compositions |

No files were deleted, copied into duplicate asset folders or re-encoded. Source hierarchy follows features and the **LCR_ASSET_ORGANIZATION_STANDARD** in LCR Framework Drive (reviewed 2026-11-23). Existing artifact performance budget for images and static SVG is preserved; frontend source budget increases from 65k to 75k after adding locale and responsive layout features, but there is no new video, remote image, dependency or per-frame JS.

## Verification and rollback

- `npm ci && npm run build`.
- Existing V5 neural/code/Hamlet, V9 two-line title & gutters, V10 language flags/dark default, positioning, project routes and gallery regression suites.
- V11 browser geometry at 320, 360, 390, 430, 600, 768, 900, 1024 and 1440px in EN; plus 320, 390, 600, 1440px in PT, with 4 single-row semantic tags, separate aligned play/tab controls, centered neural network, perspective code/assistant and no horizontal overflow.
- Bilingual route smoke on Home/About/Footer/SEO, Workflow, invalid route/404, Foton Hub project case, and demo code/assistant text.
- Tests preserve the original physics/AI image assets and export screenshots/JSON for review in Actions. PR merge is conditional on green CI for its exact SHA, then verify the published Pages workflow on the merge SHA.

**Rollback**: revert the feature PR; legacy V10 styles and assets remain intact. Reverting does not delete CMS content or stored user preferences.
