import json
import os
import urllib.request


def main() -> None:
    zone_id = os.environ.get("CLOUDFLARE_ZONE_ID", "").strip()
    token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
    if not zone_id or not token:
        raise SystemExit("Set CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN before running this helper.")

    req = urllib.request.Request(
        f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())

    print("Cloudflare DNS records:", "ok" if data.get("success") else "failed")
    for record in data.get("result", []):
        print(f"{record.get('type')} {record.get('name')} -> {record.get('content')}")


if __name__ == "__main__":
    main()
