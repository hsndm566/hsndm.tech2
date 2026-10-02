import urllib.request
import json
import os

token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()

for header_name in ["Authorization", "X-Auth-Key", "X-API-Key"]:
    req = urllib.request.Request(
        "https://api.cloudflare.com/client/v4/zones",
        headers={
            header_name: f"Bearer {token}" if header_name == "Authorization" else token,
            "Content-Type": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode())
            print(f"Header {header_name} -> Success:", data.get("success"))
    except urllib.error.HTTPError as e:
        print(f"Header {header_name} -> HTTP Error:", e.code, e.reason)
    except Exception as e:
        print(f"Header {header_name} -> Error:", e)
