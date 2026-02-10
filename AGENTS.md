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

## Testing
- Focus tests on real-world usage and edge cases that could break users' projects
- Tests should define the expected API contract — if a test breaks, it should mean something meaningful changed
- Don't test implementation details or low-impact behavior (e.g. stripping irrelevant frontmatter)
- Prefer fewer, broader scenario tests over many granular unit tests
- Keep the test file at a reasonable length — coverage comes from testing the right things, not testing everything
