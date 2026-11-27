"""Exact structural relocation of the 32 retained workflows into code/.

The historical parity verifier remains authoritative for legacy behavior. This
module only permits the listed path transformations on a pinned workflow
revision. No trigger, permission, assertion or historical SHA is removed.
"""
import re

APP_PREFIXES = ("src/", "tests/", "public/", "docs/", "scripts/", "supabase/")
APP_CONFIGS = {"index.html", "vite.config.ts", "package.json", "package-lock.json",
               "package*.json", "storage.rules", "tsconfig.json",
               "tsconfig.app.json", "tsconfig.node.json", "tsconfig*.json"}


def app_path(path):
    negative = path.startswith("!")
    bare = path[1:] if negative else path
    if bare.startswith(APP_PREFIXES) or bare in APP_CONFIGS:
        return ("!" if negative else "") + "code/" + bare
    return path


def replace_once(raw, old, new):
    assert raw.count(old) == 1, "Structural anchor missing or ambiguous: " + old
    return raw.replace(old, new, 1)


def relocate_workflow(name, raw):
    assert "\ndefaults:" not in raw, "Existing defaults require explicit review"
    raw = replace_once(raw, "\njobs:\n",
                       "\ndefaults:\n  run:\n    working-directory: code\n\njobs:\n")

    def paths(match):
        def item(m):
            quote, path = m.group(1), m.group(2)
            return "      - " + quote + app_path(path) + quote
        return re.sub(r"(?m)^      - (['\"]?)([^'\"\n]+)\1$", item, match.group())

    raw = re.sub(r"(?m)^    paths(?:-ignore)?:\n(?:      - [^\n]+\n)+", paths, raw)
    assert "cache-dependency-path:" not in raw, "Review existing cache path"
    raw = re.sub(r"(?m)^([ ]+)cache: npm$",
                 r"\1cache: npm\n\1cache-dependency-path: code/package-lock.json", raw)
    raw = re.sub(r"(?m)^([ ]+path: )(\./dist|dist|test-results(?:/[^\n]*)?)$",
                 lambda m: m.group(1) + "code/" + m.group(2).removeprefix("./"), raw)

    def artifact_block(m):
        return re.sub(r"(?m)^(            )(dist/|docs/|test-results/)",
                      r"\1code/\2", m.group())

    raw = re.sub(r"(?m)^          path: \|\n(?:            [^\n]+\n)+",
                 artifact_block, raw)

    if name == "design-skills-ci":
        raw = replace_once(raw, "git diff --stat HEAD^ HEAD -- .agents/skills docs/design-skills",
                           "git diff --stat HEAD^ HEAD -- ../.agents/skills docs/design-skills")
        raw = replace_once(raw, "Path('.agents/skills/ui-ux-pro-max/scripts')",
                           "Path('../.agents/skills/ui-ux-pro-max/scripts')")
        raw = replace_once(raw, "python3 .agents/skills/ui-ux-pro-max/scripts/search.py",
                           "python3 ../.agents/skills/ui-ux-pro-max/scripts/search.py")
    elif name == "social-sharing-ci":
        # The old revision uses public/ at its root; compare exact SVG bytes,
        # rather than comparing two intentionally different repository paths.
        raw = replace_once(
            raw, "git diff --exit-code dc7bc88c709ef46ea039e47c4d5c08630420df19 -- public/og-cover.svg",
            "git show dc7bc88c709ef46ea039e47c4d5c08630420df19:public/og-cover.svg | cmp - public/og-cover.svg")
    elif name == "portal-performance-hotfix":
        # The immutable before tree is legacy; only the candidate app is in code/.
        raw = replace_once(raw, '/tmp/lcr-after/node_modules', '/tmp/lcr-after/code/node_modules')
        raw = replace_once(raw, 'for dir in /tmp/lcr-before /tmp/lcr-after; do',
                           'for dir in /tmp/lcr-before /tmp/lcr-after/code; do')
        raw = replace_once(raw, 'LCR_AFTER: /tmp/lcr-after\n', 'LCR_AFTER: /tmp/lcr-after/code\n')
    elif name == "LCR_TEST_ISOLATION":
        # AUD-005: additive pinned-main comparison. Keep historical baseline
        # and execute its comparison even if the new reference differs.
        raw = replace_once(raw, "      - name: Compare baseline and candidate screenshots and case content\n        env:\n", "      - name: Install pinned historical diagram encoder\n        run: |\n          python3 -m venv /tmp/lcr-visual-pillow\n          /tmp/lcr-visual-pillow/bin/pip install --disable-pip-version-check --no-deps Pillow==13.0.0\n      - name: Reconstruct audited main with its own lockfile and isolated fixture\n        run: |\n          git worktree add --detach /tmp/lcr-approved-main 67e8877b02fc23352306f75c04a40f4085b1f716\n          (cd /tmp/lcr-approved-main && npm ci)\n          bash tests/isolation/run.sh bash -c 'cd /tmp/lcr-approved-main && npm run build'\n      - name: Compare audited main, candidate and offline public content\n        env:\n          LCR_BEFORE: /tmp/lcr-approved-main\n        run: npm run test:isolated -- node tests/isolation/ApprovedMainComparison.test.mjs\n      - name: Compare baseline and candidate screenshots and case content\n        if: always()\n        env:\n")
    elif name == "deploy":
        # Source validation compares an immutable historical SHA, so the build
        # checkout must retain history rather than fail after the merge.
        raw = replace_once(raw, "          ref: ${{ github.sha }}\n\n      - name: Optimize LCR Workflow diagram as WebP",
                           "          ref: ${{ github.sha }}\n          fetch-depth: 0\n\n      - name: Optimize LCR Workflow diagram as WebP")
        # Stage 04: replace build-time regeneration/deletion with verification
        # of the approved versioned PNG/WebP pairs. No deploy gate is removed.
        raw = replace_once(raw, "      - name: Optimize LCR Workflow diagram as WebP\n        run: |\n          python3 -m venv /tmp/lcr-webp\n          /tmp/lcr-webp/bin/pip install --disable-pip-version-check Pillow\n          /tmp/lcr-webp/bin/python - <<'PY'\n          from pathlib import Path\n          from PIL import Image\n\n          source = Path(\"public/workflow/LCR_Workflow_Agentes_Papeis_Funcoes.png\")\n          target = source.with_suffix(\".webp\")\n          with Image.open(source) as image:\n              image.save(target, \"WEBP\", quality=92, method=6)\n          print(f\"Workflow diagram: {source.stat().st_size:,} -> {target.stat().st_size:,} bytes\")\n          # Retain the original PNG in Git history, but publish only the WebP.\n          source.unlink()\n          PY\n\n", "      - name: Verify versioned public assets (preserve PNG originals and WebP variants)\n        run: python3 scripts/ci/check_source.py\n\n")
    return raw


def verify_workflow_relocation(name, legacy, actual):
    expected = relocate_workflow(name, legacy)
    assert actual == expected, "Unexpected structural workflow change: " + name


def self_test():
    old = (
        "name: sample\non:\n  pull_request:\n    paths:\n"
        "      - 'src/**'\n      - package*.json\n      - .github/workflows/sample.yml\n"
        "permissions:\n  contents: read\njobs:\n  test:\n    steps:\n"
        "      - uses: actions/setup-node@v4\n        with:\n          cache: npm\n"
        "      - run: bash tests/isolation/run.sh npm run build\n"
        "      - uses: actions/upload-artifact@v4\n        with:\n          path: |\n"
        "            test-results/quality.json\n            docs/evidence.json\n"
    )
    new = relocate_workflow("sample", old)
    assert "      - 'code/src/**'\n" in new
    assert "      - code/package*.json\n" in new
    assert "      - .github/workflows/sample.yml\n" in new
    assert "    working-directory: code\n" in new
    assert "          cache-dependency-path: code/package-lock.json\n" in new
    assert "            code/test-results/quality.json\n" in new
    assert "            code/docs/evidence.json\n" in new
    assert "      - run: bash tests/isolation/run.sh npm run build\n" in new
    verify_workflow_relocation("sample", old, new)
    for changed in (new.replace("contents: read", "contents: write"),
                    new.replace("bash tests/isolation/run.sh ", ""),
                    new.replace("code/package-lock.json", "package-lock.json")):
        try:
            verify_workflow_relocation("sample", old, changed)
        except AssertionError:
            continue
        raise AssertionError("Unapproved workflow change accepted")
    print("PASS path relocation and rejection of unauthorized workflow changes")
