#!/bin/bash
# Security audit script for Fake API Generator
# Checks for known vulnerabilities and security issues

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Fake API Generator - Security Audit${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Check for CVE-2025-55182 (Next.js RCE)
echo -e "${BLUE}[1/6] Checking Next.js version (CVE-2025-55182)...${NC}"
NEXTJS_VERSION=$(npm list next --depth=0 2>/dev/null | grep "next@" | sed 's/.*next@//' | sed 's/ .*//')

if [ -z "$NEXTJS_VERSION" ]; then
    echo -e "${RED}✗ Could not determine Next.js version${NC}"
    exit 1
fi

echo "Current version: $NEXTJS_VERSION"

# Patched versions for CVE-2025-55182
PATCHED_VERSIONS=("15.0.5" "15.1.9" "15.2.6" "15.3.6" "15.4.8" "15.5.7" "16.0.7")
IS_PATCHED=false

for version in "${PATCHED_VERSIONS[@]}"; do
    if [[ "$NEXTJS_VERSION" == "$version"* ]]; then
        IS_PATCHED=true
        break
    fi
done

if [ "$IS_PATCHED" = true ]; then
    echo -e "${GREEN}✓ Next.js version is patched against CVE-2025-55182${NC}\n"
else
    echo -e "${RED}✗ CRITICAL: Next.js version is vulnerable to CVE-2025-55182!${NC}"
    echo -e "${RED}  Please upgrade to: 15.0.5, 15.1.9, 15.2.6, 15.3.6, 15.4.8, 15.5.7, or 16.0.7${NC}\n"
    exit 1
fi

# Run npm audit
echo -e "${BLUE}[2/6] Running npm audit...${NC}"
if npm audit --production 2>&1 | grep -q "found 0 vulnerabilities"; then
    echo -e "${GREEN}✓ No vulnerabilities found in production dependencies${NC}\n"
else
    echo -e "${YELLOW}⚠ Vulnerabilities found. Running detailed audit...${NC}"
    npm audit --production
    echo ""
fi

# Check for outdated packages
echo -e "${BLUE}[3/6] Checking for outdated packages...${NC}"
OUTDATED=$(npm outdated 2>/dev/null || true)
if [ -z "$OUTDATED" ]; then
    echo -e "${GREEN}✓ All packages are up to date${NC}\n"
else
    echo -e "${YELLOW}⚠ Some packages are outdated:${NC}"
    npm outdated
    echo ""
fi

# Check .env files
echo -e "${BLUE}[4/6] Checking environment files...${NC}"
if [ -f .env ]; then
    if grep -q "NEXTAUTH_SECRET=your_nextauth_secret" .env 2>/dev/null; then
        echo -e "${RED}✗ Default NEXTAUTH_SECRET detected in .env${NC}"
        echo -e "${YELLOW}  Generate a new secret: openssl rand -base64 32${NC}\n"
    else
        echo -e "${GREEN}✓ NEXTAUTH_SECRET appears to be set${NC}\n"
    fi
else
    echo -e "${YELLOW}⚠ No .env file found${NC}\n"
fi

# Check for secrets in code
echo -e "${BLUE}[5/6] Scanning for potential secrets in code...${NC}"
if command -v git &> /dev/null; then
    SECRETS_FOUND=false
    
    # Check for API keys, tokens, passwords
    if git grep -i -E "(api[_-]?key|token|password|secret).*=.*['\"][a-zA-Z0-9]{20,}['\"]" -- '*.ts' '*.tsx' '*.js' '*.jsx' 2>/dev/null | grep -v node_modules | grep -v ".next" | grep -v "test" > /dev/null; then
        echo -e "${YELLOW}⚠ Potential hardcoded secrets found in code${NC}"
        SECRETS_FOUND=true
    fi
    
    if [ "$SECRETS_FOUND" = false ]; then
        echo -e "${GREEN}✓ No obvious secrets found in code${NC}\n"
    else
        echo ""
    fi
else
    echo -e "${YELLOW}⚠ Git not available, skipping secret scan${NC}\n"
fi

# Check Docker security
echo -e "${BLUE}[6/6] Checking Docker configuration...${NC}"
if [ -f docker/Dockerfile ]; then
    # Check if running as root
    if grep -q "USER" docker/Dockerfile; then
        echo -e "${GREEN}✓ Dockerfile uses non-root user${NC}"
    else
        echo -e "${YELLOW}⚠ Dockerfile may be running as root${NC}"
    fi
    
    # Check for HEALTHCHECK
    if grep -q "HEALTHCHECK" docker/Dockerfile; then
        echo -e "${GREEN}✓ Dockerfile includes health check${NC}"
    else
        echo -e "${YELLOW}⚠ Dockerfile missing health check${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No Dockerfile found${NC}"
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Security Audit Complete${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Summary
echo -e "${GREEN}✓ Critical CVE-2025-55182: PATCHED${NC}"
echo -e "${BLUE}📋 For detailed security information, see: docs/SECURITY.md${NC}\n"

# Recommendations
echo -e "${BLUE}Recommendations:${NC}"
echo "1. Run 'npm audit fix' to fix auto-fixable vulnerabilities"
echo "2. Review 'npm outdated' output and update packages"
echo "3. Ensure all secrets are in .env files (never in code)"
echo "4. Rebuild Docker images: docker compose -f docker/docker-compose.yml build --no-cache"
echo "5. Run tests after updates: npm test"
echo ""
