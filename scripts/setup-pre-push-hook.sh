#!/bin/sh
# Setup pre-push hook
HOOK_PATH=".git/hooks/pre-push"
if [ -f "$HOOK_PATH" ]; then
  echo "Pre-push hook already exists. Updating..."
else
  echo "Creating pre-push hook..."
  touch "$HOOK_PATH"
fi

cat > "$HOOK_PATH" << 'EOF'
#!/bin/sh
echo "Running pre-push checks..."

npm run lint
LINT_EXIT=$?

npm test
TEST_EXIT=$?

npm run build
BUILD_EXIT=$?

if [ $LINT_EXIT -ne 0 ] || [ $TEST_EXIT -ne 0 ] || [ $BUILD_EXIT -ne 0 ]; then
  echo "Pre-push checks failed. Push aborted."
  exit 1
fi

echo "All checks passed. Pushing..."
exit 0
EOF

chmod +x "$HOOK_PATH"
echo "Pre-push hook installed successfully."
