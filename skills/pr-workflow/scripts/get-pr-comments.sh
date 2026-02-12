#!/bin/bash
# Pull Request Comments Retrieval Script
# Retrieves all three types of PR feedback:
# 1. Issue comments (general PR-level feedback)
# 2. Review comments (inline code comments)
# 3. Reviews (review summaries with state)
#
# Usage: ./scripts/get-pr-comments.sh {PR_NUMBER}

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <PR_NUMBER>"
  echo "Example: $0 13"
  exit 1
fi

PR=$1
OWNER=$(gh repo view --json owner -q .owner.login)
REPO=$(gh repo view --json name -q .name)

echo "=== PR #$PR Comments Retrieval ==="
echo "Repository: $OWNER/$REPO"
echo ""

echo "=== Issue Comments (General PR Feedback) ==="
gh api repos/$OWNER/$REPO/issues/$PR/comments \
  --jq '.[] | "Author: \(.user.login)\nCreated: \(.created_at)\nBody:\n\(.body)\n---"' \
  || echo "No issue comments found or error retrieving them."

echo -e "\n=== Review Comments (Inline Code Feedback) ==="
gh api repos/$OWNER/$REPO/pulls/$PR/comments \
  --jq '.[] | "Author: \(.user.login)\nFile: \(.path):\(.line)\nBody:\n\(.body)\n---"' \
  || echo "No review comments found or error retrieving them."

echo -e "\n=== Reviews (Review Summaries) ==="
gh api repos/$OWNER/$REPO/pulls/$PR/reviews \
  --jq '.[] | "Author: \(.user.login)\nState: \(.state)\nSubmitted: \(.submitted_at)\nBody:\n\(.body)\n---"' \
  || echo "No reviews found or error retrieving them."

echo -e "\n=== Retrieval Complete ==="
