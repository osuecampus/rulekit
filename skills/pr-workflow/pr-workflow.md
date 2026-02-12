# Pull Request Review Workflow

This document defines the workflow for retrieving and addressing PR review comments from multiple sources.

## Comment Sources

Pull request feedback comes from three distinct sources:

1. **GitHub Copilot** (`copilot-pull-request-reviewer[bot]`, `Copilot`)
2. **SonarQubeCloud** (`sonarqubecloud[bot]`)
3. **Team Reviewers** (human developers)

## Standard Workflow Process

When asked to retrieve and address comments on an active PR, follow these steps:

### Step 1: Retrieve PR Comments

Use the helper script to get all comments from all sources:

```bash
./scripts/get-pr-comments.sh {PR_NUMBER}
```

This retrieves:

- Issue comments (general PR-level feedback)
- Inline review comments (code-specific feedback) ← **Critical: Not in GitHub MCP!**
- Review summaries (overall review state)

### Step 2: Create Action Plan

Analyze all comments and create a plan that:

- Lists each comment/issue
- Assigns priority (Critical/High/Low)
- Proposes to either address or ignore with justification
- Groups related fixes together

Present this plan and wait for confirmation before proceeding.

### Step 3: Implement Fixes

Once the plan is confirmed:

- Work through issues systematically by priority
- Use `multi_replace_string_in_file` for independent changes
- Test after each category of fixes
- Keep changes focused and minimal

### Step 4: Commit Changes

Commit each file individually with informative messages:

```bash
git add {file}
git commit -m "fix(component): Brief description

Addresses PR #{NUMBER} review comment by @{reviewer}
- Specific change made
- Reason for change

Fixes: {file}:{line}"
```

**Commit message format:**

- `fix(scope):` for bugs and corrections
- `refactor(scope):` for code improvements
- `docs(scope):` for documentation changes
- Include PR number and reviewer
- Explain what and why, not just what

### Step 5: User Pushes Changes

Wait for confirmation that changes have been pushed to the remote repository.

### Step 6: Post Summary Comment to PR

After changes are pushed, compose and post a summary comment to the PR explaining:

**For addressed comments:**

- What was fixed
- How it was fixed
- Reference commit SHAs if helpful

**For ignored comments:**

- Why each was not addressed
- Reasoning or alternative approach taken

Use GitHub CLI to post the comment:

```bash
gh pr comment {PR_NUMBER} --body "comment text here"
```

**Comment format:**

````markdown
## Review Comments Addressed

### ✅ Fixed

**Issue 1: {Brief description}** (Line {number} in {file})
- Fixed by: {description of change}
- Commit: {SHA}

**Issue 2: {Brief description}**
- Fixed by: {description of change}
- Commit: {SHA}

### ⏭️ Not Addressed

**Issue 3: {Brief description}**
- Reason: {explanation why not fixed}
````

## Comment Types in GitHub

GitHub has three distinct comment systems:

### 1. Issue Comments (General PR Comments)

**API Endpoint:** `/repos/{owner}/{repo}/issues/{pr_number}/comments`

These are general comments on the PR conversation thread, not tied to specific code.

**Usage:**

- SonarQubeCloud posts quality gate results here
- Team members post general feedback
- Bot notifications appear here

**Retrieval:**

```bash
gh api repos/osuecampus/engr-211-free-body-diagrams/issues/{PR_NUMBER}/comments
```

**Structure:**

```json
{
  "id": 3885949689,
  "author": "sonarqubecloud[bot]",
  "created": "2026-02-11T17:43:06Z",
  "body": "## Quality Gate passed..."
}
```

### 2. Review Comments (Inline Code Comments)

**API Endpoint:** `/repos/{owner}/{repo}/pulls/{pr_number}/comments`

These are inline comments on specific lines of code in changed files.

**Usage:**

- Copilot's inline suggestions (`Copilot` user)
- Team members' code-specific feedback
- Contains file path, line number, and suggestion code blocks

**Retrieval:**

```bash
gh api repos/osuecampus/engr-211-free-body-diagrams/pulls/{PR_NUMBER}/comments
```

**Structure:**

```json
{
  "id": 2794764515,
  "path": "src/css/style.css",
  "line": 116,
  "author": "Copilot",
  "created": "2026-02-11T18:15:43Z",
  "body": "This selector targets elements with `role=\"button\"`..."
}
```

**Key Fields:**

- `path`: File path relative to repo root
- `line`: Line number in the diff where comment was made
- `body`: Comment text, may include ```suggestion blocks

### 3. Reviews (Review Summaries)

**API Endpoint:** `/repos/{owner}/{repo}/pulls/{pr_number}/reviews`

These are formal review submissions with a state.

**Usage:**

- Copilot's overall PR review (`copilot-pull-request-reviewer[bot]`)
- Team members' formal reviews (APPROVED, CHANGES_REQUESTED, COMMENTED)
- Contains summary of all review comments

**Retrieval:**

```bash
gh api repos/osuecampus/engr-211-free-body-diagrams/pulls/{PR_NUMBER}/reviews
```

**Structure:**

```json
{
  "id": 3786466538,
  "author": "copilot-pull-request-reviewer[bot]",
  "state": "COMMENTED",
  "submitted": "2026-02-11T18:15:44Z",
  "body": "## Pull request overview\n\nThis PR implements..."
}
```

**Review States:**

- `COMMENTED`: General feedback without approval/rejection
- `APPROVED`: Reviewer approves the changes
- `CHANGES_REQUESTED`: Reviewer requests changes before approval

## GitHub MCP Tool Limitations

### `github-pull-request_issue_fetch`

**What it returns:**

- PR metadata (title, body, author, assignees)
- File changes list with patches
- **Issue comments** (from `/issues/{pr}/comments`)
- **Reviews** (from `/pulls/{pr}/reviews`)

**What it DOES NOT return:**

- ❌ **Review comments** (inline code comments from `/pulls/{pr}/comments`)

**Example PR #13 Result:**

```json
{
  "comments": [
    {
      "author": "sonarqubecloud",
      "body": "Quality Gate passed..."
    }
  ],
  "reviews": [
    {
      "author": "copilot-pull-request-reviewer",
      "state": "COMMENTED",
      "body": "## Pull request overview..."
    }
  ]
}
```

**Missing:** The 3 inline code comments from Copilot were NOT included.

## Complete PR Review Retrieval Workflow

To get ALL review feedback, you MUST use GitHub CLI:

### Step 1: Get PR Metadata (GitHub MCP)

```javascript
github-pull-request_issue_fetch(prNumber)
```

**Returns:**

- PR title, description
- Issue comments (SonarQube results, general feedback)
- Review summaries (overall review state)

### Step 2: Get Inline Code Comments (GitHub CLI - REQUIRED)

```bash
gh api repos/osuecampus/engr-211-free-body-diagrams/pulls/{PR_NUMBER}/comments \
  --jq '.[] | {id, path, line, author: .user.login, created: .created_at, body}'
```

**Returns:**

- File-specific comments
- Line numbers for each comment
- Code suggestions in ```suggestion blocks
- **This is the ONLY way to get Copilot's inline feedback**

### Step 3: Consolidate and Prioritize

Combine data from both sources:

1. **Critical Issues** (must fix):
   - Review comments with WCAG violations
   - Security issues from SonarQube
   - "CHANGES_REQUESTED" state reviews

2. **High Priority**:
   - Copilot inline suggestions
   - Team reviewer feedback
   - SonarQube quality gate failures

3. **Low Priority**:
   - Code style suggestions
   - Documentation improvements
   - Low-confidence Copilot suggestions (in `<details>` sections)

## Addressing Review Comments

### Priority Levels

#### 🔴 Critical (Must Fix Before Merge)

- WCAG violations
- Security vulnerabilities
- Functional bugs identified by reviewers
- Breaking changes

#### 🟡 High (Should Fix)

- Code quality issues
- Inline suggestions from Copilot/reviewers
- Test coverage gaps
- Documentation errors

#### 🟢 Low (Consider Fixing)

- Style preferences
- Low-confidence suggestions
- Optional improvements

### Implementation Approach

1. **Batch Independent Fixes**: Use `multi_replace_string_in_file` for unrelated changes
2. **Test After Each Category**: Test critical fixes before moving to high priority
3. **Commit Incrementally**: Group related fixes in single commits
4. **Respond to Reviewers**: Comment on addressed items (if needed by team)

### Example Commands for PR #13

```bash
# Get all three comment types
gh api repos/osuecampus/engr-211-free-body-diagrams/issues/13/comments --jq '.[]'
gh api repos/osuecampus/engr-211-free-body-diagrams/pulls/13/comments --jq '.[]'
gh api repos/osuecampus/engr-211-free-body-diagrams/pulls/13/reviews --jq '.[]'

# Or use the investigation script
bash /tmp/pr-full-comments.sh
```

## Testing Before Marking Complete

1. **Verify each fix addresses the comment**
2. **Run relevant tests**:

   ```bash
   yarn test           # Unit tests
   yarn build          # Build verification
   ```

3. **Manual verification** for accessibility changes:
   - Keyboard navigation
   - Screen reader announcements
   - Focus indicators

4. **Check for errors**:

   ```bash
   yarn build 2>&1 | grep -i error
   ```

## Committing Changes

### Commit Message Format

```
fix(a11y): Remove keyboard trap in DiagramPanel

Addresses PR #13 review comment by @Copilot
- Remove Tab key preventDefault to allow natural focus exit
- Comply with WCAG 2.1 SC 2.1.2 (No Keyboard Trap)

Fixes: Line 166 in DiagramPanel.vue
```

### Batch vs Individual Commits

- **Batch together**: Independent fixes to different files
- **Separate commits**: Fixes that affect the same workflow
- **Always separate**: Critical fixes from improvements

## Example: PR #13 Review Comments

### Retrieved Comments (3 inline + 1 review + 1 issue)

1. **Inline Comments** (via `/pulls/{pr}/comments`):
   - `src/css/style.css:116` - Dead CSS selector
   - `src/components/activity/DiagramPanel.vue:166` - Keyboard trap (WCAG violation)
   - `src/components/activity/FreeBodyDiagram.vue:282` - Screen reader timeout too short

2. **Review Summary** (via `/pulls/{pr}/reviews`):
   - Overall feedback: WCAG compliance implementation
   - Low-confidence note about event coupling

3. **Issue Comments** (via `/issues/{pr}/comments`):
   - SonarQube: Quality gate passed, 1 new issue

### Prioritization

🔴 **Critical:** Fix #2 (WCAG violation - keyboard trap)
🟡 **High:** Fix #1 (dead code), Fix #3 (a11y timeout)
🟢 **Low:** Event coupling note (low confidence)

## Quick Reference Card

| Need | Tool | API Endpoint |
|------|------|-------------|
| PR metadata & general comments | `github-pull-request_issue_fetch` | `/issues/{pr}/comments` |
| Inline code comments | GitHub CLI | `/pulls/{pr}/comments` |
| Review summaries | GitHub CLI or MCP | `/pulls/{pr}/reviews` |
| Complete picture | **Both MCP + CLI** | All three endpoints |

## Scripts for Future Use

Save investigation script:

```bash
cat > ~/.local/bin/gh-pr-comments << 'EOF'
#!/bin/bash
PR=$1
REPO=${2:-osuecampus/engr-211-free-body-diagrams}

echo "=== Issue Comments ==="
gh api repos/$REPO/issues/$PR/comments --jq '.[] | {author: .user.login, line: "N/A", body: .body[0:150]}'

echo -e "\n=== Inline Review Comments ==="
gh api repos/$REPO/pulls/$PR/comments --jq '.[] | {author: .user.login, path, line, body: .body[0:150]}'

echo -e "\n=== Reviews ==="
gh api repos/$REPO/pulls/$PR/reviews --jq '.[] | {author: .user.login, state, body: .body[0:150]}'
EOF
chmod +x ~/.local/bin/gh-pr-comments

# Usage: gh-pr-comments 13
```

## Summary

**Key Takeaway:** The GitHub MCP `github-pull-request_issue_fetch` tool does NOT return inline review comments. You MUST use GitHub CLI to get `/pulls/{pr}/comments` to retrieve Copilot's line-specific feedback.

**Required workflow:**

1. Use MCP for PR overview and general comments
2. Use GitHub CLI for inline code comments (*essential*)
3. Consolidate both sources before addressing feedback
4. Prioritize by severity and fix systematically
