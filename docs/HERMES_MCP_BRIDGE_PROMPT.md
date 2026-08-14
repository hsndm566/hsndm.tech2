# Hermes MCP bridge: generation brief and connection contract

## Purpose

This document is a copy-ready brief for Hermes. Its objective is to create a **small, auditable bridge** that lets an approved external MCP client work with selected Hermes capabilities on the user's laptop. It is deliberately not a general remote-control agent. The bridge must expose only the user's approved memory, tool, and named-secret workflows, with durable audit records and confirmation for consequential actions.

> **Connection constraint:** An MCP server launched on a laptop through `stdio` can be used by a local client that starts that process, but it cannot be reached directly by a remote service. For an external client to connect while Hermes remains on the laptop, Hermes must also expose a secure, public HTTPS Streamable HTTP endpoint and the laptop must remain awake, online, and running the bridge. MCP standardizes both newline-delimited `stdio` and Streamable HTTP transports. [1]

## Prompt to send to Hermes

```text
Build a production-minded, local-first MCP bridge named `hermes-mcp-bridge` for my personal Hermes assistant. The bridge must be written in TypeScript for Node.js 22+, use the official @modelcontextprotocol/sdk, validate inputs with Zod, and have comprehensive Vitest tests. Do not use a legacy SSE-only transport.

Goal
Create a narrow MCP interface that an external agent can use to work with Hermes memory, registered Hermes tools, and individually approved secret references. The bridge is not a remote shell, browser controller, filesystem browser, database browser, email sender, deployment engine, or unrestricted key dump. Implement only the tools listed below unless I add a tool explicitly later.

Transports
1. Implement `stdio` as the default local transport. It must emit MCP JSON-RPC only to stdout; diagnostics and logs must go to stderr.
2. Implement Streamable HTTP at POST `/mcp` for a remote client. Bind to `127.0.0.1` by default. Do not bind to `0.0.0.0` unless `HERMES_MCP_ALLOW_REMOTE=true` is set and a valid TLS-terminated public URL is explicitly configured.
3. Provide GET `/healthz`, returning only version, uptime, and transport readiness. It must never return memory content, tool schemas containing private data, token values, or secret names.
4. Use a current MCP protocol version and document the version in the README. Use UTF-8 JSON-RPC and Streamable HTTP according to the MCP specification.

Authentication and authorization
1. For HTTP, require `Authorization: Bearer <token>` for every `/mcp` request. Read the token only from `HERMES_MCP_TOKEN`; never accept it as a query parameter and never print it.
2. Generate the token with the operating system cryptographic random generator. Support token rotation by allowing `HERMES_MCP_PREVIOUS_TOKEN` with a short, configurable expiry. Audit every authentication failure without logging token material.
3. Use a capability allowlist per token. Supported scopes are `memory:read`, `memory:write`, `tools:read`, `tools:invoke`, `secrets:list-names`, `secrets:request`, and `audit:read`. Deny all scopes by default.
4. Require explicit local-user confirmation for every action tool invocation and every secret request. A confirmation is single-use, has a short expiry, is bound to the exact tool name plus normalized arguments, and cannot be reused for a different operation.
5. Make remote HTTP use HTTPS only in production. Reject private-IP, link-local, localhost, and cloud-metadata targets in any URL argument. Do not forward client bearer tokens to Hermes tools or third-party services.

MCP tools to expose
1. `hermes_status()` -> returns bridge version, available transport mode, and non-sensitive enabled scope names.
2. `memory_search({ query, namespace?, limit? })` -> returns a maximum of 10 relevant snippets. Require `memory:read`. Never return an entire memory namespace or an unrestricted archive dump.
3. `memory_get({ memory_id })` -> returns one specifically requested memory item. Require `memory:read` and verify namespace ownership.
4. `memory_upsert({ namespace, key, content, mode })` -> append or replace one bounded item in an allowlisted namespace. Require `memory:write`, confirmation, content length limits, and an audit entry. Do not permit overwriting Hermes system instructions.
5. `tool_catalog()` -> returns an allowlisted tool catalog containing tool name, human description, risk level (`read` or `action`), and JSON input schema. Require `tools:read`.
6. `tool_invoke({ tool_name, input, confirmation_id })` -> invokes only a tool in a server-side allowlist. Require `tools:invoke` and a valid explicit confirmation for `action` tools. Validate `input` against the registered Zod schema, enforce a timeout, redact sensitive fields from logs, and return a concise structured result.
7. `secret_list_names()` -> returns only allowlisted secret names and metadata such as owner, purpose, and whether one-time exposure is permitted. Require `secrets:list-names`. Never return values.
8. `secret_request({ secret_name, purpose, confirmation_id })` -> request access to one allowlisted secret by name. Require `secrets:request`, a valid confirmation, and a local on-screen approval. By default return a short-lived opaque secret handle that can be used only by an approved Hermes-side tool. Return a raw value only when that specific secret has `allowRawExternalExposure=true`, the local user approves the exact `purpose`, and the response is marked non-cacheable and redacted from logs. Never support list-all, wildcard, environment dump, or bulk export.
9. `audit_recent({ limit? })` -> returns the caller's own recent audit records without secret values or memory content. Require `audit:read`.

Persistence, audit, and safety requirements
1. Persist audit events locally in a tamper-evident append-only file or database. Record time, authenticated client identity, requested scope, tool name, success/failure, confirmation ID hash, and a redacted argument summary. Never store tokens, secret values, full memory text, or raw CV/customer data in audit logs.
2. Implement global rate limits, per-token rate limits, request-size limits, tool-specific timeouts, and graceful shutdown. Use structured JSON logs to stderr.
3. Keep an explicit, version-controlled allowlist for memory namespaces, Hermes tools, and secret names. Default everything else to denied.
4. Do not run shell commands, browse the web, read arbitrary files, install packages at runtime, access the clipboard, or create network tunnels from an MCP tool.
5. Add a `--dry-run` mode for `tool_invoke` so read-only validation is possible before an action is approved.

Project deliverables
1. A clean repository with `src/`, `tests/`, `README.md`, `.env.example`, and an MIT license.
2. `README.md` must contain local stdio setup, local HTTP setup, production HTTPS/tunnel guidance, token rotation, scope configuration, confirmation UX, auditing, and shutdown instructions.
3. Include `mcp-config.local.json` for a local stdio client and `mcp-config.remote.example.json` for a remote Streamable HTTP client. Do not put real credentials in either file.
4. Include tests proving: unauthorized HTTP is rejected; scope enforcement works; confirmation is single-use and argument-bound; secret names do not reveal values; raw secret exposure is denied by default; arbitrary tools and namespaces are denied; logging redacts secret-like values; and stdio output remains valid JSON-RPC.
5. Add npm scripts: `dev`, `build`, `start:stdio`, `start:http`, `test`, `check`, and `lint`.
6. End by printing a concise operator handoff containing the exact local command, the exact public HTTPS URL shape required for an external client, and the minimum configuration data I need to provide to connect it.

Do not create or expose any cloud resource, tunnel, public endpoint, token, or secret automatically. Stop after generating the repository and local tests; I will decide how and when to run it.
```

## Remote connection contract after Hermes completes the build

The direct connection path requires an HTTPS endpoint such as `https://hermes-mcp.example.com/mcp`. The laptop should run the bridge locally and expose it only through an approved TLS-terminating reverse proxy or tunnel. The external connector will use a bearer token in the `Authorization` header and a strict capability list. Remote authorization should validate the exact audience and never pass incoming tokens through to downstream services. [2] [3]

| Item | Required value or behavior | Do not do this |
|---|---|---|
| Endpoint | A stable public HTTPS URL ending in `/mcp` | Share a `localhost` URL or an unencrypted HTTP URL. |
| Authentication | A newly generated bearer token kept in a secret field | Put a token in the URL, a repository, a chat message, or logs. |
| Runtime | Laptop is powered, awake, connected, and bridge process is healthy | Expect a remote client to start a local `stdio` process. |
| Scope | Begin with `memory:read`, `tools:read`, and one named tool; expand only after verification | Grant every tool, every memory namespace, or unrestricted secret access. |
| Secrets | Opaque handles by default; individually approved raw exposure only where essential | Add an environment or key-vault dump tool. |
| Observability | Audit every request with redacted metadata and expose `/healthz` | Log memory bodies, bearer tokens, or secret values. |

When Hermes has generated and locally tested the bridge, provide its **public HTTPS MCP URL**, its **transport**, and the scope names to enable. Do not paste the bearer token in normal chat. It should be supplied through a secure connector configuration field so it is not displayed in command history. A key-authenticated remote MCP server is configured with a custom-form connector and an `Authorization` header after the user reviews it. [4]

## References

[1] [Model Context Protocol: Transport Overview](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports)

[2] [Model Context Protocol: Authorization Tutorial](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/authorization)

[3] [Model Context Protocol: Security Best Practices](https://modelcontextprotocol.io/specification/draft/basic/security_best_practices)

[4] [Manus connector configuration guidance](https://help.manus.im/)
