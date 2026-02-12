# PR Workflow Skill

This skill provides a systematic workflow for addressing pull request review comments from multiple sources: GitHub Copilot, SonarQube, and team reviewers.

## Contents

- **SKILL.md** - Main skill instructions for AI agents
- **pr-workflow.md** - Detailed reference documentation
- **scripts/get-pr-comments.sh** - Helper script to retrieve all PR comments

## Usage

When synced via rulekit to a project, AI agents will automatically have access to this skill. The helper script is included and can be run from the skill folder:

```bash
.claude/skills/pr-workflow/scripts/get-pr-comments.sh {PR_NUMBER}
```

## Requirements

- `gh` CLI (GitHub CLI) must be installed
- `git` must be installed  
- Repository must be authenticated with GitHub CLI

## Key Features

- Retrieves all three types of PR comments (issue, review, and reviews)
- Prioritizes feedback by severity (Critical, High, Low)
- Provides structured workflow with testing checkpoints
- Includes commit message templates
- Automated PR comment posting for summaries

## See Also

- [SKILL.md](SKILL.md) - Full skill instructions
- [pr-workflow.md](pr-workflow.md) - Detailed documentation with examples
