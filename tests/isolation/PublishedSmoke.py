"""Only the published HTML and compact JPEG; no browser, backend or redirects."""
import json
import runpy
from pathlib import Path
from urllib.request import Request, build_opener, HTTPRedirectHandler
class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None
qa = runpy.run_path(str(Path(__file__).resolve().parents[1] / "social-sharing-smoke.py"))
opener = build_opener(NoRedirect())
remaining = 128_000
results = []
for url, mime, validator in [(qa["BASE"], "text/html", lambda x: qa["check_html"](x.decode("utf-8"))), (qa["IMAGE"], "image/jpeg", qa["check_jpeg"])]:
    with opener.open(Request(url, headers={"User-Agent":"WhatsApp/2.22.20.72 A","Accept-Encoding":"identity"}), timeout=15) as response:
        assert response.status == 200 and response.geturl() == url
        assert response.headers.get_content_type() == mime
        assert int(response.headers.get("Content-Length","0")) <= remaining
        body = response.read(remaining+1)
        assert len(body) <= remaining, "Published smoke budget exceeded"
        remaining -= len(body)
        validator(body)
        results.append({"mime":mime,"bytes":len(body)})
print(json.dumps({"status":"PASS","requests":2,"body_bytes":128000-remaining,"budget_bytes":128000,"backend_requests":0,"responses":results}))
