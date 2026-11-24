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

## Dependency audit resolution (PR #52)
The original audit artifact (run 45504825888) identified three independently affected package nodes, represented by nine advisory records: brace-expansion 1.1.18 (npm advisory IDs 1240100, 1240104, 1240108), source-map-js 1.2.1 (1241209), and Vite 6.4.3 (1242622, 1242651, 1242658, 1242724, 1242730). The lockfile-only safe remediation updated them to brace-expansion 1.1.22, source-map-js 1.2.4, and Vite 6.4.6; package.json was unchanged and no exception was added. The current locked dependency audit reports zero findings at every severity in run 45510674234.

Historical benchmark parity remains intact while using each pinned baseline's own lockfile: the central isolation baseline and the image-demand, Loading Portal V2, and portal-performance comparisons install historical dependencies in their own worktrees before network isolation. The verifier allows only these explicit setup changes and compares restored workflow definitions for all other content. Direct checks for these benchmark workflows passed in run 45510674234.

## Transition measurements and evidence
Run [45510674234](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/actions/runs/45510674234), branch head 98d51b6e06325bf473d5e45c039459019d058215, completed dependency audit, isolation, inventory, all five shadow groups, and transition parity successfully. GitHub's PR merge checkout SHA recorded by the performance artifact was 1812b16fc86ee47fe010ef08f7c0fc1d6384d9ed. The run artifacts are SHA-bound; parity summary artifact ID 14976300690 and inventory artifact ID 14975855509 are attached to the run.

The baseline inventory is 22 legacy workflow builds, 24 installs, and 11 duplicate test executions. The central five groups nominally use five candidate builds and five installs. Historical comparisons explicitly add four baseline builds and three baseline installs, for nine builds and eight installs including those comparisons. These are inventory counts, not measured savings. Legacy workflows still execute during this transition, so no realized operational savings are claimed.

## Remaining debt
No existing configured ESLint/Prettier baseline: changed-source whitespace is not full lint/format. Secret rules are high-confidence only, not comprehensive secret detection. Final cutover, complete lint/format and security policy and independent review remain pending. No savings claimed until legacy execution is actually retired. The main protection API currently reports protected=false, the rulesets listing is empty, and the detailed protection endpoint returns HTTP 403; administrative state therefore remains unverified. Rollback: revert transition commit; all original checks remain intact.
