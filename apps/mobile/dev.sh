#!/bin/bash
# Expo dev server wrapper with proper cleanup on Ctrl+C

# Load .env file to get RCT_METRO_PORT
if [ -f .env ]; then
  export $(grep -v '^#' .env | grep 'RCT_METRO_PORT' | xargs)
fi

# Use RCT_METRO_PORT from environment, or default to 43890
METRO_PORT="${RCT_METRO_PORT:-43890}"

# Function to cleanup on exit
cleanup() {
  echo ""
  echo "🧹 Cleaning up Metro bundler on port ${METRO_PORT}..."
  lsof -ti :${METRO_PORT} 2>/dev/null | xargs kill -9 2>/dev/null || true
  echo "✅ Metro bundler stopped"
  exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Start Expo with the port argument
echo "🚀 Starting Expo on port ${METRO_PORT}..."
npx expo start --port ${METRO_PORT} "$@"

# If expo exits normally, still cleanup
cleanup
