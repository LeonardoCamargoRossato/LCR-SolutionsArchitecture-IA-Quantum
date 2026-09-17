# Portfólio Apps LCR — V1

Evolution of the approved V0. Public portfolio remains static/GitHub Pages compatible while Firebase is treated only as an infrastructure provider behind repository interfaces.

## Run
```bash
npm install
cp .env.example .env
npm run dev
```
Firebase variables are optional for public fallback mode. They are required for Admin login, persistence and Storage uploads.

## Build
```bash
npm run build
```
HashRouter keeps GitHub Pages routes robust (`/#/about`, `/#/projects/...`, `/#/admin`).

## Admin
`/#/admin` — authorized account: `leo.c.rossato@gmail.com`.

## Security
Deploy `firestore.rules` and `storage.rules`. The React email check is UX only; server-side Firebase rules enforce writes.

## Architecture
Read `docs/architecture.md` and `docs/firebase-setup.md`.

## V2 functional corrections

The current source includes the Admin UX and upload/persistence corrections described in `docs/v2-functional-fixes.md`.

Important behavior:

- Admin edits never expose JSON or Firestore document structure.
- Project covers and the profile photo are uploaded through `MediaService` / `IMediaRepository`.
- New media is persisted before old media is deleted.
- `SiteContentProvider` exposes `refreshContent()` and `refreshProjects()` for immediate public-state refresh after saves.
- Global toast messages report save/upload success and human-readable failures.
- `/about` is retained only as a compatibility redirect to the About section on Home.
- Enterprise Power Apps is excluded from the initial/public More Projects set.
