import urllib.request
import json

token = "cfat_6FeUBmiKPxKc3D2YSICZCS0AQhNuckfJJ4kFf4to6b621ae5"
zone_id = "f5249271f49ed2d34cb62a00d2ad078a"

sub_endpoints = [
    f"https://api.cloudflare.com/client/v4/zones/{zone_id}",
    f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records",
    f"https://api.cloudflare.com/client/v4/zones/{zone_id}/settings",
    f"https://api.cloudflare.com/client/v4/zones/{zone_id}/ssl/universal/settings"
]

for ep in sub_endpoints:
    req = urllib.request.Request(
        ep,
        headers={
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode())
            print("Endpoint:", ep, "-> Success:", data.get("success"))
    except urllib.error.HTTPError as e:
        print("Endpoint:", ep, "-> HTTP Error:", e.code, e.reason)
    except Exception as e:
        print("Endpoint:", ep, "-> Error:", e)
