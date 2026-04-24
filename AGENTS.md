# Agent Instructions

## Project Context

`secure-mac-mcp` is an early-stage repository for macOS security-oriented tooling exposed through the Model Context Protocol. The application stack is not chosen yet, so agents must avoid introducing frameworks, package managers, or runtime assumptions unless the current task explicitly requires them.

## Core Rules

- Keep changes small, intentional, and aligned with the current task.
- Inspect the repository before editing. Prefer existing conventions once they exist.
- Do not overwrite user changes. If the worktree is dirty, identify which files are related before editing or staging.
- Avoid committing generated artifacts, secrets, credentials, machine-local paths, or private security data.
- Prefer clear, boring implementations over clever abstractions.
- Update documentation when behavior, commands, configuration, APIs, permissions, or security assumptions change.

## macOS and Security Care

- Treat macOS automation, permissions, keychain access, device management, network inspection, and filesystem scanning as security-sensitive.
- Do not add code that weakens system security controls or bypasses user consent.
- Require explicit user intent before adding commands that modify system settings, install privileged helpers, request elevated permissions, or read sensitive local data.
- Document any security assumptions, required permissions, and potential privacy impact near the relevant code or in project docs.

## TDD and BDD Workflow

For any behavior change, follow a TDD/BDD loop:

- Clarify the expected behavior, acceptance criteria, edge cases, and observable outcomes before coding.
- Inspect the existing tests and reuse the project's test style, helpers, and naming conventions.
- Add missing tests or update existing tests before changing application code.
- Run the targeted tests and confirm they fail for the expected reason.
- Implement the smallest clean change that satisfies the behavior.
- Re-run the targeted tests until they pass.
- Run broader tests when the change touches shared behavior, public interfaces, security-sensitive flows, or integration points.
- Run configured quality checks such as linters, format checks, type checks, static analysis, and build checks.
- Avoid over-mocking. Prefer tests that verify observable behavior and security-relevant outcomes.

Pure documentation changes and configuration-only changes without runtime behavior may skip the red/green test cycle, but they still need appropriate verification such as `git diff --check`, config validation, status checks, or any relevant project command.

## Architecture Decision Records

- Create an ADR for durable decisions that shape future work: stack selection, MCP architecture, security model, macOS permissions, secret storage, major dependencies, packaging, distribution, or protocol boundaries.
- Do not create ADRs for local bug fixes, simple refactors, small documentation edits, or decisions already obvious from existing code and docs.
- Store ADRs in `docs/adr/NNNN-title.md`.
- Keep ADRs short and practical: status, context, decision, options considered, and consequences.
- Treat accepted ADRs as historical records. If a decision changes, create a new ADR that supersedes the old one instead of rewriting history.

## Development Workflow

- Use `rg` or `rg --files` for repository search when available.
- If a runtime stack is added, document setup, development, test, lint, and quality commands in `README.md`.
- Keep `.gitignore` current with build outputs and local tool caches.
- Record important security assumptions and operational requirements close to the code or in project documentation.

## Verification

Before finishing implementation work, run the narrowest useful verification available for the change, then expand as risk requires. If no test suite or runtime exists yet, verify with Git status and any relevant static checks, then state that no project tests are configured.

## Git Conventions

- Prefer atomic commits: one coherent intent per commit.
- Use Conventional Commits for new commits: `type(scope): summary`.
- Use common types such as `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`, and `build`.
- Use `docs:` for documentation and ADR-only changes.
- Use `test:` for test-only changes.
- Write summaries in imperative mood, lower-case after the type, and keep the first line concise.
- Add a commit body when the "why" or tradeoffs are not obvious from the diff.
- Stage only files that belong to the requested change, preferably with explicit paths.
- Review `git diff --cached` before committing.
- Preserve unrelated worktree changes.
- Prefer `main` as the default branch unless the repository configuration says otherwise.

## Notes for Future Agents

When adding the first real MCP implementation, update this file with the selected stack, command list, testing approach, quality checks, and any project-specific security boundaries.
