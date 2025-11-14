# Husky Git Hooks

This directory contains Git hooks managed by [Husky](https://typicode.github.io/husky/).

## What is Husky?

Husky enables Git hooks that are:

- ✅ **Version controlled** - Committed to the repository
- ✅ **Automatic** - Installed via `pnpm install` (runs `prepare` script)
- ✅ **Cross-platform** - Works on macOS, Linux, and Windows
- ✅ **Team-wide** - Everyone gets the same hooks

## Current Hooks

### pre-commit

**Purpose:** Reminds Claude to use the `git-commit-discipline` skill before committing.

**What it does:**

1. Displays a prominent reminder message
2. Lists the required commit steps
3. Waits for user confirmation (Press Enter to continue)

**Location:** `.husky/pre-commit`

**Skill Location:** `.claude/skills/git-commit-discipline/SKILL.md`

## How It Works

When you run `git commit`, Git automatically executes `.husky/pre-commit` which:

1. Shows the commit discipline reminder
2. Waits for Enter key press
3. Proceeds with the commit

## Setup for New Team Members

Hooks are installed automatically when running:

```bash
pnpm install
```

The `prepare` script in `package.json` runs `husky` which sets up the hooks.

## Modifying Hooks

To modify a hook, edit the file in `.husky/` directory:

```bash
# Example: Edit pre-commit hook
nano .husky/pre-commit
```

Changes to hooks are committed to git and shared with the team.

## Adding New Hooks

To add a new hook:

```bash
# Example: Add pre-push hook
echo "#!/bin/sh
echo 'Running pre-push checks...'
pnpm test
" > .husky/pre-push

chmod +x .husky/pre-push
```

## Bypassing Hooks (Not Recommended)

To bypass hooks temporarily (use with caution):

```bash
git commit --no-verify
```

**Warning:** Only bypass hooks if you understand the implications.

## Resources

- **Husky Documentation:** https://typicode.github.io/husky/
- **Git Hooks Documentation:** https://git-scm.com/docs/githooks
- **Commit Discipline Skill:** `.claude/skills/git-commit-discipline/SKILL.md`
