# Rulekit CLI Reference

## Installation

Rulekit is run directly via `npx` — no installation needed:

```bash
npx git+ssh://git@github.com/osuecampus/rulekit.git <command> [options]
```

## Commands

### `sync`

Sync shared rules, prompts, and skills from the rulekit repo into a target project.

```
rulekit sync [options]
```

**Options:**

| Flag | Description | Default |
|------|-------------|---------|
| `-s, --stack <name>` | Tech stack to use | Auto-detect from `.env`, then `common` |
| `-t, --target <path>` | Target project directory | Current working directory |
| `--rules-only` | Only sync AGENTS.md rule files | |
| `--prompts-only` | Only sync prompt/command files | |
| `--skills-only` | Only sync Agent Skills | |

**What gets synced:**

| Type | Source | Target |
|------|--------|--------|
| Rules | `rules/<stack>.md` | `AGENTS.md` (merged with common) |
| Rules | `rules/<dir>/<stack>.md` | `<dir>/AGENTS.md` |
| Prompts (VSCode) | `prompts/<stack>/*.md` | `.github/prompts/rulekit-<name>.prompt.md` |
| Prompts (Claude Code / Cursor) | `prompts/<stack>/*.md` | `.claude/commands/rulekit-<name>.md` |
| Skills | `skills/<name>/` | `.claude/skills/<name>/` |

**Examples:**

```bash
# Sync everything with auto-detected stack
rulekit sync

# Sync vue-bootstrap stack to a specific directory
rulekit sync --stack vue-bootstrap --target ./my-project

# Only sync rules
rulekit sync --rules-only

# Only sync prompts
rulekit sync --prompts-only
```

**Expected output:**

```
Syncing to: /path/to/project
Stack: vue-bootstrap (auto-detected from .env)
  → AGENTS.md
  → docs/AGENTS.md
  → src/components/AGENTS.md
✓ Rules synced
  → .github/prompts/rulekit-populate-manual-testing.prompt.md
  → .claude/commands/rulekit-populate-manual-testing.md
✓ Prompts synced
  → .claude/skills/rulekit-usage/
✓ Skills synced

Sync complete!
```

---

### `push`

Push local changes back to the rulekit repo via pull request.

```
rulekit push [options]
```

**Prerequisites:** Requires the `gh` CLI to be installed and authenticated.

**Options:**

| Flag | Description | Default |
|------|-------------|---------|
| `-s, --stack <name>` | Tech stack | Auto-detect from `.env` |
| `-t, --target <path>` | Source project directory | Current working directory |
| `--type <type>` | What to push: `rules`, `prompts`, `skills`, `all` | `all` |
| `--prompt-stack <name>` | Target stack directory for new prompts | `common` |
| `-m, --message <msg>` | PR description | |

**Examples:**

```bash
# Push all changes
rulekit push

# Push only rule changes
rulekit push --type rules

# Push with a description
rulekit push --type rules -m "Updated Vue component best practices"

# Push from a specific directory
rulekit push --target ./my-project --stack vue-bootstrap

# Push new prompts to a specific stack directory (instead of common)
rulekit push --type prompts --prompt-stack vue-bootstrap
```

**Expected output:**

```
Pushing from: /path/to/project
Stack: vue-bootstrap (auto-detected from .env)
  → Detected changes in rules
  → Created branch: push/vue-bootstrap/1707500000
  → Created PR: https://github.com/osuecampus/rulekit/pull/42

Push complete!
```

---

## Stack Detection

Rulekit resolves the stack in this order:

1. Explicit `--stack` flag (highest priority)
2. `RULEKIT_STACK` variable in the target project's `.env` file
3. `stack` frontmatter in the target project's `AGENTS.md`
4. `common` (default fallback)

**Note:** When pushing with the `common` stack inferred (not explicitly set), rulekit will ask for confirmation before creating the PR.

**`.env` example:**

```
RULEKIT_STACK=vue-bootstrap
```

## Rule Layering

Rules are merged in layers:

1. **Common layer** (`rules/common.md`) — applies to all stacks
2. **Stack layer** (`rules/<stack>.md`) — stack-specific additions

Content is separated by `---` in the output AGENTS.md.
