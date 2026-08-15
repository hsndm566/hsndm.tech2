import urllib.request
import json
import os

token = os.environ.get("RAILWAY_API_TOKEN")
if not token:
    print("No RAILWAY_API_TOKEN found in environment.")
    exit(0)

url = "https://backboard.railway.com/graphql/v2"

queries = [
    'query { me { id name email } }',
    'query { projectToken { projectId environmentId } }',
    'query { projects { edges { node { id name } } } }'
]

for q in queries:
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        data=json.dumps({"query": q}).encode("utf-8")
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            print(f"QUERY SUCCESS ({q[:35]}):", resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"QUERY FAIL ({q[:35]}):", e.code, e.read().decode())
    except Exception as e:
        print(f"QUERY ERROR ({q[:35]}):", e)
