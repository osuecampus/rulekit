---
name: pr-workflow
description: Systematically retrieve, analyze, and address PR review comments from GitHub Copilot, SonarQube, and team reviewers using a structured workflow with proper commit messages and summary posting.
metadata:
  version: "1.0.0"
  requires: ["gh CLI", "git"]
  sources: ["GitHub Copilot", "SonarQubeCloud", "Team Reviewers"]
---

# Pull Request Review Workflow - AI Skill Instructions

You are an expert at systematically addressing pull request review comments using a structured, thorough workflow.

## Your Mission

When asked to address PR review comments:

1. **Retrieve** all comments from ALL sources (not just what GitHub MCP returns)
2. **Analyze** and prioritize comments by severity and impact
3. **Plan** fixes systematically and get user confirmation
4. **Implement** fixes with proper testing and validation
5. **Commit** changes with informative messages
6. **Summarize** what was addressed and why in a PR comment

## Critical Knowledge: Comment Sources

Pull request feedback comes from **three distinct sources** that require different retrieval methods:

### 1. Issue Comments (General PR-Level Feedback)

- **Who:** SonarQubeCloud bot, team members posting general feedback
- **Where:** PR conversation thread
- **Retrieved by:** GitHub MCP tool OR GitHub CLI

### 2. Review Comments (Inline Code Comments) ⚠️ CRITICAL

- **Who:** GitHub Copilot (`Copilot` user), team members with code-specific feedback
- **Where:** Specific lines in changed files
- **Contains:** File path, line number, code suggestions in ```suggestion blocks
- **Retrieved by:** **GitHub CLI ONLY** - NOT returned by GitHub MCP tools

### 3. Reviews (Review Summaries)

- **Who:** Copilot review bot, team members' formal reviews
- **Where:** Review submission with state (COMMENTED/APPROVED/CHANGES_REQUESTED)
- **Retrieved by:** GitHub MCP tool OR GitHub CLI

## Workflow Process

### Step 1: Retrieve ALL PR Comments

**REQUIRED:** Use the helper script to get comments from all three sources:

```bash
.claude/skills/pr-workflow/scripts/get-pr-comments.sh {PR_NUMBER}
```

This script retrieves:

- Issue comments (`/issues/{pr}/comments`)
- **Inline review comments** (`/pulls/{pr}/comments`) ← NOT in GitHub MCP!
- Review summaries (`/pulls/{pr}/reviews`)

**Why this matters:** The GitHub MCP `github-pull-request_issue_fetch` tool does NOT return inline review comments. You MUST use GitHub CLI or the helper script to get Copilot's line-specific feedback.

### Step 2: Analyze and Create Action Plan

Review all retrieved comments and create a structured plan:

```markdown
## PR Review Action Plan

### 🔴 Critical (Must Fix Before Merge)

- [ ] **File.vue:123** - WCAG violation: keyboard trap
- [ ] **Service.js:45** - Security: exposed credentials

### 🟡 High Priority (Should Fix)

- [ ] **Component.vue:89** - Copilot: Remove dead code
- [ ] **styles.css:116** - Unused CSS selector

### 🟢 Low Priority (Consider)

- [ ] **Module.js:200** - Style: Refactor for clarity

### ⏭️ Will Not Address

- **Item X** - Reason: Low confidence suggestion, alternative approach preferred
```

**Present this plan to the user and WAIT for confirmation before proceeding.**

#### Priority Definitions

**🔴 Critical:**

- WCAG violations (accessibility issues)
- Security vulnerabilities
- Functional bugs identified by reviewers
- Breaking changes

**🟡 High Priority:**

- Code quality issues from SonarQube
- Inline suggestions from Copilot/reviewers
- Test coverage gaps
- Documentation errors

**🟢 Low Priority:**

- Code style preferences
- Low-confidence suggestions (often in `<details>` sections)
- Optional improvements

### Step 3: Implement Fixes

Once the plan is confirmed:

1. **Work through issues by priority** (Critical → High → Low)
2. **Use `multi_replace_string_in_file`** for independent changes across multiple files
3. **Test after each category** of fixes:
   ```bash
   yarn build          # Verify build succeeds
   yarn test           # Run unit tests
   ```
4. **Keep changes focused and minimal** - only address the specific issue
5. **Validate with `get_errors`** tool after editing files

#### Manual Testing for Accessibility Fixes

- Test keyboard navigation (Tab, Shift+Tab, Enter, Escape)
- Verify focus indicators are visible
- Confirm screen reader announcements (if applicable)

### Step 4: Commit Changes

Commit each file individually with informative messages following this format:

```bash
git add {file}
git commit -m "fix(component): Brief description

Addresses PR #{NUMBER} review comment by @{reviewer}
- Specific change made
- Reason for change

Fixes: {file}:{line}"
```

**Commit Message Format:**

```
<type>(<scope>): <subject>

<body>

Fixes: <file>:<line>
```

**Types:**

- `fix(scope):` - Bug fixes and corrections
- `refactor(scope):` - Code improvements without behavior change
- `docs(scope):` - Documentation changes
- `style(scope):` - Code style/formatting
- `test(scope):` - Test additions/fixes

**Requirements:**

- Include PR number and reviewer attribution
- Explain **what** changed and **why**
- Reference specific file and line number

**Example:**

```
refactor(a11y): Remove keyboard trap from DiagramPanel

Addresses PR #13 review comment by @Copilot
- Remove Tab key preventDefault to allow natural focus exit
- Comply with WCAG 2.1 SC 2.1.2 (No Keyboard Trap)

Fixes: src/components/DiagramPanel.vue:166
```

### Step 5: Wait for User to Push

After committing all changes, inform the user:

```
All changes have been committed. Please push to the remote repository:

  git push origin <branch-name>

Once pushed, I'll post a summary comment to the PR.
```

**DO NOT proceed to Step 6 until the user confirms they have pushed.**

### Step 6: Post Summary Comment to PR

After changes are pushed to the remote, compose and post a summary comment using GitHub CLI:

```bash
gh pr comment {PR_NUMBER} --body "$(cat <<'COMMENT'
## Review Comments Addressed

### ✅ Fixed

**Issue 1: Remove keyboard trap** (Line 166 in src/components/DiagramPanel.vue)
- Fixed by: Removed Tab key preventDefault to allow natural focus flow
- Complies with WCAG 2.1 SC 2.1.2
- Commit: abc1234

**Issue 2: Remove unused CSS selector** (Line 116 in src/css/style.css)
- Fixed by: Deleted dead selector targeting role="button"
- Commit: def5678

### ⏭️ Not Addressed

**Issue 3: Event coupling suggestion**
- Reason: Low confidence suggestion. Current implementation maintains clear data flow and is well-tested.
COMMENT
)"
```

**Summary Comment Format:**

```markdown
## Review Comments Addressed

### ✅ Fixed

**Issue: {Brief description}** (Line {number} in {file})

- Fixed by: {description of change}
- Commit: {SHA}

### ⏭️ Not Addressed

**Issue: {Brief description}**

- Reason: {clear explanation why not addressed}
```

## Helper Script Reference

The skill includes `scripts/get-pr-comments.sh` which retrieves all three comment types:

```bash
#!/bin/bash
# Usage: .claude/skills/pr-workflow/scripts/get-pr-comments.sh {PR_NUMBER}

PR=$1
OWNER=$(gh repo view --json owner -q .owner.login)
REPO=$(gh repo view --json name -q .name)

echo "=== Issue Comments (General PR Feedback) ==="
gh api repos/$OWNER/$REPO/issues/$PR/comments \
  --jq '.[] | {author: .user.login, created: .created_at, body: .body[0:200]}'

echo -e "\n=== Review Comments (Inline Code Feedback) ==="
gh api repos/$OWNER/$REPO/pulls/$PR/comments \
  --jq '.[] | {author: .user.login, path, line, body: .body[0:200]}'

echo -e "\n=== Reviews (Review Summaries) ==="
gh api repos/$OWNER/$REPO/pulls/$PR/reviews \
  --jq '.[] | {author: .user.login, state, body: .body[0:200]}'
```

## Implementation Best Practices

### Batching Changes

**Batch together in one commit:**

- Independent fixes to different files that address the same category
- Multiple low-priority style fixes

**Separate into individual commits:**

- Critical fixes vs. improvements
- Fixes that affect the same workflow/feature
- Changes requiring different types of testing

### Example Multi-File Fix

```javascript
multi_replace_string_in_file([
  {
    filePath: "/path/to/Component.vue",
    oldString: "// old code with context...",
    newString: "// new fixed code..."
  },
  {
    filePath: "/path/to/styles.css",
    oldString: "/* old CSS with context... */",
    newString: "/* fixed CSS... */"
  }
]);
```

### Testing Checkpoints

After implementing fixes in each priority category:

```bash
# Check for errors
yarn build 2>&1 | grep -i error

# Run tests
yarn test

# Check specific file for linting
yarn lint {file}
```

## GitHub CLI Commands Reference

### Retrieve Comments Manually

```bash
# Issue comments (general PR feedback)
gh api repos/{owner}/{repo}/issues/{PR}/comments \
  --jq '.[] | {author: .user.login, body}'

# Review comments (inline code feedback) ⚠️ CRITICAL
gh api repos/{owner}/{repo}/pulls/{PR}/comments \
  --jq '.[] | {author: .user.login, path, line, body}'

# Reviews (review summaries)
gh api repos/{owner}/{repo}/pulls/{PR}/reviews \
  --jq '.[] | {author: .user.login, state, body}'
```

### Post PR Comment

```bash
# Simple comment
gh pr comment {PR_NUMBER} --body "Your comment here"

# Multi-line comment from heredoc
gh pr comment {PR_NUMBER} --body "$(cat <<'EOF'
## Summary
- Item 1
- Item 2
EOF
)"
```

## Common Pitfalls to Avoid

❌ **DON'T:**

- Rely only on GitHub MCP tools - you'll miss inline review comments
- Skip the action plan and confirmation step
- Batch all commits together - group logically instead
- Post the PR summary before changes are pushed
- Ignore low-confidence suggestions without explanation
- Mark tasks complete if `get_errors` shows issues

✅ **DO:**

- Always use the helper script or GitHub CLI for complete comment retrieval
- Present a prioritized plan and wait for user confirmation
- Commit changes with descriptive messages including PR/reviewer attribution
- Test after each category of fixes
- Explain why comments were not addressed in the PR summary
- Validate all changes with `get_errors` before claiming completion

## Quick Reference Card

| Need                         | Tool/Command                                           |
| ---------------------------- | ------------------------------------------------------ |
| All PR comments at once      | `.claude/skills/pr-workflow/scripts/get-pr-comments.sh {PR}` |
| PR metadata & issue comments | `github-pull-request_issue_fetch` or GitHub CLI        |
| **Inline code comments**     | **GitHub CLI ONLY** - `gh api .../pulls/{pr}/comments` |
| Review summaries             | GitHub CLI or GitHub MCP                               |
| Post PR comment              | `gh pr comment {PR} --body "..."`                      |
| Validate changes             | `get_errors` tool                                      |

## Example: Complete Workflow

```markdown
User: "Address the review comments on PR #13"

Agent:

1. Run: .claude/skills/pr-workflow/scripts/get-pr-comments.sh 13
2. Parse results:
   - 1 issue comment (SonarQube: Quality gate passed)
   - 3 inline review comments from Copilot:
     - Critical: Keyboard trap (WCAG violation)
     - High: Dead CSS selector
     - High: Screen reader timeout too short
   - 1 review summary from copilot-pull-request-reviewer[bot]
3. Present action plan with priorities
4. [Wait for user confirmation]
5. Implement critical fix → test → commit
6. Implement high priority fixes → test → commit
7. Run get_errors to validate
8. Inform user to push changes
9. [Wait for user to push]
10. Post summary comment to PR #13 with gh pr comment
```

## Summary

This skill ensures you:

- **Never miss inline code comments** by using GitHub CLI
- **Work systematically** through prioritized feedback
- **Communicate clearly** with structured plans and summaries
- **Commit properly** with informative messages
- **Validate thoroughly** before claiming completion

Always remember: **GitHub MCP tools do NOT return inline review comments.** Use the helper script or GitHub CLI to get the complete picture.
