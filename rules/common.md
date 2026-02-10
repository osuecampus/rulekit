---
stack: common
---

# Common Rules

## About This File

This AGENTS.md is synced by **rulekit** — do not add project-specific rules here.
Project-specific rules belong in your editor's local config:

- **Claude Code:** `CLAUDE.md`
- **Cursor:** `.cursor/rules/*.md` or `.cursorrules`
- **GitHub Copilot:** `.github/copilot-instructions.md`

Your project-specific rules file should reference this AGENTS.md so agents observe both.

## Code Style

- Write self-documenting code with clear naming
- for js files:
  - use full jsdoc comments
  - create ts types (stored in src/types/ directory) for use in the jsdocs type annotations
  - use the types in the jsdocs type annotations
