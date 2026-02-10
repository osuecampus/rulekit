# AGENTS.md

## Setup commands
- Install deps: `yarn install`

## Code style
- Use functional patterns where possible
- Follow existing module boundaries

## Important
- The `rules/` directory contains **template rule files** for target projects, NOT instructions for this repo
- Files like `rules/vue-bootstrap.md` are synced to target projects as `AGENTS.md` - they should be ignored when working on rulekit itself
- If requirements change, update `PROJECT.md` to keep it in sync
- The rulekit Agent Skill (`skills/rulekit-usage/SKILL.md`) must stay in sync with any CLI or API changes
- When changing sync or push functionality, keep tests in `src/__tests__/` in sync with the new behavior
