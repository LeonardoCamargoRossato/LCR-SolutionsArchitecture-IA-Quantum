# CI hotfix — published smoke tests for retired projects

**Date:** 2026-11-23  
**Base:** Hero V11 merge `f0299b7` on `main`  
**Scope:** Test harnesses and PR triggers only; no product UI, CMS, Supabase, asset or deployment changes.

## Evidence and root cause

Two *post-deploy* checks continued failing after successful Hero V11 publication:

- `Portfolio - published retired-project smoke` (run 45247506583): legacy `tests/portfolio-covers-smoke.mjs` attempted to open the retired `scientific-analysis-toolkit` case and timed out waiting for `.case-story-cover`.
- `LCR institution logos - public Pages check` (run 45247506531): legacy `tests/institution-logos-browser-smoke.mjs` still demanded the retired project's two logos, timing out during route navigation.

`src/config/retiredProjects.ts` explicitly excludes the old `scientific-analysis-toolkit` from public routes and cards. Both failures were also present on the previous Hero V10 deploy, so they were not introduced by the Hero V11 patch.

## Change

1. Portfolio cover/zoom smoke tests cover **seven active** cases and reject all **four retired** slugs on both Home and direct routes (including the retired Scientific Analysis Toolkit).
2. Institution SVG tests cover **nine active logos across five active cases** in desktop/mobile, verify PNG fallback, and explicitly assert that the retired case shows no public logos.
3. Both corresponding CI workflows are triggered on pull requests that change their tests or retirement-routing logic, so regressions are caught before merge.

## Safety and acceptance

- Never restore, delete or mutate historic project content in the CMS merely to make browser tests green.
- Preserve PNG originals, WebP renditions, vector logos, Hero V11 components, and the site deployment workflow.
- Gate merge on build, active project cases, retired-route assertions, desktop/mobile SVG requests and raster fallback passing.
- After merge, verify GitHub Pages deploy succeeds and both *published* post-deploy checks turn green.

**Rollback:** revert this test-only PR. Historic media and project data are unaffected.
