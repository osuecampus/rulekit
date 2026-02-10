# rulekit

CLI tool to sync shared AGENTS.md rules, prompt files, and Agent Skills into target projects. Generates editor-specific command formats for VSCode and Claude Code. Cursor reads from `.claude/commands/`.

## Quick Start

Run directly from the repository without installing (requires SSH access to GitHub):

```bash
# Sync rules, prompts, and skills to your project (auto-detects stack from .env)
npx git+ssh://git@github.com/osuecampus/rulekit.git sync

# Sync with an explicit stack
npx git+ssh://git@github.com/osuecampus/rulekit.git sync --stack vue-bootstrap --target ./my-project

# Sync only rules, prompts, or skills
npx git+ssh://git@github.com/osuecampus/rulekit.git sync --rules-only
npx git+ssh://git@github.com/osuecampus/rulekit.git sync --prompts-only
npx git+ssh://git@github.com/osuecampus/rulekit.git sync --skills-only
```

**Note:** No need to add this as a dependency in your `package.json`. `npx` will download and run it temporarily.

## Stack Detection

Rulekit auto-detects the tech stack from your project's `.env` file:

```
RULEKIT_STACK=vue-bootstrap
```

Priority: explicit `--stack` flag > `RULEKIT_STACK` in `.env` > `stack` frontmatter in target's `AGENTS.md` > `common` default.

## CLI Commands

### `sync`

```
rulekit sync [options]

Options:
  -s, --stack <name>   Tech stack (auto-detects from .env if not specified)
  -t, --target <path>  Target project directory [default: current directory]
  --rules-only         Only sync AGENTS.md files
  --prompts-only       Only sync prompt files
  --skills-only        Only sync Agent Skills
```

### `push`

Push local changes back to the rulekit repo via pull request. Requires the `gh` CLI.

```
rulekit push [options]

Options:
  -s, --stack <name>   Tech stack (auto-detects from .env if not specified)
  -t, --target <path>  Source project directory [default: current directory]
  --type <type>        What to push: rules, prompts, skills, all [default: all]
  -m, --message <msg>  PR description
```

## What Gets Synced

### Rules (AGENTS.md)

Rules are synced directly to matching directory paths in your project:

| Source | Target |
|--------|--------|
| `rules/common.md` | `AGENTS.md` |
| `rules/vue-bootstrap.md` | `AGENTS.md` (merged with common) |
| `rules/docs/common.md` | `docs/AGENTS.md` |
| `rules/src/components/vue-bootstrap.md` | `src/components/AGENTS.md` |

When using a stack like `vue-bootstrap`, common rules are merged with stack-specific rules, separated by `---`.

### Prompts

Prompts are generated for VSCode and Claude Code. Cursor reads from `.claude/commands/`:

| Source | VSCode | Claude Code (and Cursor) |
|--------|--------|--------------------------|
| `prompts/common/populate-manual-testing.md` | `.github/prompts/rulekit-populate-manual-testing.prompt.md` | `.claude/commands/rulekit-populate-manual-testing.md` |

Synced prompts use a `rulekit-` prefix to avoid conflicts with your local prompts.

### Agent Skills

Skills follow the [agentskills.io](https://agentskills.io) standard and are copied to `.claude/skills/<name>/` in your project. Skills are client-agnostic and should be committed to your project.

| Source | Target |
|--------|--------|
| `skills/rulekit-usage/` | `.claude/skills/rulekit-usage/` |

## Contributing Back

Use `rulekit push` to contribute changes back:

1. **Sync** — run `rulekit sync` to get the latest shared rules
2. **Edit** — modify AGENTS.md, prompts, or skills locally
3. **Push** — run `rulekit push` to create a PR with your changes

```bash
# After editing AGENTS.md locally
npx git+ssh://git@github.com/osuecampus/rulekit.git push --type rules -m "Updated component guidelines"
```

If the PR has merge conflicts, resolve them in GitHub's PR interface.

## Override Behavior

**Rulekit never touches:**
- `.cursor/rules/*.md` or `.cursorrules` (your local Cursor rules)
- `.github/copilot-instructions.md` (your local VSCode instructions)
- `CLAUDE.md` (your local Claude Code instructions)

Keep project-specific rules in these locations — they won't be overwritten.

---

## Adding New Tech Stacks

1. Create rule files in `rules/` named after your stack (e.g., `rules/react.md`)
2. For directory-specific rules, mirror the path: `rules/src/components/react.md`
3. Add stack-specific prompts to `prompts/<stack>/`

### Layering Strategy

Rules are merged in layers:
1. **Common layer** (`rules/common.md`) — applies to all stacks
2. **Stack layer** (`rules/<stack>.md`) — stack-specific additions

### Editor Support

| Feature | Cursor | VSCode | Claude Code |
|---------|--------|--------|-------------|
| Command files | `.claude/commands/*.md` (shared) | `.github/prompts/*.prompt.md` | `.claude/commands/*.md` |
| Extension | `.md` | `.prompt.md` | `.md` |
| Frontmatter | Uses Claude format | YAML with `name`, `description`, `agent` | Optional YAML with `description`, `allowed-tools`, `model` |

## Development

```bash
# Install dependencies
yarn install

# Build
yarn build

# Run locally
node dist/index.js sync --stack vue-bootstrap --target ./test-project
```

## License

MIT
