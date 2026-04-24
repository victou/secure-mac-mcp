# Agent Instructions

## Project Context

`secure-mac-mcp` is an early-stage repository for macOS security-oriented tooling exposed through the Model Context Protocol. The application stack is not chosen yet, so agents should avoid introducing frameworks, package managers, or runtime assumptions unless the current task explicitly requires them.

## Core Rules

- Keep changes small, intentional, and aligned with the current task.
- Inspect the repository before editing. Prefer existing conventions once they exist.
- Do not overwrite user changes. If the worktree is dirty, identify which files are related before editing or staging.
- Avoid committing generated artifacts, secrets, credentials, machine-local paths, or private security data.
- Prefer clear, boring implementations over clever abstractions.

## macOS and Security Care

- Treat macOS automation, permissions, keychain access, device management, network inspection, and filesystem scanning as security-sensitive.
- Do not add code that weakens system security controls or bypasses user consent.
- Require explicit user intent before adding commands that modify system settings, install privileged helpers, request elevated permissions, or read sensitive local data.
- Document any security assumptions, required permissions, and potential privacy impact near the relevant code or in project docs.

## Development Workflow

- Use `rg` or `rg --files` for repository search when available.
- Add or update tests when behavior is introduced or changed.
- If a runtime stack is added, document setup, development, and test commands in `README.md`.
- Keep `.gitignore` current with build outputs and local tool caches.

## Verification

Before finishing implementation work, run the narrowest useful verification available for the change. If no test suite or runtime exists yet, verify with Git status and any relevant static checks, then state that no project tests are configured.

## Git Conventions

- Prefer atomic commits: one coherent intent per commit.
- Use Conventional Commits for new commits: `type(scope): summary`.
- Use common types such as `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`, and `build`.
- Write summaries in imperative mood, lower-case after the type, and keep the first line concise.
- Add a commit body when the "why" or tradeoffs are not obvious from the diff.
- Stage only files that belong to the requested change, preferably with explicit paths.
- Review `git diff --cached` before committing.
- Preserve unrelated worktree changes.
- Prefer `main` as the default branch unless the repository configuration says otherwise.

## Notes for Future Agents

When adding the first real MCP implementation, update this file with the selected stack, command list, testing approach, and any project-specific security boundaries.
