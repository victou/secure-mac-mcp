# ADR 0002: Approval System

## Status

Accepted

## Context

Approval-gated tools must not run by default, but MCP stdio cannot safely use stdin/stdout for interactive prompts because those streams belong to the protocol. Approval must therefore happen out of band while remaining traceable and testable.

## Decision

Support pluggable approval providers:

- `deny`: default safe mode.
- `auto`: explicit trusted local development mode.
- `file`: writes approval requests to `.secure-mac-mcp/approvals/pending` and waits for decisions in `.secure-mac-mcp/approvals/decisions`.

Add CLI helpers for the file provider: `approval:list`, `approval:approve`, and `approval:deny`.

## Options Considered

- Prompt in the MCP process: rejected because it conflicts with stdio transport.
- Auto approval only: useful for dev but not a secure product model.
- File approval provider: simple, inspectable, testable, and compatible with a future desktop app.

## Consequences

The server stays secure by default and gains a real approval path without breaking MCP clients. The future desktop app can reuse the same request/decision model before moving to richer IPC.
