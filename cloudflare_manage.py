import urllib.request
import json

zone_id = "f5249271f49ed2d34cb62a00d2ad078a"
tokens = [
    ("Token 1", "cfat_kT3VgHHyYX1DELLFJ3gnFC7yXF6t9vyzmftzMAqP1ccef33f"),
    ("Token 2", "cfat_6FeUBmiKPxKc3D2YSICZCS0AQhNuckfJJ4kFf4to6b621ae5")
]

for label, token in tokens:
    print(f"Testing {label} for DNS records...")
    req = urllib.request.Request(
        f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records",
        headers={
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            print(f"  {label} SUCCESS:", data.get("success"))
            for r in data.get("result", []):
                print(f"    {r.get('type')} {r.get('name')} -> {r.get('content')}")
    except Exception as e:
        print(f"  {label} FAILED:", e)
