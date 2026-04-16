# Changelog

All notable changes to this project are documented in the root [CHANGELOG.md](../CHANGELOG.md).

## Historical Entries

### 2026-03-10: Workflow Deep Standardization

**Changes:**
- Pages workflow renamed: `deploy-docs.yml` → `pages.yml`
- CI workflow unified `permissions: contents: read` and `concurrency` configuration
- Pages workflow added `actions/configure-pages@v5` step
- Pages workflow added `paths` trigger filter to reduce unnecessary builds

**Background:**
Second round of GitHub Actions deep standardization across the repository: unified naming, permissions, concurrency, path filtering, and caching strategies.

### 2026-04-16: Dependency Security Update

**Changes:**
- Major version upgrades to resolve all npm audit vulnerabilities
- ESLint 9 flat config migration
- TypeScript-ESLint v8 migration
- Vite 8 and Vitest 4 upgrades

See [CHANGELOG.md](../CHANGELOG.md) for complete details.
