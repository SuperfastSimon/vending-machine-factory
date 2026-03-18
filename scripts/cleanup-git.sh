#!/bin/bash
# Run this script locally to remove node_modules and junk files from Git tracking
# Usage: bash scripts/cleanup-git.sh

set -e

echo "Removing node_modules from Git tracking..."
git rm -r --cached node_modules/ 2>/dev/null || echo "node_modules/ not tracked"

echo "Removing junk files from Git tracking..."
git rm --cached repomix-output.xml 2>/dev/null || true
git rm --cached "01_Architecture.md" 2>/dev/null || true
git rm --cached "01_Vending_Machine_Architecture.md" 2>/dev/null || true
git rm --cached "02_AutoGPT_API_Wrapper.ts" 2>/dev/null || true
git rm --cached "03_AI_Generation_Prompts.md" 2>/dev/null || true
git rm --cached "04_Frontend_Research_Report.md" 2>/dev/null || true
git rm --cached "API_Wrapper.ts" 2>/dev/null || true
git rm --cached "Bolt grok.md" 2>/dev/null || true
git rm --cached "Bolt grok.txt" 2>/dev/null || true
git rm --cached "Frontend_Research_Report_Vending_Machine_Factory.md" 2>/dev/null || true
git rm --cached "Readme" 2>/dev/null || true
git rm --cached "proxy.ts" 2>/dev/null || true
git rm -r --cached api/ 2>/dev/null || true
git rm -r --cached architecture/ 2>/dev/null || true
git rm -r --cached prompts/ 2>/dev/null || true
git rm -r --cached research/ 2>/dev/null || true
git rm -r --cached Documents 2>/dev/null || true
git rm -r --cached vending-machine-factory 2>/dev/null || true

echo "Committing changes..."
git add -A
git commit -m "chore: remove node_modules + junk files from git tracking"
git push

echo "Done! node_modules and junk files removed from Git."
echo "You can now delete this script: git rm scripts/cleanup-git.sh && git commit -m 'chore: remove cleanup script' && git push"
