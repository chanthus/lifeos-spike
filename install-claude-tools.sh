#!/usr/bin/env bash
set -euo pipefail

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source .env for Context7 API key
[ -f "$PROJECT_ROOT/.env" ] && source "$PROJECT_ROOT/.env"

# Install MCP servers (skip if already installed)
if ! claude mcp list 2>&1 | grep -q "serena:"; then
  echo "Installing Serena MCP..."
  claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "$(pwd)" || true
else
  echo "Serena MCP already installed, skipping..."
fi

if ! claude mcp list 2>&1 | grep -q "playwright:"; then
  echo "Installing Playwright MCP..."
  claude mcp add playwright npx @playwright/mcp@latest || true
else
  echo "Playwright MCP already installed, skipping..."
fi

# Install Context7 MCP (if API key exists)
if [ -n "${CONTEXT7_API_KEY:-}" ]; then
  if ! claude mcp list 2>&1 | grep -q "context7:"; then
    echo "Installing Context7 MCP..."
    claude mcp add context7 -- npx -y @upstash/context7-mcp --api-key "$CONTEXT7_API_KEY" || true
  else
    echo "Context7 MCP already installed, skipping..."
  fi
fi

echo "✓ MCP servers installed"

# Note: Plugin installation is handled separately to avoid opening Claude app
# To install Superpowers plugin manually, run:
#   claude plugin marketplace add obra/superpowers-marketplace
#   claude plugin install superpowers@superpowers-marketplace
