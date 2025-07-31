// security/security-scan.sh
#!/bin/bash
echo "🔒 Running Security Scans..."

# Check for common security issues
echo "1. Checking for hardcoded secrets..."
grep -r "password\|secret\|key\|token" src/ --exclude-dir=node_modules || echo "✅ No hardcoded secrets found"

echo "2. Checking file permissions..."
find src/ -type f -perm /o+w -exec echo "⚠️  World-writable file: {}" \;

echo "3. Checking for vulnerable dependencies..."
npm audit --audit-level=moderate

echo "4. Running static analysis..."
# This would run tools like ESLint security rules, Semgrep, etc.
npx eslint src/ --ext .js --no-eslintrc --config '{
  "rules": {
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-script-url": "error"
  }
}'

echo "🔒 Security scan completed"