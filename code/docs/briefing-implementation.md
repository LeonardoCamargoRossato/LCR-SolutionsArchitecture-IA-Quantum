# Briefing implementation checklist

Implemented in this iteration:
- Approved V0 visual identity retained.
- React + TypeScript + Vite + HashRouter.
- Independent `/about` editorial page with Current roles, Education, Research trajectory, Research meets software, Publications, Science & Communication, social links and CV action.
- Real social/project URLs supplied in the briefing.
- Four main case studies updated with the supplied content.
- Illustrative project covers and text-free PNG illustrations for More Projects.
- `/admin` with Google authentication through `AuthService`.
- Authorized admin UX check for `leo.c.rossato@gmail.com`.
- Firestore/Storage write rules enforcing the same email server-side.
- Home/About/Research/Social/SEO editing and project JSON editing with explicit Save.
- Cover replacement, Media Library and CV PDF replacement through services/repositories.
- Firebase isolated under `src/infrastructure/firebase`.
- In-memory fallback adapters and default public content.
- Editable SEO synchronized into document metadata.
- Architecture and Firebase setup documentation.

The default screenshots are illustrative placeholders until real screenshots are uploaded through Admin or replaced in `public/projects/`.
