# Security action required

A repository audit on 2026-09-04 found Cloudflare API credentials embedded in historical utility scripts in this public repository.

Required production action:

1. Revoke every Cloudflare API token/key that was ever committed to this repository.
2. Create a new least-privilege token only for the deployment operations that require it.
3. Store the replacement only in the deployment platform or GitHub Actions secret store.
4. Never place replacement credentials in source, examples, test fixtures, documentation, client bundles, or commit messages.

Removing the current files alone is not sufficient because public Git history may retain old values. Rotation is mandatory.
