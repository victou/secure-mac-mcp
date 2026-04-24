# ADR 0001: TypeScript Node Monorepo

## Status

Accepted

## Context

`secure-mac-mcp` needs a secure local MCP runtime for macOS automation. The server must use stdio transport, support typed plugins, validate inputs, enforce policy, and remain extensible for future clients and a possible desktop app.

The MCP TypeScript SDK currently has a stable v1 line suitable for production use, while newer split package APIs are still evolving.

## Decision

Use a pnpm monorepo with TypeScript and Node.js:

- `packages/mcp-server` for the stdio MCP server.
- `packages/core` for loader, registry, policy, approval, and audit logging.
- `packages/sdk` for the restricted plugin context contract.
- `packages/adapters` for macOS side-effect boundaries.
- `plugins/*` for built-in and future plugins.
- `apps/desktop` as an optional phase 2 placeholder.

Use the production MCP TypeScript SDK v1 package, stdio transport, JSON Schema manifests, AJV validation, strict TypeScript, Vitest, ESLint, and Prettier.

## Options Considered

- TypeScript + Node + pnpm: best fit for MCP SDK support, plugin typing, and monorepo ergonomics.
- Bun package manager with Node runtime: viable, but adds less conventional production tooling for this repository.
- Python MCP server: good ecosystem, but conflicts with the requested TypeScript plugin architecture.

## Consequences

The project gets a type-safe and modular baseline with clear package boundaries. Plugins remain constrained by the SDK context, and side effects stay behind adapters. Future work must keep production runtime behavior compatible with Node.js and avoid adding plugin-level access to arbitrary Node APIs.
