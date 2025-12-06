# Project Structure

## 📁 Reorganized Directory Layout

```
FakeApiGenerator/
├── README.md                    # Main project documentation
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── next.config.ts               # Next.js configuration
├── eslint.config.mjs            # ESLint configuration
├── vitest.config.ts             # Root vitest config (delegates to config/)
├── env.example                  # Environment variables template
├── docker.sh                    # Docker management script
│
├── config/                      # ✨ Configuration files
│   ├── vitest.config.ts         # Vitest test configuration
│   ├── playwright.config.ts     # Playwright E2E configuration
│   ├── stryker.config.mjs       # Mutation testing configuration
│   └── render.yaml              # Render deployment configuration
│
├── docker/                      # ✨ Docker files
│   ├── Dockerfile               # Production multi-stage build
│   ├── Dockerfile.dev           # Development with hot-reload
│   ├── docker-compose.yml       # Docker Compose orchestration
│   └── .dockerignore            # Docker build context exclusions
│
├── docs/                        # ✨ All documentation
│   ├── README.md                # Documentation index
│   ├── SECURITY.md              # Security advisory
│   ├── DOCKER_DEPLOYMENT.md     # Docker guide
│   ├── DOCKER_QUICK_REFERENCE.md
│   ├── MONGODB_SETUP.md
│   ├── GOOGLE_AUTH_SETUP.md
│   ├── AUTHENTICATION_SETUP.md
│   ├── FEATURES.md
│   ├── PROJECT_ORGANIZATION.md
│   ├── ARCHITECTURE_DIAGRAMS.md
│   ├── SOLID_ARCHITECTURE_SUMMARY.md
│   ├── TESTING.md
│   └── ... (19 total documentation files)
│
├── scripts/                     # Utility scripts
│   ├── init-admin.ts            # Initialize admin user
│   ├── migrate-to-mongodb.ts    # Data migration
│   ├── sanity-test.js           # Sanity checks
│   └── security-audit.sh        # Security audit script
│
├── src/                         # Source code
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API routes
│   │   ├── auth/                # Auth pages
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/              # React components
│   ├── lib/                     # Utilities and helpers
│   ├── models/                  # MongoDB/Mongoose models
│   ├── auth.ts                  # NextAuth configuration
│   ├── middleware.ts            # Next.js middleware
│   └── types.ts                 # TypeScript types
│
├── tests/                       # Test suites
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   ├── security/                # Security tests
│   ├── api/                     # API tests
│   ├── contract/                # Contract tests
│   ├── chaos/                   # Chaos tests
│   ├── static/                  # Static analysis tests
│   ├── data/                    # Data integrity tests
│   ├── regression/              # Regression tests
│   └── setup.ts                 # Test setup
│
├── public/                      # Static assets
├── reports/                     # Test and lint reports
├── data_backup/                 # JSON data backups
└── .github/                     # GitHub configuration
    └── copilot-instructions.md

```

## 🎯 Key Improvements

### 1. **config/** - Centralized Configuration
All test and deployment configuration files in one location:
- Test configs (Vitest, Playwright, Stryker)
- Deployment configs (Render)
- Easy to find and maintain

### 2. **docker/** - Docker Files Organized
All Docker-related files in dedicated directory:
- Dockerfile (production)
- Dockerfile.dev (development)
- docker-compose.yml
- .dockerignore
- Keeps root directory clean

### 3. **docs/** - Documentation Hub
All documentation files centralized:
- 19 documentation files organized by category
- Documentation index (docs/README.md)
- Easy navigation and maintenance

### 4. **Removed Empty Directories**
- Removed empty `data/` directory
- MongoDB stores data, not local files

## 📝 Command Updates

### Updated Commands

**Docker commands** now reference `docker/` directory:
```bash
# Old
docker compose up

# New
docker compose -f docker/docker-compose.yml up
# Or use the convenience script:
./docker.sh dev
```

**Test commands** now reference `config/`:
```bash
# E2E tests
npm run test:e2e
# Uses: playwright test --config=config/playwright.config.ts

# Mutation tests
npm run test:mutation
# Uses: stryker run --config config/stryker.config.mjs
```

## 🔧 Path References

### Vitest Configuration
- Root `vitest.config.ts` delegates to `config/vitest.config.ts`
- No changes needed to test commands
- All tests work as before

### Docker Compose
- Located in `docker/docker-compose.yml`
- Build contexts updated to parent directory (`context: ..`)
- Volume mounts updated (`- ..:/app`)

### Documentation Links
- All doc references updated to `docs/` path
- README.md links to `docs/SECURITY.md`, etc.
- Internal doc cross-references updated

## 🚀 Benefits

1. **Clean Root Directory**
   - Only essential files at root level
   - Project feels more organized

2. **Logical Grouping**
   - Config files together
   - Docker files together
   - Documentation together

3. **Easier Navigation**
   - Know where to find things
   - Consistent structure
   - Scalable for growth

4. **Better Maintenance**
   - Easier to add new docs/configs
   - Clear ownership of directories
   - Reduced clutter

5. **Professional Structure**
   - Follows industry best practices
   - Similar to enterprise projects
   - Easier for contributors

## 📚 Quick Reference

**Find configurations:** `config/`  
**Find Docker files:** `docker/`  
**Find documentation:** `docs/`  
**Find scripts:** `scripts/`  
**Find source code:** `src/`  
**Find tests:** `tests/`

---

Last Updated: December 7, 2025
