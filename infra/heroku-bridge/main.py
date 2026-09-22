import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.heroku.com"
TOKEN = os.environ.get("HEROKU_API_KEY", "").strip()
ACTION = os.environ.get("HEROKU_ACTION", "account").strip().lower()
APP = os.environ.get("HEROKU_APP", "").strip()

if not TOKEN:
    raise SystemExit("HEROKU_API_KEY is required")

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.heroku+json; version=3",
    "Content-Type": "application/json",
}

def call(method, path, payload=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(API + path, data=data, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            raw = response.read().decode("utf-8")
            return response.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        try:
            detail = json.loads(raw)
        except Exception:
            detail = raw[:1000]
        print(json.dumps({"ok": False, "status": exc.code, "error": detail}, ensure_ascii=False))
        raise SystemExit(2)

def safe_app(app):
    if not isinstance(app, dict):
        return app
    keys = ("id", "name", "web_url", "region", "stack", "created_at", "updated_at")
    out = {}
    for key in keys:
        value = app.get(key)
        if isinstance(value, dict):
            out[key] = value.get("name") or value.get("id")
        else:
            out[key] = value
    return out

def main():
    if ACTION == "account":
        _, account = call("GET", "/account")
        print(json.dumps({
            "ok": True,
            "account": {
                "id": account.get("id"),
                "email": account.get("email"),
                "name": account.get("name"),
            },
        }))
        return

    if ACTION == "list_apps":
        _, apps = call("GET", "/apps")
        print(json.dumps({"ok": True, "apps": [safe_app(x) for x in apps]}))
        return

    if ACTION == "create_app":
        requested = APP or os.environ.get("HEROKU_APP_NAME", "").strip()
        payload = {}
        if requested:
            payload["name"] = requested
        region = os.environ.get("HEROKU_REGION", "").strip()
        if region:
            payload["region"] = region
        _, app = call("POST", "/apps", payload)
        print(json.dumps({"ok": True, "app": safe_app(app)}))
        return

    if not APP:
        raise SystemExit("HEROKU_APP is required for this action")

    app_q = urllib.parse.quote(APP, safe="")

    if ACTION == "get_app":
        _, app = call("GET", f"/apps/{app_q}")
        print(json.dumps({"ok": True, "app": safe_app(app)}))
        return

    if ACTION == "set_config":
        raw = os.environ.get("HEROKU_CONFIG_JSON", "{}")
        config = json.loads(raw)
        if not isinstance(config, dict):
            raise SystemExit("HEROKU_CONFIG_JSON must be a JSON object")
        _, result = call("PATCH", f"/apps/{app_q}/config-vars", config)
        print(json.dumps({"ok": True, "updated_keys": sorted(config.keys()), "returned_keys": sorted(result.keys())}))
        return

    if ACTION == "build":
        source_url = os.environ.get("HEROKU_SOURCE_URL", "").strip()
        if not source_url:
            raise SystemExit("HEROKU_SOURCE_URL is required")
        version = os.environ.get("HEROKU_SOURCE_VERSION", "").strip() or None
        source_blob = {"url": source_url}
        if version:
            source_blob["version"] = version
        payload = {"source_blob": source_blob}
        buildpacks_raw = os.environ.get("HEROKU_BUILDPACKS_JSON", "").strip()
        if buildpacks_raw:
            payload["buildpacks"] = json.loads(buildpacks_raw)
        _, build = call("POST", f"/apps/{app_q}/builds", payload)
        build_id = build["id"]
        deadline = time.time() + int(os.environ.get("HEROKU_BUILD_TIMEOUT_SECONDS", "900"))
        status = build.get("status")
        while status == "pending" and time.time() < deadline:
            time.sleep(8)
            _, build = call("GET", f"/apps/{app_q}/builds/{build_id}")
            status = build.get("status")
        print(json.dumps({
            "ok": status == "succeeded",
            "build_id": build_id,
            "status": status,
            "release_id": (build.get("release") or {}).get("id"),
            "slug_id": (build.get("slug") or {}).get("id"),
            "output_stream_url": build.get("output_stream_url"),
        }))
        if status != "succeeded":
            raise SystemExit(3)
        return

    if ACTION == "build_status":
        build_id = os.environ.get("HEROKU_BUILD_ID", "").strip()
        if not build_id:
            raise SystemExit("HEROKU_BUILD_ID is required")
        _, build = call("GET", f"/apps/{app_q}/builds/{urllib.parse.quote(build_id, safe='')}")
        print(json.dumps({
            "ok": build.get("status") == "succeeded",
            "build_id": build.get("id"),
            "status": build.get("status"),
            "release_id": (build.get("release") or {}).get("id"),
            "slug_id": (build.get("slug") or {}).get("id"),
            "output_stream_url": build.get("output_stream_url"),
        }))
        return

    if ACTION == "formations":
        _, formations = call("GET", f"/apps/{app_q}/formation")
        cleaned = []
        for item in formations:
            cleaned.append({
                "id": item.get("id"),
                "type": item.get("type"),
                "quantity": item.get("quantity"),
                "size": item.get("size"),
                "command": item.get("command"),
            })
        print(json.dumps({"ok": True, "formation": cleaned}))
        return

    if ACTION == "scale":
        process_type = os.environ.get("HEROKU_PROCESS_TYPE", "web").strip()
        quantity = int(os.environ.get("HEROKU_QUANTITY", "1"))
        size = os.environ.get("HEROKU_DYNO_SIZE", "").strip()
        payload = {"quantity": quantity}
        if size:
            payload["size"] = size
        _, formation = call("PATCH", f"/apps/{app_q}/formation/{urllib.parse.quote(process_type, safe='')}", payload)
        print(json.dumps({
            "ok": True,
            "type": formation.get("type"),
            "quantity": formation.get("quantity"),
            "size": formation.get("size"),
        }))
        return

    if ACTION == "create_addon":
        plan = os.environ.get("HEROKU_ADDON_PLAN", "").strip()
        if not plan:
            raise SystemExit("HEROKU_ADDON_PLAN is required")
        _, addon = call("POST", f"/apps/{app_q}/addons", {"plan": plan})
        print(json.dumps({
            "ok": True,
            "addon": {
                "id": addon.get("id"),
                "name": addon.get("name"),
                "plan": (addon.get("plan") or {}).get("name"),
                "state": addon.get("state"),
            },
        }))
        return

    if ACTION == "list_addons":
        _, addons = call("GET", f"/apps/{app_q}/addons")
        print(json.dumps({"ok": True, "addons": [{
            "id": x.get("id"),
            "name": x.get("name"),
            "plan": (x.get("plan") or {}).get("name"),
            "state": x.get("state"),
        } for x in addons]}))
        return

    if ACTION == "create_domain":
        hostname = os.environ.get("HEROKU_DOMAIN", "").strip()
        if not hostname:
            raise SystemExit("HEROKU_DOMAIN is required")
        _, domain = call("POST", f"/apps/{app_q}/domains", {"hostname": hostname})
        print(json.dumps({
            "ok": True,
            "domain": {
                "id": domain.get("id"),
                "hostname": domain.get("hostname"),
                "cname": domain.get("cname"),
                "status": domain.get("status"),
            },
        }))
        return

    if ACTION == "list_domains":
        _, domains = call("GET", f"/apps/{app_q}/domains")
        print(json.dumps({"ok": True, "domains": [{
            "id": x.get("id"),
            "hostname": x.get("hostname"),
            "cname": x.get("cname"),
            "status": x.get("status"),
        } for x in domains]}))
        return

    raise SystemExit(f"Unsupported HEROKU_ACTION: {ACTION}")

if __name__ == "__main__":
    main()
