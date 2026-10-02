import urllib.request
import json
import os

token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()

req = urllib.request.Request(
    "https://api.cloudflare.com/client/v4/user/tokens/verify",
    headers={
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    }
)
try:
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read().decode())
        print("Verify:", data)
except urllib.error.HTTPError as e:
    print("Verify HTTP Error:", e.code, e.reason, e.read().decode())
except Exception as e:
    print("Verify Error:", e)
