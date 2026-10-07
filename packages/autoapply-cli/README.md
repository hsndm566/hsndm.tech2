# AutoApply SA CLI

A dependency-free Node.js command-line client for the public, read-only AutoApply SA API.

## Commands

```sh
node bin/autoapply.mjs api health
node bin/autoapply.mjs api product
node bin/autoapply.mjs api plans
```

Use `--base-url URL` to point to a compatible test server. The default is `https://www.hsndm.tech/api/v1`. The tool does not upload CVs, read candidate accounts, submit applications, or make payments.

## Distribution status

The package source is prepared in this repository. It is not yet published to npm. After the npm package name and owner are confirmed, publish this package and update the developer page with the registry install command.
