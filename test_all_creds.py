import urllib.request
import json
import os

tokens = [
    os.environ.get("CLOUDFLARE_API_TOKEN"),
    "cfat_kT3VgHHyYX1DELLFJ3gnFC7yXF6t9vyzmftzMAqP1ccef33f",
    "cfat_6FeUBmiKPxKc3D2YSICZCS0AQhNuckfJJ4kFf4to6b621ae5",
    "f074c31f8a8cf832875f243aee54918d",
    os.environ.get("CLOUDFLARE_GLOBAL_API_KEY")
]

endpoints = [
    "https://api.cloudflare.com/client/v4/user/tokens/verify",
    "https://api.cloudflare.com/client/v4/zones",
    "https://api.cloudflare.com/client/v4/user"
]

for idx, tok in enumerate(tokens):
    if not tok:
        continue
    print("--- Testing Credential #", idx+1, "len=", len(tok), " ---")
    for ep in endpoints:
        req = urllib.request.Request(
            ep,
            headers={
                "Authorization": "Bearer " + tok,
                "Content-Type": "application/json"
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode())
                print("  Endpoint:", ep, "-> Success:", data.get("success"))
        except urllib.error.HTTPError as e:
            print("  Endpoint:", ep, "-> HTTP Error:", e.code, e.reason)
        except Exception as e:
            print("  Endpoint:", ep, "-> Error:", e)
