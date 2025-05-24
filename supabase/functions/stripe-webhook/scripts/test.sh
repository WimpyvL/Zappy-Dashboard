#!/usr/bin/env bash
set -e

# Directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Project root directory (parent of script directory)
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Load environment variables from .env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
  echo "Loading environment variables from .env file..."
  export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | xargs)
fi

# Ensure required env variables are set
required_vars=("STRIPE_SECRET_KEY" "WEBHOOK_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
  echo "Error: Missing required environment variables:"
  printf '%s\n' "${missing_vars[@]}"
  echo "Please set them in .env file or export them before running tests"
  exit 1
fi

# Default test mode
MODE=${1:-"test"}

cd "$PROJECT_ROOT"

case $MODE in
  "test")
    echo "Running tests..."
    deno test --allow-net --allow-env --allow-read
    ;;
    
  "watch")
    echo "Running tests in watch mode..."
    deno test --watch --allow-net --allow-env --allow-read
    ;;
    
  "coverage")
    echo "Running tests with coverage..."
    deno test --coverage=coverage --allow-net --allow-env --allow-read
    deno coverage coverage
    ;;
    
  "ci")
    echo "Running CI test sequence..."
    deno fmt --check
    deno lint
    deno check **/*.ts
    deno test --allow-net --allow-env --allow-read --coverage=coverage
    deno coverage coverage --lcov > coverage.lcov
    ;;
    
  *)
    echo "Unknown test mode: $MODE"
    echo "Available modes: test, watch, coverage, ci"
    exit 1
    ;;
esac