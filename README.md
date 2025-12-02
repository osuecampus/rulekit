# rulekit

CLI tool to sync shared AGENTS.md rules and prompt files into target projects. Generates editor-specific formats for Cursor and VSCode.

## Quick Start

```bash
# Sync rules and prompts to your project
npx rulekit sync --stack vue --target ./my-project

# Sync only rules
npx rulekit sync --stack vue --rules-only

# Sync only prompts
npx rulekit sync --stack common --prompts-only
```

## CLI Options

```
rulekit sync [options]

Options:
  -s, --stack <name>   Tech stack to use (vue, nuxt, common) [default: common]
  -t, --target <path>  Target project directory [default: current directory]
  --prompts-only       Only sync prompt files
  --rules-only         Only sync AGENTS.md files
```

## What Gets Synced

### Rules (AGENTS.md)
Rules are synced directly to matching directory paths in your project:

| Source | Target |
|--------|--------|
| `stacks/common/AGENTS.md` | `AGENTS.md` |
| `stacks/common/docs/AGENTS.md` | `docs/AGENTS.md` |
| `stacks/vue/src/components/AGENTS.md` | `src/components/AGENTS.md` |

When using a stack like `vue`, common rules are merged with stack-specific rules.

### Prompts
Prompts are generated for both Cursor and VSCode:

| Source | Cursor | VSCode |
|--------|--------|--------|
| `prompts/common/populate-manual-testing.md` | `.cursor/commands/rulekit-populate-manual-testing.md` | `.github/prompts/rulekit-populate-manual-testing.prompt.md` |

Synced prompts use a `rulekit-` prefix to avoid conflicts with your local prompts.

## Override Behavior

**Rulekit never touches:**
- `.cursor/rules/*.md` or `.cursorrules` (your local Cursor rules)
- `.github/copilot-instructions.md` (your local VSCode instructions)

Keep project-specific rules in these locations - they won't be overwritten.

---

## Roadmap

### Adding New Tech Stacks

1. Create a directory under `stacks/` (e.g., `stacks/react/`)
2. Mirror the target project structure with `AGENTS.md` files
3. Add stack-specific prompts to `prompts/<stack>/`

Example structure for a new `react` stack:
```
stacks/react/
├── AGENTS.md                    # Root-level React rules
└── src/
    └── components/
        └── AGENTS.md            # React component rules
```

### Layering Strategy

Rules are merged in layers:
1. **Common layer** (`stacks/common/`) - applies to all stacks
2. **Stack layer** (`stacks/<stack>/`) - stack-specific additions

For each directory path, common content comes first, followed by stack content separated by `---`.

### Contributing Prompts

Add prompts to:
- `prompts/common/` - prompts useful for any project
- `prompts/<stack>/` - stack-specific prompts

### Editor Support

| Feature | Cursor | VSCode |
|---------|--------|--------|
| Command files | `.cursor/commands/*.md` | `.github/prompts/*.prompt.md` |
| Extension | `.md` | `.prompt.md` |
| Frontmatter | None required | YAML with `name`, `description`, `agent` |

## Development

```bash
# Install dependencies
yarn install

# Build
yarn build

# Run locally
node dist/index.js sync --stack vue --target ./test-project
```

## License

MIT

