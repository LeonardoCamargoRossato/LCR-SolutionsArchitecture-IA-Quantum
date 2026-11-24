# LCR quality gate — transition (ADR-0002)

Base: cf273ae6026c48e264c3ef80863abf458dc61fc4; last healthy deploy: [45491921726](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/actions/runs/45491921726).

The 32 original workflows are retained. The central executor inventories every original workflow, trigger, job, command, environment, action and artifact configuration against the pinned base, rejects unmapped workflows or changed legacy definitions, and executes five groups with one isolated build each. It deduplicates only identical isolated commands with identical explicit environments. Baseline comparison builds and all unique assertions remain. The core isolation job is unchanged; published smokes stay separate. The proposed deploy calls the same isolated gate at the actual main SHA before the production build; this remains unactivated until reviewed and merged. For this controlled PR, all changes run the complete shadow matrix without path filtering, including shared components, assets, docs and configuration. Temporary duplication is intentional for parity evidence, not the steady-state architecture.

## Commands
- `python3 scripts/ci/quality.py`: inventory and failure-propagation self-test.
- `python3 scripts/ci/quality.py --shard hero` (or portfolio, lab, performance, static): isolated commands, requiring the runner dependencies.
- `python3 scripts/ci/check_source.py`: changed-source whitespace, high-confidence secret patterns and required docs.
- `python3 scripts/ci/check_source.py --artifact dist`: public artifact checks.
- CI artifacts include SHA, individual command exit status, duration and evidence. No real backend is authorized.

## Cutover conditions
The main branch API reports protected=false and no required checks; detailed protection endpoint is denied to the integration. Do not retire or rename legacy checks until owner confirms protection and the independent Auditor revalidates this comparison. Configure a required central status, verify failure blocks merge, and require exact-SHA QA evidence before production build/deploy. Preserve manual benchmarks, migration syntax and bounded post-deploy verification. No deployment is authorized from the PR branch. Manual release is restricted to main. The proposed release reuses the quality entrypoint with read-only permission and does not inherit production secrets. Publication jobs no longer cancel an in-progress release.

## Remaining debt
No existing configured ESLint/Prettier baseline: changed-source whitespace is not full lint/format. The locked dependency audit now fails on high/critical advisories or an unavailable registry; no exception is preapproved. Lower severities are reported for follow-up. Secret rules are high-confidence only, not comprehensive secret detection. Final cutover, complete lint/format and security policy and independent review remain pending. No savings claimed until legacy execution is actually retired. Rollback: revert transition commit; all original checks remain intact.
