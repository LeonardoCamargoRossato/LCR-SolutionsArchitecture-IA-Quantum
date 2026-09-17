# V2 — Functional and Admin UX fixes

This iteration preserves the existing public visual identity and focuses on functional CMS behavior.

## Image replacement flow

Project cover and profile image changes now follow this order:

1. Local validation and preview.
2. Upload through `MediaService`.
3. Storage through `IMediaRepository` implementation.
4. Persist the returned media URL/object on the project/content document.
5. Refresh `SiteContentProvider` project/content state.
6. Remove the previous media only after the new document is safely persisted.
7. Show a success toast.

If project/content persistence fails after upload, the newly uploaded asset is cleaned up and the UI reports an error instead of false success.

Firebase Storage URLs use unique paths, so successful replacement naturally invalidates the old browser URL rather than depending on manual refresh.

## Global feedback

`ToastProvider` provides success/error feedback. Firebase/provider errors are converted into human-readable messages by `src/utils/errors.ts`; full errors remain available in the browser console for debugging.

## Admin UX

Direct JSON editing has been removed. The Admin uses labeled inputs, tag editors, image upload areas, project cards, controlled rich-text editing, save states and unsaved-change protection.

## Public Home

- Selected Work: 2 × 2 on desktop, 1 column on mobile.
- More Projects: 2 × 2; Enterprise Power Apps is excluded.
- About: profile image + social icons + compact bio + CV button.
- Research & Technology: compact keyword chips.
- `/about` redirects to Home and scrolls to the About section.

## Firebase isolation

Firebase SDK imports remain inside `src/infrastructure/firebase/`. The composition root in `src/bootstrap/services.ts` is the only non-infrastructure layer that selects concrete repository implementations.
