---
name: rulekit-usage
description: Teaches AI agents how to use rulekit CLI — sync rules/prompts/skills down, push changes back via PR.
metadata:
  version: "0.1.0"
  repository: "https://github.com/osuecampus/rulekit"
---

# Rulekit Usage

Rulekit syncs shared coding rules (AGENTS.md), prompt/command files, and Agent Skills from a central repository into consuming projects.

## Commands

### `rulekit sync`

Pulls rules, prompts, and skills from the rulekit repo into the current project.

```bash
# Sync everything using auto-detected stack
npx git+ssh://git@github.com/osuecampus/rulekit.git sync

# Sync with explicit stack
npx git+ssh://git@github.com/osuecampus/rulekit.git sync --stack vue-bootstrap

# Sync only rules, prompts, or skills
npx git+ssh://git@github.com/osuecampus/rulekit.git sync --rules-only
npx git+ssh://git@github.com/osuecampus/rulekit.git sync --prompts-only
npx git+ssh://git@github.com/osuecampus/rulekit.git sync --skills-only
```

### `rulekit push`

Pushes local changes back to the rulekit repo via pull request. Requires the `gh` CLI. Supports both updating existing prompts/skills and contributing new ones.

```bash
# Push all changes
npx git+ssh://git@github.com/osuecampus/rulekit.git push

# Push only rule changes with a message
npx git+ssh://git@github.com/osuecampus/rulekit.git push --type rules -m "Update Vue component guidelines"

# Push new prompts to a specific stack directory (defaults to common)
npx git+ssh://git@github.com/osuecampus/rulekit.git push --type prompts --prompt-stack vue-bootstrap
```

Push reads `rulekit-*` prompt files from all client locations (`.claude/commands/`, `.cursor/commands/`, `.github/prompts/`) and deduplicates by name. New prompts and skills that don't yet exist in rulekit are included in the PR.

## Workflow

1. **Pull** — run `rulekit sync` to get the latest shared rules, prompts, and skills
2. **Edit** — modify AGENTS.md, prompts, or skills locally as needed
3. **Push** — run `rulekit push` to contribute changes back via PR

## Stack Detection

Rulekit auto-detects the tech stack from `.env`:

```
RULEKIT_STACK=vue-bootstrap
```

Priority: explicit `--stack` flag > `RULEKIT_STACK` in `.env` > `stack` frontmatter in target's `AGENTS.md` > `'common'` default.

## Where to Put Project-Specific Rules

Shared rules live in `AGENTS.md` (synced by rulekit). Project-specific rules go in editor config files:

| Editor | File |
|--------|------|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursor/rules/*.md` or `.cursorrules` |
| GitHub Copilot | `.github/copilot-instructions.md` |

Your project-specific rules file should mention AGENTS.md so agents observe both shared and local rules.

## Conflict Resolution

When pushing changes, rulekit creates a PR on GitHub. If the PR has merge conflicts, resolve them in GitHub's PR interface. The PR-based workflow ensures changes are reviewed before merging.

## Reference

See `references/cli-reference.md` for detailed CLI documentation.
