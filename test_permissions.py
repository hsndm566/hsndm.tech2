import urllib.request
import json

token = "cfat_6FeUBmiKPxKc3D2YSICZCS0AQhNuckfJJ4kFf4to6b621ae5"

req = urllib.request.Request(
    "https://api.cloudflare.com/client/v4/graphql",
    data=json.dumps({"query": "{ viewer { zones(filter: {zoneTag: \"f5249271f49ed2d34cb62a00d2ad078a\"}) { zoneTag } } }"}).encode(),
    headers={
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    },
    method="POST"
)
try:
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read().decode())
        print("GraphQL viewer zones:", data)
except urllib.error.HTTPError as e:
    print("GraphQL HTTP Error:", e.code, e.reason, e.read().decode())
except Exception as e:
    print("GraphQL Error:", e)
