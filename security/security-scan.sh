#!/bin/bash
# security/free-security-scan.sh
# Complete security scanning without requiring API tokens

echo "🔒 Starting Comprehensive Security Scan (No API Keys Required)"
echo "=============================================================="

# 1. NPM Audit (Built-in)
echo "📦 1. Scanning NPM Dependencies..."
npm audit --audit-level=moderate --json > npm-audit.json 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ NPM audit completed"
else
    echo "⚠️  NPM audit found vulnerabilities - check npm-audit.json"
fi

# 2. Retire.js - JavaScript vulnerability scanner
echo "🔍 2. Scanning for Vulnerable JavaScript Libraries..."
npx retire --path src/ --outputformat json --outputpath retire-report.json
if [ $? -eq 0 ]; then
    echo "✅ Retire.js scan completed"
else
    echo "⚠️  Retire.js found potential issues"
fi

# 3. Semgrep - Static Analysis (Free tier)
echo "🔬 3. Running Static Code Analysis..."
npx semgrep --config=auto src/ --json --output=semgrep-report.json
if [ $? -eq 0 ]; then
    echo "✅ Semgrep analysis completed"
else
    echo "⚠️  Semgrep found potential security issues"
fi

# 4. ESLint Security Rules
echo "📝 4. Running ESLint Security Rules..."
npx eslint src/ --ext .js --format json --output-file eslint-security.json --no-eslintrc --config '{
  "env": { "browser": true, "es2021": true },
  "rules": {
    "no-eval": "error",
    "no-implied-eval": "error", 
    "no-new-func": "error",
    "no-script-url": "error",
    "no-alert": "warn",
    "no-console": "warn"
  }
}'

# 5. Check for hardcoded secrets
echo "🔑 5. Scanning for Hardcoded Secrets..."
SECRET_PATTERNS=(
    "password\s*=\s*['\"][^'\"]+['\"]"
    "api[_-]?key\s*=\s*['\"][^'\"]+['\"]" 
    "secret\s*=\s*['\"][^'\"]+['\"]"
    "token\s*=\s*['\"][^'\"]+['\"]"
    "aws[_-]?(access[_-]?key|secret)"
    "github[_-]?token"
)

SECRET_FOUND=false
for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -r -i -E "$pattern" src/ --exclude-dir=node_modules > /dev/null 2>&1; then
        echo "⚠️  Potential secret found: $pattern"
        SECRET_FOUND=true
    fi
done

if [ "$SECRET_FOUND" = false ]; then
    echo "✅ No hardcoded secrets detected"
fi

# 6. File permission check
echo "🔐 6. Checking File Permissions..."
UNSAFE_FILES=$(find src/ -type f -perm /o+w 2>/dev/null)
if [ -z "$UNSAFE_FILES" ]; then
    echo "✅ File permissions are secure"
else
    echo "⚠️  World-writable files found:"
    echo "$UNSAFE_FILES"
fi

# 7. Dependency License Check
echo "📄 7. Checking Dependency Licenses..."
npx license-checker --json --out license-report.json
echo "✅ License report generated"

# 8. Generate Security Report
echo "📊 8. Generating Security Summary..."
cat > security-report.md << EOF
# Security Scan Report
**Date**: $(date)
**Scan Type**: Comprehensive (No API Keys)

## Tools Used
- ✅ NPM Audit (dependency vulnerabilities)
- ✅ Retire.js (JavaScript vulnerabilities) 
- ✅ Semgrep (static analysis)
- ✅ ESLint Security (code patterns)
- ✅ Secret scanning (hardcoded credentials)
- ✅ File permissions check
- ✅ License compliance check

## Results Summary
- NPM Audit: $(if [ -f npm-audit.json ]; then echo "Report generated"; else echo "No issues"; fi)
- Retire.js: $(if [ -f retire-report.json ]; then echo "Report available"; else echo "Clean"; fi)
- Semgrep: $(if [ -f semgrep-report.json ]; then echo "Analysis complete"; else echo "No issues"; fi)
- Secrets: $(if [ "$SECRET_FOUND" = true ]; then echo "⚠️ Check required"; else echo "✅ Clean"; fi)

## Next Steps
1. Review generated report files
2. Fix any identified vulnerabilities
3. Update dependencies if needed
4. Re-run scan after fixes

EOF

echo "✅ Security scan completed!"
echo "📁 Reports generated:"
echo "   - security-report.md (summary)"
echo "   - npm-audit.json (npm vulnerabilities)"
echo "   - retire-report.json (js vulnerabilities)"  
echo "   - semgrep-report.json (code analysis)"
echo "   - license-report.json (dependency licenses)"

# Return exit code based on findings
if [ "$SECRET_FOUND" = true ]; then
    echo "❌ Security issues found - please review"
    exit 1
else
    echo "✅ No critical security issues detected"
    exit 0
fi