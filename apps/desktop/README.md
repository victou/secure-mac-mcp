# secure-mac-mcp Desktop

Tauri approval UI for `secure-mac-mcp`.

The app reads approval requests from `.secure-mac-mcp/approvals/pending` and writes decisions to `.secure-mac-mcp/approvals/decisions`.

## Development

```sh
pnpm --filter @secure-mac-mcp/desktop install
pnpm --filter @secure-mac-mcp/desktop tauri:dev
```

Run the MCP server with the file approval provider:

```sh
SECURE_MAC_MCP_APPROVAL_MODE=file pnpm dev
```

The desktop app uses `SECURE_MAC_MCP_APPROVAL_DIR` when set. Otherwise, it defaults to `.secure-mac-mcp/approvals` from the current working directory.
