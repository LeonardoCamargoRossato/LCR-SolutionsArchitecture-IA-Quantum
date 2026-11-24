"""Stage 03 shadow quality executor. Never deploys or contacts production."""
import argparse
import copy
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time

BASE = "cf273ae6026c48e264c3ef80863abf458dc61fc4"
ROOT = Path(__file__).resolve().parents[2]
os.chdir(ROOT)
GROUPS = {
    "hero": ["hero-v2-ci", "hero-v14-wide-ci", "loading-portal-home-ci", "ai-positioning-ci"],
    "portfolio": ["about-animefinder-gallery-ci", "about-compact-retirement-ci", "about-gallery-frontend-ci",
                  "ce235-cover-ci", "cities-carousel-layout-ci", "cities-comparing-series-ci",
                  "institution-logos-svg-ci", "portfolio-carousel-unified-ci", "portfolio-cover-browser",
                  "portfolio-retired-project-regression"],
    "lab": ["loading-portal-lab-ci", "loading-portal-v2-lab-ci", "test-component-lab-ci", "test-component-lab-v2-ci"],
    "performance": ["image-demand-ci", "loading-portal-v2-benchmark", "portal-performance-hotfix"],
    "static": ["design-skills-ci", "social-sharing-ci", "about-gallery-jpg-png-webp", "portfolio-cover-migration"],
}
MANUAL = ["about-gallery-production-smoke", "ce235-cover-published", "cities-comparing-series-published",
          "institution-logos-published", "portfolio-retired-project-published"]
CORE = "LCR_TEST_ISOLATION"
BUILD = "bash tests/isolation/run.sh npm run build"
BROWSER = "npm install --no-save --ignore-scripts playwright@1.56.1\nnpx playwright install --with-deps chromium"
DRAWER = "python -m pip install Pillow==12.3.0 numpy==2.3.5"
OUT = Path("test-results/quality")
RUBY = "require 'yaml'; require 'json'; puts JSON.generate(YAML.safe_load(STDIN.read))"


def git(*args):
    return subprocess.check_output(["git", *args], text=True).strip()


def canonical(command):
    command = command.strip()
    prefix = "npm run test:isolated -- "
    if command.startswith(prefix):
        return "bash tests/isolation/run.sh " + command[len(prefix):]
    return command


def signature(command, env):
    return hashlib.sha256(json.dumps([command, env], sort_keys=True).encode()).hexdigest()[:20]


def parse_yaml(raw):
    return json.loads(subprocess.check_output(["ruby", "-e", RUBY], input=raw, text=True))


def verify_transition(name, old, now):
    before = parse_yaml(old)
    after = parse_yaml(now)
    if name == CORE:
        # Preserve every isolation step exactly except the historical dependency setup.
        old_core = before["jobs"]["isolation"]
        new_core = copy.deepcopy(after["jobs"]["isolation"])
        old_baseline = next(s for s in old_core["steps"]
                            if s.get("name") == "Reconstruct immutable pre-change baseline with local fixture")
        new_baseline = next(s for s in new_core["steps"]
                            if s.get("name") == "Reconstruct immutable pre-change baseline with local fixture")
        expected_old = """git worktree add --detach /tmp/lcr-p0-baseline 7b5d0ad67d9697b7338c945dfc7691ed8b0bd0d1
cmp package-lock.json /tmp/lcr-p0-baseline/package-lock.json
ln -s "$PWD/node_modules" /tmp/lcr-p0-baseline/node_modules
bash tests/isolation/run.sh bash -c 'cd /tmp/lcr-p0-baseline && npm run build'"""
        expected_new = """git worktree add --detach /tmp/lcr-p0-baseline 7b5d0ad67d9697b7338c945dfc7691ed8b0bd0d1
(cd /tmp/lcr-p0-baseline && npm ci)
bash tests/isolation/run.sh bash -c 'cd /tmp/lcr-p0-baseline && npm run build'"""
        assert old_baseline["run"].strip() == expected_old
        assert new_baseline["run"].strip() == expected_new
        new_baseline["run"] = old_baseline["run"]
        assert new_core == old_core, "Unexpected change to the isolation baseline comparison"
        old_events = before.get("on", before.get("true"))
        events = after.get("on", after.get("true"))
        assert all(events.get(k) == v for k, v in old_events.items())
        assert "workflow_call" in events
        assert before["permissions"] == after["permissions"] == {"contents": "read"}
        assert after["jobs"]["quality-parity"]["if"] == "always()"
        assert set(after["jobs"]["quality-parity"]["needs"]) == {
            "quality-plan", "quality-shadow", "isolation", "quality-dependencies"}
        assert "if" not in after["jobs"]["quality-shadow"]
    elif name == "deploy":
        # The release gate must precede any production build and cannot inherit secrets.
        expected = copy.deepcopy(before)
        expected["concurrency"]["cancel-in-progress"] = False
        expected["jobs"]["quality"] = {
            "if": "github.ref == 'refs/heads/main'",
            "permissions": {"contents": "read"},
            "uses": "./.github/workflows/LCR_TEST_ISOLATION.yml"}
        expected["jobs"]["build"]["needs"] = "quality"
        expected["jobs"]["build"]["steps"][0]["with"] = {"ref": "$"+"{{ github.sha }}"}
        for step in expected["jobs"]["build"]["steps"]:
            if step.get("name") == "Build":
                step["run"] += "python3 scripts/ci/check_source.py --artifact dist\n"
        expected["jobs"]["verify-social-preview"]["steps"][0]["with"] = {"ref": "$"+"{{ github.sha }}"}
        assert after == expected, "Unexpected release workflow change"
    else:
        assert now == old, f"Legacy check changed: {name}"


def inventory():
    paths = git("ls-tree", "-r", "--name-only", BASE, ".github/workflows").splitlines()
    names = {Path(p).stem for p in paths if p.endswith(".yml")}
    assigned = [CORE, "deploy", *MANUAL, *(n for group in GROUPS.values() for n in group)]
    assert len(assigned) == len(set(assigned)) and set(assigned) == names, "Unmapped workflow"
    current = {p.stem for p in Path(".github/workflows").glob("*.yml")}
    assert current == names, "Workflow inventory changed; review mapping before transition"
    seen = {}
    rows = []
    shards = {g: [] for g in GROUPS}
    counts = {"legacy_builds": 0, "shadow_builds": 0, "duplicate_tests": 0,
              "legacy_installations": 0, "shadow_installations": 0}
    for name in assigned:
        path = f".github/workflows/{name}.yml"
        old = subprocess.check_output(["git", "show", f"{BASE}:{path}"], text=True)
        now = Path(path).read_text()
        verify_transition(name, old, now)
        data = parse_yaml(old)
        group = next((g for g, ns in GROUPS.items() if name in ns), None)
        for job_id, job in data["jobs"].items():
            row = {"workflow": path, "check": job.get("name", job_id), "job": job_id,
                   "triggers": data.get("on", data.get("true")), "runner": job.get("runs-on"),
                   "permissions": job.get("permissions", data.get("permissions", {})),
                   "environment": job.get("env", {}), "steps": []}
            for index, step in enumerate(job.get("steps", [])):
                if "uses" in step:
                    row["steps"].append({"uses": step["uses"], "with": step.get("with", {}),
                                         "if": step.get("if")})
                    continue
                command = canonical(step["run"])
                env = step.get("env", {})
                record = {"step": step.get("name", f"step-{index}"), "command": command,
                          "env": env, "if": step.get("if"), "owner": "legacy"}
                row["steps"].append(record)
                if name == CORE:
                    if command.startswith("bash tests/isolation/run.sh ") and command != BUILD:
                        seen[signature(command, env)] = "core/" + record["step"]
                    continue
                if not group:
                    continue
                assert not job.get("env") and not data.get("env"), "Unexpected inherited environment"
                assert not step.get("working-directory") and not step.get("shell"), "Review execution context"
                if command == "npm ci":
                    counts["legacy_installations"] += 1
                    record["owner"] = group + "/setup"
                elif command in {BROWSER, DRAWER}:
                    record["owner"] = group + "/setup"
                elif command == BUILD:
                    counts["legacy_builds"] += 1
                    record["owner"] = group + "/build"
                elif command == "python3 tests/isolation/PublishedSmoke.py":
                    assert step.get("if"), "Live check must be conditional"
                    record["owner"] = "manual-live-only"
                else:
                    assert not step.get("if") or step["if"] == "always()", "Review conditional command"
                    assert not any("secrets." in str(value) for value in env.values()), "Secret in QA"
                    key = signature(command, env)
                    if command.startswith("bash tests/isolation/run.sh ") and key in seen:
                        counts["duplicate_tests"] += 1
                        record["owner"] = seen[key]
                    else:
                        owner = f"{group}/{name}/{job_id}/{index}"
                        record["owner"] = owner
                        shards[group].append({"id": owner, **record})
                        if command.startswith("bash tests/isolation/run.sh "):
                            seen[key] = owner
            rows.append(row)
    counts["shadow_builds"] = len(GROUPS)
    counts["shadow_installations"] = len(GROUPS)
    return {"base": BASE, "jobs": rows, "shards": shards, "counts": counts}


def run(command, env=None):
    return subprocess.run(["bash", "-e", "-o", "pipefail", "-c", command],
                          env={**os.environ, **(env or {})}, timeout=900).returncode


def write_json(path, value):
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def execute(group, plan):
    results = []
    start = time.monotonic()
    failed = False
    try:
        code = run(BUILD)
        results.append({"id": group + "/build", "exit": code})
        failed = code != 0
        for task in plan["shards"][group]:
            if failed and task["if"] != "always()":
                continue
            print(f"QUALITY {task['id']} {task['step']}", flush=True)
            tick = time.monotonic()
            code = run(task["command"], task["env"])
            results.append({"id": task["id"], "exit": code, "seconds": round(time.monotonic()-tick, 2)})
            failed |= code != 0
    finally:
        write_json(group + ".json", {"sha": git("rev-parse", "HEAD"), "group": group,
                                     "seconds": round(time.monotonic()-start, 2), "results": results})
    assert not failed, "Quality shard failed"


def verify(plan, directory):
    sha = git("rev-parse", "HEAD")
    assert not os.environ.get("GITHUB_SHA") or sha == os.environ["GITHUB_SHA"], "Unexpected checked-out SHA"
    summaries = []
    for group, tasks in plan["shards"].items():
        report = json.loads((Path(directory) / ("quality-" + group) / "quality" / (group + ".json")).read_text())
        assert report["sha"] == sha and report["group"] == group
        expected = [group + "/build", *(t["id"] for t in tasks)]
        assert [r["id"] for r in report["results"]] == expected, "Incomplete or repeated coverage"
        assert all(r["exit"] == 0 for r in report["results"]), "Failed assertion"
        summaries.append({"group":group,"commands":len(expected),"seconds":report["seconds"]})
        print(f"PASS {group}: {len(expected)} commands, {report['seconds']} seconds")
    write_json("summary.json", {"sha":sha,"counts":plan["counts"],"shards":summaries,"total_shard_seconds":round(sum(r["seconds"] for r in summaries),2)})
    print("PASS all shadow shards at exact checkout SHA; core and dependency checks required separately")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--shard", choices=GROUPS)
    parser.add_argument("--verify")
    args = parser.parse_args()
    plan = inventory()
    write_json("inventory.json", plan)
    print("QUALITY_COUNTS", json.dumps(plan["counts"], sort_keys=True))
    assert run("exit 17") == 17, "Failure propagation broken"
    # No path filter: shared code, docs, assets, CI, and unknown paths cannot skip a shard.
    for sample in ['src/components/HeroTypeTitle.tsx','src/components/SafeImage.tsx','public/assets/example.webp','docs/example.md','vite.config.ts']:
        assert set(plan['shards']) == set(GROUPS), sample
    try:
        verify(plan, OUT / 'missing-evidence-self-test')
    except FileNotFoundError:
        pass
    else:
        raise AssertionError('Missing evidence accepted')
    print('PASS unconditional scope and missing-evidence/failure guards')
    if args.shard:
        execute(args.shard, plan)
    if args.verify:
        verify(plan, args.verify)


if __name__ == "__main__":
    main()
