# PROJECT.md — rulekit

## Purpose

Rulekit is a CLI tool that syncs shared coding rules (AGENTS.md), prompt/command files, and Agent Skills from a central repository into consuming projects. It generates editor-specific formats for Cursor, VSCode, and Claude Code.

## Architecture

```
rulekit/
├── src/
│   ├── index.ts                          # CLI entry point (Commander.js)
│   ├── sync.ts                           # Core sync logic: rules, prompts, skills
│   ├── env.ts                            # .env-based stack detection
│   ├── push.ts                           # Push local changes back via PR
│   └── promptfile-generators/
│       ├── vscode.ts                     # VSCode .prompt.md generator
│       └── claude-code.ts                # Claude Code command generator
├── rules/                                # Rule templates, organized by directory path
│   ├── common.md                         # Common rules (all stacks)
│   ├── vue-bootstrap.md                  # Vue+Bootstrap stack rules
│   ├── docs/common.md                    # Documentation rules
│   └── src/components/vue-bootstrap.md   # Component-level rules
├── prompts/                              # Prompt templates
│   └── common/
│       └── populate-manual-testing.md
├── skills/                               # Agent Skills (agentskills.io spec)
│   └── rulekit-usage/
│       ├── SKILL.md
│       └── references/
│           └── cli-reference.md
├── AGENTS.md                             # Rules for working on rulekit itself
└── PROJECT.md                            # This file — project specification
```

## CLI Commands

### `rulekit sync`

Syncs rules, prompts, and skills from rulekit into a target project.

```
rulekit sync [options]
  -s, --stack <name>     Tech stack (default: auto-detect from .env, then 'common')
  -t, --target <path>    Target project directory (default: cwd)
  --rules-only           Only sync AGENTS.md rule files
  --prompts-only         Only sync prompt/command files
  --skills-only          Only sync Agent Skills
```

### `rulekit push`

Pushes local changes back to the rulekit repo via pull request.

```
rulekit push [options]
  -s, --stack <name>     Tech stack (default: auto-detect from .env)
  -t, --target <path>    Source project directory (default: cwd)
  --type <type>          What to push: rules, prompts, skills, all (default: all)
  -m, --message <msg>    PR description
```

## Key Concepts

### Stacks

A stack is a named collection of rules (e.g., `vue-bootstrap`, `common`). Rules are layered: common rules apply to all stacks, then stack-specific rules are appended.

### Stack Detection

Priority: explicit `--stack` flag > `RULEKIT_STACK` in target's `.env` > `stack` frontmatter in target's `AGENTS.md` > `'common'` default.

### Rule Files

Rule files live in `rules/` and are named by stack. Directory path determines target location:
- `rules/common.md` → `AGENTS.md`
- `rules/vue-bootstrap.md` → `AGENTS.md` (merged with common)
- `rules/docs/common.md` → `docs/AGENTS.md`

### Prompt Files

Prompts in `prompts/` are transformed into editor-specific formats:
- VSCode: `.github/prompts/rulekit-<name>.prompt.md`
- Claude Code: `.claude/commands/rulekit-<name>.md` (Cursor also reads from this directory)

### Agent Skills

Skills in `skills/` follow the agentskills.io spec and are copied as-is to `.claude/skills/<name>/` in consuming projects.

## Dependencies

- `commander` — CLI framework
- `fs-extra` — File system utilities
- `glob` — File pattern matching
- `gray-matter` — YAML frontmatter parsing
