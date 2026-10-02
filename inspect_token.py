import urllib.request
import json
import os

token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()

req = urllib.request.Request(
    "https://api.cloudflare.com/client/v4/user/tokens/verify",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
)
try:
    with urllib.request.urlopen(req) as resp:
        print(json.dumps(json.loads(resp.read().decode()), indent=2))
except urllib.error.HTTPError as e:
    print("Verify HTTPError:", e.code, e.read().decode())
except Exception as e:
    print("Verify Error:", e)
