import urllib.request
import json

token = "cfat_6FeUBmiKPxKc3D2YSICZCS0AQhNuckfJJ4kFf4to6b621ae5"

req = urllib.request.Request(
    "https://api.cloudflare.com/client/v4/user/tokens/verify",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
)
try:
    with urllib.request.urlopen(req) as resp:
        print(json.dumps(json.loads(resp.read().decode()), indent=2))
except Exception as e:
    print("Error:", e)
