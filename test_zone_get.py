import urllib.request
import json
import os

token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
zone_id = "f5249271f49ed2d34cb62a00d2ad078a"

req = urllib.request.Request(
    f"https://api.cloudflare.com/client/v4/zones/{zone_id}",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
)
try:
    with urllib.request.urlopen(req) as resp:
        print("Zone get success:", resp.read().decode()[:300])
except Exception as e:
    print("Zone get Error:", e)
