import urllib.request
import json

token = "cfat_6FeUBmiKPxKc3D2YSICZCS0AQhNuckfJJ4kFf4to6b621ae5"

req = urllib.request.Request(
    "https://api.cloudflare.com/client/v4/user/tokens/verify",
    headers={
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    }
)
try:
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read().decode())
        print("Verify:", data)
except urllib.error.HTTPError as e:
    print("Verify HTTP Error:", e.code, e.reason, e.read().decode())
except Exception as e:
    print("Verify Error:", e)
