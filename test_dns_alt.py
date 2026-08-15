import urllib.request
import json

token = "cfat_6FeUBmiKPxKc3D2YSICZCS0AQhNuckfJJ4kFf4to6b621ae5"
zone_id = "f5249271f49ed2d34cb62a00d2ad078a"

url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"

# Test with various header combinations
headers_list = [
    {"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    {"X-Auth-Email": "Hasanadam506@gmail.com", "X-Auth-Key": token, "Content-Type": "application/json"}
]

for i, h in enumerate(headers_list):
    req = urllib.request.Request(url, headers=h)
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"Attempt {i} SUCCESS:", resp.status)
            data = json.loads(resp.read().decode())
            print("Records count:", len(data.get("result", [])))
    except Exception as e:
        print(f"Attempt {i} ERROR:", e)
