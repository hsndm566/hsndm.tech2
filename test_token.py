import urllib.request
import urllib.error
import json
import os

token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()

req = urllib.request.Request(
    "https://api.cloudflare.com/client/v4/zones",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
)
try:
    with urllib.request.urlopen(req) as resp:
        print("Zones success:", resp.read().decode())
except urllib.error.HTTPError as e:
    print("Zones HTTPError:", e.code, e.read().decode())
