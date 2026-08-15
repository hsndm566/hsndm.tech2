import urllib.request
import json
import os

token = os.environ.get("RAILWAY_API_TOKEN")
url = "https://backboard.railway.com/graphql/v2"

q = '''
query {
  project(id: "233206dc-650b-48a9-a693-b427aa5beb98") {
    id
    name
    services {
      edges {
        node {
          id
          name
        }
      }
    }
  }
}
'''

req = urllib.request.Request(
    url,
    headers={
        "Project-Access-Token": token,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
    },
    data=json.dumps({"query": q}).encode("utf-8")
)
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        print("SUCCESS:", resp.read().decode())
except urllib.error.HTTPError as e:
    print("FAIL:", e.code, e.read().decode())
except Exception as e:
    print("ERROR:", e)
