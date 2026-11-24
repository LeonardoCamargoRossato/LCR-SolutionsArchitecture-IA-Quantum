#!/usr/bin/env bash
set -euo pipefail
python3 - <<'PY'
import json, os, subprocess
from pathlib import Path
report = dict(event='namespace-start', sha=os.environ['GITHUB_SHA'], scenario=os.environ['LCR_SCENARIO'], namespace=os.environ['LCR_NETNS_ID'], interfaces=json.loads(subprocess.check_output(['ip','-j','link','show'])), routes=json.loads(subprocess.check_output(['ip','-j','route','show'])))
assert [i['ifname'] for i in report['interfaces']] == ['lo']
assert not any(r.get('dst') == 'default' for r in report['routes'])
with open(os.environ['LCR_NETWORK_LOG'],'a') as f: f.write(json.dumps(report)+'\n')
PY
node tests/isolation/FixtureServer.mjs &
fixture=$!
cleanup() { kill "$fixture" 2>/dev/null || true; wait "$fixture" 2>/dev/null || true; }
trap cleanup EXIT
python3 - <<'PY'
import time, urllib.request
for _ in range(100):
    try:
        with urllib.request.urlopen('http://127.0.0.1:54321/health', timeout=1) as r:
            assert r.status == 200
            break
    except OSError: time.sleep(.1)
else: raise SystemExit('Fixture server failed')
PY
rc=0
"$@" || rc=$?
python3 - <<'PY' || rc=1
import json, os, subprocess
p=os.environ['LCR_NETWORK_LOG']
with open(p) as f: rows=[json.loads(l) for l in f]
links=json.loads(subprocess.check_output(['ip','-j','link','show']))
assert [i['ifname'] for i in links] == ['lo']
blocked=[r for r in rows if r.get('event') == 'blocked']
summary=dict(event='namespace-end', sha=os.environ['GITHUB_SHA'], scenario=os.environ['LCR_SCENARIO'], interfaces=['lo'], non_loopback_interfaces=0, external_egress_possible=False, blocked_attempts=len(blocked), unexpected_attempts=sum(not r['expected'] for r in blocked))
with open(p,'a') as f: f.write(json.dumps(summary)+'\n')
print(json.dumps(summary))
assert not summary['unexpected_attempts'], 'Unexpected external requests were blocked'
PY
exit "$rc"
