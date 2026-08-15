import urllib.request
import urllib.error
import json

token = "cfat_6FeUBmiKPxKc3D2YSICZCS0AQhNuckfJJ4kFf4to6b621ae5"
zone_id = "f5249271f49ed2d34cb62a00d2ad078a"

endpoints = [
    ("User details", "https://api.cloudflare.com/client/v4/user"),
    ("Zones list", "https://api.cloudflare.com/client/v4/zones"),
    ("Zone details", f"https://api.cloudflare.com/client/v4/zones/{zone_id}"),
    ("DNS records", f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"),
]

for name, url in endpoints:
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"[OK] {name}: HTTP {resp.status}")
    except urllib.error.HTTPError as e:
        print(f"[FAIL] {name}: HTTP {e.code} - {e.read().decode()}")
    except Exception as e:
        print(f"[ERROR] {name}: {e}")
