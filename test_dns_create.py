import urllib.request
import json
import os

token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
zone_id = "f5249271f49ed2d34cb62a00d2ad078a"

payload = {
    "type": "CNAME",
    "name": "api.hsndm.tech",
    "content": "autoapply-sa-production.up.railway.app",
    "proxied": False
}

req = urllib.request.Request(
    f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records",
    data=json.dumps(payload).encode(),
    headers={
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read().decode())
        print("Create DNS Success:", data)
except urllib.error.HTTPError as e:
    print("Create DNS HTTP Error:", e.code, e.reason, e.read().decode())
except Exception as e:
    print("Create DNS Error:", e)
