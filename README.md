# secure-mac-mcp

Secure Mac MCP is an early-stage project for building tools around macOS security workflows through the Model Context Protocol.

The first milestone is a production-oriented local MCP server that exposes explicit, typed macOS tools through a plugin system. It uses TypeScript, Node.js, pnpm, stdio transport, strict input validation, allowlisted tools, approval hooks, and audit logging.

## Security Model

- No arbitrary shell execution.
- All actions go through typed tools and restricted adapters.
- Tool input is validated with JSON Schema before execution.
- Registered tools are explicitly allowlisted.
- Approval is deny-by-default until an approval provider is configured.
- Side effects are logged through the audit logger.
- Plugins receive only the restricted SDK context and must not access Node APIs directly.

## Getting Started

```sh
git clone git@github.com:victou/secure-mac-mcp.git
cd secure-mac-mcp
pnpm install
```

## Development

```sh
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
```

The current milestone includes the `safari.open_url` tool. It requires approval, and the default approval provider denies approval so the policy engine is active and safe by default.

For local development, you can explicitly enable automatic approval for allowlisted tools:

```sh
SECURE_MAC_MCP_APPROVAL_MODE=auto pnpm dev
```

Only use `auto` for a trusted local setup. The policy engine still validates schemas and allowlists tools, but approval-gated tools no longer stop for a user decision.

For a traceable local approval flow, use the file approval provider:

```sh
SECURE_MAC_MCP_APPROVAL_MODE=file pnpm dev
```

Approval requests are written under `.secure-mac-mcp/approvals/pending`. In another terminal, use:

```sh
pnpm approval:list
pnpm approval:approve <request-id>
pnpm approval:deny <request-id>
```

This file-based flow is the bridge toward the future desktop approval UI in `apps/desktop`.

## Claude Desktop

Add a server entry that launches the stdio MCP server:

```json
{
  "mcpServers": {
    "secure-mac-mcp": {
      "command": "pnpm",
      "args": ["--dir", "/absolute/path/to/secure-mac-mcp", "dev"],
      "env": {
        "SECURE_MAC_MCP_APPROVAL_MODE": "file"
      }
    }
  }
}
```

## VS Code mcp.json

```json
{
  "servers": {
    "secure-mac-mcp": {
      "type": "stdio",
      "command": "pnpm",
      "args": ["--dir", "/absolute/path/to/secure-mac-mcp", "dev"],
      "env": {
        "SECURE_MAC_MCP_APPROVAL_MODE": "file"
      }
    }
  }
}
```

## Monorepo Layout

- `packages/mcp-server`: stdio MCP server and request handlers.
- `packages/core`: plugin loader, registry, policy engine, approval, audit logging.
- `packages/sdk`: restricted plugin context types.
- `packages/adapters`: macOS adapters.
- `plugins/safari`: built-in Safari plugin.
- `apps/desktop`: placeholder for a future Tauri app.

## AI Collaboration

Read `AGENTS.md` before making changes. It contains the project-specific rules for AI coding agents.
