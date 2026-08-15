import urllib.request
import urllib.error
import json

token = "cfat_6FeUBmiKPxKc3D2YSICZCS0AQhNuckfJJ4kFf4to6b621ae5"
zone_id = "f5249271f49ed2d34cb62a00d2ad078a"

url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"
req = urllib.request.Request(
    url,
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
)
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print("SUCCESS:", json.dumps(data, indent=2))
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code, e.reason)
    print("Body:", e.read().decode())
except Exception as e:
    print("Error:", e)
