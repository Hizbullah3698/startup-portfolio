# -*- coding: utf-8 -*-
"""
Backend verification tests -- Parts 1, 2, 3, 4, and 5.

Strategy:
  - Tests use the real PostgreSQL connection via a live uvicorn subprocess.
  - Test records are created then explicitly deleted at the end.
  - No mock/fake database -- DB-level constraints are fully exercised.
  - Authentication checks (Part 5) verify protected access.

Run:
    python test_app.py
"""

import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

# ---------------------------------------------------------------------------
# Output helpers
# ---------------------------------------------------------------------------
GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"
BOLD = "\033[1m"

passed: list[str] = []
failed: list[str] = []


def ok(name: str) -> None:
    passed.append(name)
    print(f"  {GREEN}PASS{RESET}  {name}")


def fail(name: str, reason: str) -> None:
    failed.append(name)
    print(f"  {RED}FAIL{RESET}  {name} -- {reason}")


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------
BASE = "http://127.0.0.1:8001"


def _req(
    path: str,
    method: str = "GET",
    data: dict | str | None = None,
    token: str | None = None,
    ct: str = "application/json",
) -> tuple[int, object]:
    if isinstance(data, dict):
        body = json.dumps(data).encode()
    elif isinstance(data, str):
        body = data.encode()
    else:
        body = None

    headers = {}
    if body:
        headers["Content-Type"] = ct
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(
        f"{BASE}{path}", data=body, headers=headers, method=method
    )
    try:
        res = urllib.request.urlopen(req, timeout=5)
        raw = res.read()
        return res.getcode(), json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read()
        return e.code, json.loads(raw) if raw else {}


def get(path: str, token: str | None = None) -> tuple[int, object]:
    return _req(path, token=token)


def post(
    path: str, data: dict | str, token: str | None = None, ct: str = "application/json"
) -> tuple[int, object]:
    return _req(path, "POST", data, token=token, ct=ct)


def put(path: str, data: dict, token: str | None = None) -> tuple[int, object]:
    return _req(path, "PUT", data, token=token)


def delete(path: str, token: str | None = None) -> int:
    code, _ = _req(path, "DELETE", token=token)
    return code


def html_code(path: str) -> int:
    try:
        return urllib.request.urlopen(f"{BASE}{path}", timeout=5).getcode()
    except Exception:
        return 0


# ---------------------------------------------------------------------------
# Server lifecycle
# ---------------------------------------------------------------------------
def start_server() -> subprocess.Popen:
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    proc = subprocess.Popen(
        [
            sys.executable,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            "127.0.0.1",
            "--port",
            "8001",
        ],
        cwd=os.path.dirname(os.path.abspath(__file__)),
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    for _ in range(25):
        try:
            urllib.request.urlopen(f"{BASE}/api/health", timeout=1)
            return proc
        except Exception:
            time.sleep(0.3)
    proc.terminate()
    raise RuntimeError("Server did not start in time.")


# ---------------------------------------------------------------------------
# Test payloads
# ---------------------------------------------------------------------------
SAMPLE_PROJECT = {
    "title": "Test Project Alpha",
    "slug": "test-project-alpha",
    "description": "A test project used only during automated verification.",
    "category": "AI",
    "technologies": ["Python", "FastAPI"],
    "image_url": None,
    "github_url": "https://github.com/example/test",
    "live_url": None,
    "featured": False,
}
SAMPLE_PROJECT2 = {
    **SAMPLE_PROJECT,
    "slug": "test-project-beta",
    "title": "Test Project Beta",
}

SAMPLE_SERVICE = {
    "title": "API Development & Integration",
    "slug": "api-development-integration",
    "description": "Custom FastAPI backend development, database architecture, and REST/GraphQL API design.",
    "icon": "code-bracket",
    "featured": True,
    "display_order": 1,
}
SAMPLE_SERVICE2 = {
    "title": "Full-Stack Web Development",
    "slug": "full-stack-web-development",
    "description": "Modern frontend with Next.js integrated with high-performance Python backends.",
    "icon": "globe",
    "featured": False,
    "display_order": 2,
}

SAMPLE_TESTIMONIAL = {
    "client_name": "Jane Doe",
    "client_role": "CTO",
    "company": "TechCorp",
    "content": "Delivered our backend API ahead of schedule with exceptional quality.",
    "rating": 5,
    "avatar_url": "https://example.com/avatar.jpg",
    "featured": True,
    "display_order": 1,
}

SAMPLE_CONTACT = {
    "name": "Alex Smith",
    "email": "alex.smith@example.com",
    "subject": "Inquiry regarding API project",
    "message": "We would like to hire your team for building our SaaS backend system.",
}


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------
def run_tests() -> bool:
    # ---- Part 1 ----
    print(f"\n{BOLD}=== PART 1 -- Core Endpoints ==={RESET}")

    code, body = get("/")
    if code == 200 and isinstance(body, dict) and body.get("status") == "online":
        ok("GET / returns 200 with status=online")
    else:
        fail("GET /", f"code={code}")

    code, body = get("/api/health")
    if code == 200 and isinstance(body, dict) and body.get("status") == "ok":
        ok("GET /api/health returns 200")
    else:
        fail("GET /api/health", f"code={code}")

    if html_code("/docs") == 200:
        ok("GET /docs returns 200")
    else:
        fail("GET /docs", "not 200")

    if html_code("/redoc") == 200:
        ok("GET /redoc returns 200")
    else:
        fail("GET /redoc", "not 200")

    # ---- Part 2 ----
    print(f"\n{BOLD}=== PART 2 -- Database Health ==={RESET}")

    code, body = get("/api/db-health")
    if code == 200 and isinstance(body, dict) and body.get("connected") is True:
        ok("GET /api/db-health -- PostgreSQL connected")
    elif code == 200:
        fail(
            "GET /api/db-health",
            f"connected=False -- {body.get('detail') if isinstance(body, dict) else body}",
        )
    else:
        fail("GET /api/db-health", f"code={code}")

    # ---- Part 5: Auth ----
    print(f"\n{BOLD}=== PART 5 -- Authentication ==={RESET}")
    token = None

    login_data = urllib.parse.urlencode(
        {"username": "admin", "password": "adminpass123"}
    )
    code, body = post(
        "/api/auth/login", login_data, ct="application/x-www-form-urlencoded"
    )
    if code == 200 and isinstance(body, dict) and "access_token" in body:
        token = body["access_token"]
        ok("POST /api/auth/login -- successfully authenticated as admin")
        if "adminpass123" in str(body):
            fail("POST /api/auth/login", "Password leaked in response!")
            return False
    else:
        fail("POST /api/auth/login", f"code={code} body={body}")

    code, body = post(
        "/api/auth/login",
        urllib.parse.urlencode({"username": "bad", "password": "x"}),
        ct="application/x-www-form-urlencoded",
    )
    if code == 401:
        ok("POST /api/auth/login (bad username) -> 401")
    else:
        fail("POST bad username", f"expected 401, got {code}")

    code, body = post("/api/projects/", SAMPLE_PROJECT)
    if code == 401:
        ok("POST /api/projects/ (no token) -> 401")
    else:
        fail("POST /api/projects/ no token", f"expected 401, got {code}")

    code, body = post("/api/projects/", SAMPLE_PROJECT, token="invalid-token123")
    if code == 401:
        ok("POST /api/projects/ (invalid token) -> 401")
    else:
        fail("POST /api/projects/ invalid token", f"expected 401, got {code}")

    # ---- Part 3 ----
    print(f"\n{BOLD}=== PART 3 -- Projects CRUD ==={RESET}")

    p1_id: int | None = None
    p2_id: int | None = None

    # Create
    code, body = post("/api/projects/", SAMPLE_PROJECT, token=token)
    if (
        code == 201
        and isinstance(body, dict)
        and body.get("slug") == SAMPLE_PROJECT["slug"]
    ):
        p1_id = body["id"]
        ok(f"POST /api/projects/ (auth) -- created id={p1_id}")
    else:
        fail("POST /api/projects/", f"code={code} body={body}")

    # Duplicate slug -> 409
    code, _ = post("/api/projects/", SAMPLE_PROJECT, token=token)
    if code == 409:
        ok("POST duplicate project slug -> 409 Conflict")
    else:
        fail("POST duplicate project slug", f"expected 409, got {code}")

    # Create second
    code, body = post("/api/projects/", SAMPLE_PROJECT2, token=token)
    if code == 201 and isinstance(body, dict):
        p2_id = body["id"]
        ok(f"POST second project -- id={p2_id}")
    else:
        fail("POST second project", f"code={code}")

    # List (public)
    code, body = get("/api/projects/")
    if code == 200 and isinstance(body, list):
        ok(f"GET /api/projects/ (public) -- returned {len(body)} item(s)")
    else:
        fail("GET /api/projects/", f"code={code}")

    # Pagination
    code, body = get("/api/projects/?skip=0&limit=1")
    if code == 200 and isinstance(body, list) and len(body) <= 1:
        ok("Pagination ?skip=0&limit=1 -- at most 1 result")
    else:
        fail(
            "Pagination",
            f"code={code} len={len(body) if isinstance(body, list) else '?'}",
        )

    # Category filter match
    code, body = get("/api/projects/?category=AI")
    if (
        code == 200
        and isinstance(body, list)
        and all(p["category"] == "AI" for p in body)
    ):
        ok("Category filter ?category=AI -- all results match")
    else:
        fail("Category filter (match)", f"code={code}")

    # Category filter no match
    code, body = get("/api/projects/?category=NonExistent999")
    if code == 200 and body == []:
        ok("Category filter (no match) -> empty list")
    else:
        fail("Category filter (no match)", f"code={code} body={body}")

    # Get single (public)
    if p1_id:
        code, body = get(f"/api/projects/{p1_id}")
        if code == 200 and isinstance(body, dict) and body["id"] == p1_id:
            ok(f"GET /api/projects/{p1_id} (public) -- found")
        else:
            fail(f"GET /api/projects/{p1_id}", f"code={code}")

    # 404
    code, _ = get("/api/projects/999999")
    if code == 404:
        ok("GET /api/projects/999999 -> 404 Not Found")
    else:
        fail("GET 404", f"expected 404, got {code}")

    # Update
    if p1_id:
        # Check unauth
        code, _ = put(
            f"/api/projects/{p1_id}", {"title": "Updated Title", "featured": True}
        )
        if code == 401:
            ok("PUT /api/projects/ (no token) -> 401")
        else:
            fail("PUT /api/projects/ (no token)", f"expected 401, got {code}")

        code, body = put(
            f"/api/projects/{p1_id}",
            {"title": "Updated Title", "featured": True},
            token=token,
        )
        if (
            code == 200
            and isinstance(body, dict)
            and body["title"] == "Updated Title"
            and body["featured"] is True
        ):
            ok(f"PUT /api/projects/{p1_id} (auth) -- title + featured updated")
        else:
            fail(f"PUT /api/projects/{p1_id}", f"code={code} body={body}")

    # Update to duplicate slug -> 409
    if p1_id and p2_id:
        code, _ = put(
            f"/api/projects/{p1_id}", {"slug": SAMPLE_PROJECT2["slug"]}, token=token
        )
        if code == 409:
            ok("PUT with duplicate project slug -> 409 Conflict")
        else:
            fail("PUT duplicate project slug", f"expected 409, got {code}")

    # DELETE
    if p1_id:
        # Check unauth
        code = delete(f"/api/projects/{p1_id}")
        if code == 401:
            ok("DELETE /api/projects/ (no token) -> 401")

        code = delete(f"/api/projects/{p1_id}", token=token)
        if code == 204:
            ok(f"DELETE /api/projects/{p1_id} (auth) -> 204 No Content")
        else:
            fail(f"DELETE /api/projects/{p1_id}", f"code={code}")

        code, _ = get(f"/api/projects/{p1_id}")
        if code == 404:
            ok("Deleted project confirmed 404")
        else:
            fail("Deleted project should be 404", f"got {code}")

    if p2_id:
        delete(f"/api/projects/{p2_id}", token=token)

    # ---- Part 4: Services ----
    print(f"\n{BOLD}=== PART 4 -- Services CRUD ==={RESET}")

    s1_id: int | None = None
    s2_id: int | None = None

    # Create service
    code, body = post("/api/services/", SAMPLE_SERVICE, token=token)
    if (
        code == 201
        and isinstance(body, dict)
        and body.get("slug") == SAMPLE_SERVICE["slug"]
    ):
        s1_id = body["id"]
        ok(f"POST /api/services/ (auth) -- created id={s1_id}")
    else:
        fail("POST /api/services/", f"code={code} body={body}")

    # Duplicate service slug -> 409
    code, _ = post("/api/services/", SAMPLE_SERVICE, token=token)
    if code == 409:
        ok("POST duplicate service slug -> 409 Conflict")
    else:
        fail("POST duplicate service slug", f"expected 409, got {code}")

    # Create second service
    code, body = post("/api/services/", SAMPLE_SERVICE2, token=token)
    if code == 201 and isinstance(body, dict):
        s2_id = body["id"]
        ok(f"POST second service -- id={s2_id}")
    else:
        fail("POST second service", f"code={code}")

    # List services
    code, body = get("/api/services/")
    if code == 200 and isinstance(body, list):
        ok(f"GET /api/services/ (public) -- returned {len(body)} item(s)")
    else:
        fail("GET /api/services/", f"code={code}")

    # Get service
    if s1_id:
        code, body = get(f"/api/services/{s1_id}")
        if code == 200 and isinstance(body, dict) and body["id"] == s1_id:
            ok(f"GET /api/services/{s1_id} (public) -- found")
        else:
            fail(f"GET /api/services/{s1_id}", f"code={code}")

    # Update service
    if s1_id:
        # Check unauth
        code, _ = put(f"/api/services/{s1_id}", {"title": "x"})
        if code == 401:
            ok("PUT /api/services/ (no token) -> 401")

        code, body = put(
            f"/api/services/{s1_id}",
            {"title": "Updated Service Title", "display_order": 10},
            token=token,
        )
        if (
            code == 200
            and isinstance(body, dict)
            and body["title"] == "Updated Service Title"
            and body["display_order"] == 10
        ):
            ok(f"PUT /api/services/{s1_id} (auth) -- title + display_order updated")
        else:
            fail(f"PUT /api/services/{s1_id}", f"code={code} body={body}")

    # Delete service
    if s1_id:
        code = delete(f"/api/services/{s1_id}")
        if code == 401:
            ok("DELETE /api/services/ (no token) -> 401")

        code = delete(f"/api/services/{s1_id}", token=token)
        if code == 204:
            ok(f"DELETE /api/services/{s1_id} (auth) -> 204 No Content")
        else:
            fail(f"DELETE /api/services/{s1_id}", f"code={code}")

        code, _ = get(f"/api/services/{s1_id}")
        if code == 404:
            ok("Deleted service confirmed 404")
        else:
            fail("Deleted service should be 404", f"got {code}")

    if s2_id:
        delete(f"/api/services/{s2_id}", token=token)

    # ---- Part 4: Testimonials ----
    print(f"\n{BOLD}=== PART 4 -- Testimonials CRUD ==={RESET}")

    t1_id: int | None = None

    # Create testimonial
    code, body = post("/api/testimonials/", SAMPLE_TESTIMONIAL, token=token)
    if (
        code == 201
        and isinstance(body, dict)
        and body.get("client_name") == SAMPLE_TESTIMONIAL["client_name"]
    ):
        t1_id = body["id"]
        ok(f"POST /api/testimonials/ (auth) -- created id={t1_id}")
    else:
        fail("POST /api/testimonials/", f"code={code} body={body}")

    # List testimonials
    code, body = get("/api/testimonials/")
    if code == 200 and isinstance(body, list):
        ok(f"GET /api/testimonials/ (public) -- returned {len(body)} item(s)")
    else:
        fail("GET /api/testimonials/", f"code={code}")

    # Get single
    if t1_id:
        code, body = get(f"/api/testimonials/{t1_id}")
        if code == 200 and isinstance(body, dict) and body["id"] == t1_id:
            ok(f"GET /api/testimonials/{t1_id} (public) -- found")
        else:
            fail(f"GET /api/testimonials/{t1_id}", f"code={code}")

    # Update testimonial
    if t1_id:
        code, _ = put(f"/api/testimonials/{t1_id}", {"rating": 4})
        if code == 401:
            ok("PUT /api/testimonials/ (no token) -> 401")

        code, body = put(
            f"/api/testimonials/{t1_id}",
            {"rating": 4, "company": "Updated Corp"},
            token=token,
        )
        if (
            code == 200
            and isinstance(body, dict)
            and body["rating"] == 4
            and body["company"] == "Updated Corp"
        ):
            ok(f"PUT /api/testimonials/{t1_id} (auth) -- rating + company updated")
        else:
            fail(f"PUT /api/testimonials/{t1_id}", f"code={code} body={body}")

    # Delete testimonial
    if t1_id:
        code = delete(f"/api/testimonials/{t1_id}")
        if code == 401:
            ok("DELETE /api/testimonials/ (no token) -> 401")

        code = delete(f"/api/testimonials/{t1_id}", token=token)
        if code == 204:
            ok(f"DELETE /api/testimonials/{t1_id} (auth) -> 204 No Content")
        else:
            fail(f"DELETE /api/testimonials/{t1_id}", f"code={code}")

        code, _ = get(f"/api/testimonials/{t1_id}")
        if code == 404:
            ok("Deleted testimonial confirmed 404")
        else:
            fail("Deleted testimonial should be 404", f"got {code}")

    # ---- Part 4: Contact Inquiries ----
    print(f"\n{BOLD}=== PART 4 -- Contact Inquiries API ==={RESET}")

    c1_id: int | None = None

    # Submit contact inquiry (public)
    code, body = post("/api/contact/", SAMPLE_CONTACT)
    if code == 201 and isinstance(body, dict) and body.get("status") == "new":
        c1_id = body["id"]
        ok(
            f"POST /api/contact/ -- created inquiry id={c1_id} with status='new' (public)"
        )
    else:
        fail("POST /api/contact/", f"code={code} body={body}")

    # List inquiries (admin)
    code, _ = get("/api/contact/")
    if code == 401:
        ok("GET /api/contact/ (no token) -> 401")

    code, body = get("/api/contact/", token=token)
    if code == 200 and isinstance(body, list):
        ok(f"GET /api/contact/ (auth) -- returned {len(body)} inquiry(s)")
    else:
        fail("GET /api/contact/", f"code={code}")

    # Get single inquiry
    if c1_id:
        code, _ = get(f"/api/contact/{c1_id}")
        if code == 401:
            ok(f"GET /api/contact/{c1_id} (no token) -> 401")

        code, body = get(f"/api/contact/{c1_id}", token=token)
        if code == 200 and isinstance(body, dict) and body["id"] == c1_id:
            ok(f"GET /api/contact/{c1_id} (auth) -- found")
        else:
            fail(f"GET /api/contact/{c1_id}", f"code={code}")

    # Update inquiry status
    if c1_id:
        code, _ = put(f"/api/contact/{c1_id}", {"status": "read"})
        if code == 401:
            ok("PUT /api/contact/ (no token) -> 401")

        code, body = put(f"/api/contact/{c1_id}", {"status": "read"}, token=token)
        if code == 200 and isinstance(body, dict) and body["status"] == "read":
            ok(f"PUT /api/contact/{c1_id} (auth) -- status updated to 'read'")
        else:
            fail(f"PUT /api/contact/{c1_id}", f"code={code} body={body}")

    # Delete inquiry
    if c1_id:
        code = delete(f"/api/contact/{c1_id}")
        if code == 401:
            ok("DELETE /api/contact/ (no token) -> 401")

        code = delete(f"/api/contact/{c1_id}", token=token)
        if code == 204:
            ok(f"DELETE /api/contact/{c1_id} (auth) -> 204 No Content")
        else:
            fail(f"DELETE /api/contact/{c1_id}", f"code={code}")

        code, _ = get(f"/api/contact/{c1_id}", token=token)
        if code == 404:
            ok("Deleted inquiry confirmed 404")
        else:
            fail("Deleted inquiry should be 404", f"got {code}")

    # ---- Part 6A -- Admin Endpoints ----
    print(f"\n{BOLD}=== PART 6A -- Admin Endpoints ==={RESET}")

    code, _ = get("/api/auth/me")
    if code == 401:
        ok("GET /api/auth/me (no token) -> 401")
    else:
        fail("GET /api/auth/me (no token)", f"expected 401, got {code}")

    code, body = get("/api/auth/me", token=token)
    if code == 200 and isinstance(body, dict) and body.get("username") == "admin":
        ok("GET /api/auth/me (auth) -> 200 with admin user details")
    else:
        fail("GET /api/auth/me (auth)", f"code={code} body={body}")

    code, _ = get("/api/admin/stats")
    if code == 401:
        ok("GET /api/admin/stats (no token) -> 401")
    else:
        fail("GET /api/admin/stats (no token)", f"expected 401, got {code}")

    code, body = get("/api/admin/stats", token=token)
    if (
        code == 200
        and isinstance(body, dict)
        and "total_projects" in body
        and "total_services" in body
        and "total_testimonials" in body
        and "total_inquiries" in body
    ):
        ok("GET /api/admin/stats (auth) -> 200 with dashboard metrics")
    else:
        fail("GET /api/admin/stats (auth)", f"code={code} body={body}")

    # Summary
    total = len(passed) + len(failed)
    print(f"\n{BOLD}{'='*50}{RESET}")
    print(
        f"Results: {GREEN}{len(passed)} passed{RESET}  {RED}{len(failed)} failed{RESET}  / {total} total"
    )
    if failed:
        print(f"\n{RED}Failed tests:{RESET}")
        for name in failed:
            print(f"  - {name}")
        return False
    print(f"\n{GREEN}{BOLD}ALL TESTS PASSED{RESET}")
    return True


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print(f"{BOLD}Starting verification server on port 8001...{RESET}")
    srv = start_server()
    try:
        success = run_tests()
    finally:
        srv.terminate()
        srv.wait()
        print(f"\n{BOLD}Server stopped.{RESET}")
    sys.exit(0 if success else 1)
