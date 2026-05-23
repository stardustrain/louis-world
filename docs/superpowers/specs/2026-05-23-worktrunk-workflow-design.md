# Worktrunk Workflow Design

Date: 2026-05-23

## Purpose

Add a shared Worktrunk project workflow for this repository.

The workflow should make new worktrees usable quickly, keep `wt merge` guarded
by the same quality checks documented in the README, and provide shared commit
message guidance for developers who enable Worktrunk LLM commits locally.

## Context

The repository is a pnpm workspace with one game app at `apps/game`.

Relevant root scripts:

```text
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

The README says changes should pass `pnpm check` before submission. Worktrunk
can enforce the same intent locally during `wt merge`, while still splitting the
checks so failures are easier to read.

There is currently no Worktrunk project config at `.config/wt.toml`.

## Decisions

- Add `.config/wt.toml` as the shared project config.
- Keep user-specific Worktrunk settings out of the repository.
- Use `pre-start` for blocking worktree setup.
- Use `post-start` for background gitignored-file copying.
- Use split merge verification:
  - `pre-commit`: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`
  - `pre-merge`: `pnpm test`, `pnpm build`
- Use Worktrunk pipeline form (`[[pre-start]]`, `[[pre-commit]]`,
  `[[pre-merge]]`) for `pre-*` hooks.
- Add a shared `verify` alias that runs `pnpm check`.
- Add project commit-message guidance through
  `[commit.generation].template-append`.
- Do not add the Codex LLM command to `.config/wt.toml`, because that command
  belongs in each developer's user config.

## Non-Goals

- Do not edit `~/.config/worktrunk/config.toml` as part of the project config
  change.
- Do not approve Worktrunk hooks on behalf of the user.
- Do not bypass Worktrunk hook approval with `--yes`.
- Do not add dev-server auto-starting yet.
- Do not change package scripts or application code.

## Project Config Shape

Create `.config/wt.toml` with these responsibilities:

```toml
# Install dependencies before a newly created worktree is handed to the user.
[[pre-start]]
deps = "pnpm install"

# Copy gitignored files after worktree creation to reduce cold starts.
[post-start]
copy_ignored = "wt step copy-ignored"

# Run fast static checks before Worktrunk creates the merge commit.
[[pre-commit]]
lint = "pnpm lint"
format = "pnpm format:check"
typecheck = "pnpm typecheck"

# Run runtime and production-build verification before merging to the target.
[[pre-merge]]
test = "pnpm test"
build = "pnpm build"

[aliases]
verify = "pnpm check"

[commit.generation]
template-append = """
- Use conventional commit subjects such as feat:, fix:, docs:, test:, chore:.
- Match the style of recent commits in this repository.
- Keep the subject concise and describe the actual change.
- Output only the commit message.
"""
```

`pnpm install` runs in `pre-start` so a new worktree has dependencies before
follow-up commands or agents use it. `wt step copy-ignored` runs in `post-start`
because it is helpful but should not block navigation longer than necessary.

## Merge Verification

`wt merge` runs `pre-commit` before creating the squash commit and `pre-merge`
after rebase, before merging into the target branch.

The split verification keeps cheap static checks first:

- `pnpm lint` catches lint failures.
- `pnpm format:check` catches formatting drift.
- `pnpm typecheck` catches TypeScript errors.

Runtime and build checks run closer to the merge point:

- `pnpm test` runs the Vitest suite.
- `pnpm build` verifies TypeScript and the Vite production build.

This is equivalent in intent to `pnpm check`, but easier to diagnose when one
step fails.

## Commit Message Generation Boundary

Worktrunk's LLM command is user-specific and should stay in
`~/.config/worktrunk/config.toml`.

Developers who want Codex-generated Worktrunk commit messages can add this to
their user config:

```toml
[commit.generation]
command = "codex exec -m gpt-5.1-codex-mini -c model_reasoning_effort='low' -c system_prompt='' --sandbox=read-only --json - | jq -sr '[.[] | select(.item.type? == \"agent_message\")] | last.item.text'"
```

The project config only contributes shared style guidance through
`template-append`. Worktrunk will prompt for approval before using project
prompt guidance for the first time or after it changes.

## Approval And Security

Worktrunk requires approval before running project-defined hooks and aliases.
That approval is a local trust decision for the developer.

Expected first-use flow:

```bash
wt config approvals add
```

The agent should not run `wt merge --yes`, `wt switch --yes`, or
`wt hook --yes` on the user's behalf just to bypass approval prompts.

## Verification Plan

After implementation:

- Confirm `.config/wt.toml` exists.
- Run `wt hook show` to verify Worktrunk reads the configured hooks.
- Run `wt hook pre-commit --yes` to validate static checks only if the user has
  explicitly accepted the one-shot approval bypass for this verification.
- Otherwise, ask the user to approve hooks with `wt config approvals add`, then
  run `wt hook pre-commit`.
- Run `pnpm check` directly to verify the repository still passes its documented
  full check.
