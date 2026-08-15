import urllib.request
import urllib.error

url = "https://api.hsndm.tech/"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        print("Status:", resp.status)
        print("Headers:", dict(resp.headers))
        print("Body snippet:", resp.read().decode()[:300])
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code, e.reason)
    print("Headers:", dict(e.headers))
    print("Body snippet:", e.read().decode()[:300])
except Exception as e:
    print("Error:", e)
