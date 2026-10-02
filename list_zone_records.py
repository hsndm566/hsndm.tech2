import urllib.request
import json
import os

token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
zone_id = "f5249271f49ed2d34cb62a00d2ad078a"

req = urllib.request.Request(
    f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records?per_page=100",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
)
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(json.dumps(data, indent=2))
except Exception as e:
    print("Error listing DNS records:", e)
