# ADR 0003: Desktop Approval UI

## Status

Accepted

## Context

The file approval provider gives `secure-mac-mcp` a safe out-of-band approval flow, but approving from a terminal is not the final user experience. macOS users need a clear local interface that shows pending actions and records decisions without interfering with MCP stdio.

## Decision

Use `apps/desktop` as a Tauri app that reads pending approval requests and writes approval decisions using the same `.secure-mac-mcp/approvals` file contract.

The first desktop increment is intentionally small:

- list pending approval requests,
- show tool name, summary, timestamps, and input,
- approve or deny a request,
- keep the same file provider as the source of truth.

## Options Considered

- Prompt directly from the MCP server: rejected because MCP stdio owns stdin/stdout.
- Terminal-only file approvals: safe but not a production user experience.
- Tauri app over the file approval contract: preserves the secure boundary and prepares future native UX.

## Consequences

The desktop UI can evolve independently from the MCP runtime. Later increments can replace file polling with IPC while preserving the approval request and decision model.
