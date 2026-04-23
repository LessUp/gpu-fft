---
name: release
description: Help with the release process — version bump, changelog, npm publish. Only user can trigger (side effects).
disable-model-invocation: true
---

## Release Process

This project uses automated releases via GitHub Actions (see `.github/workflows/release.yml`).

### Standard Release

1. **Ensure clean state**:
   ```bash
   npm run lint && npm run format:check && npm run typecheck && npm run test
   ```

2. **Update version** (choose one):
   ```bash
   npm version patch  # 1.1.0 → 1.1.1 (bug fixes)
   npm version minor  # 1.1.0 → 1.2.0 (new features)
   npm version major  # 1.1.0 → 2.0.0 (breaking changes)
   ```

3. **Push tag to trigger release**:
   ```bash
   git push origin --tags
   ```

4. **GitHub Actions handles**:
   - Full validation (lint, test, build, smoke test)
   - npm publish (via trusted publisher)
   - GitHub release with notes

### Pre-release Checklist

- [ ] All tests pass
- [ ] `CHANGELOG.md` updated with changes
- [ ] Version bumped appropriately
- [ ] No uncommitted changes

### Manual Publish (emergency only)

```bash
npm run build
npm run smoke:package
npm publish
```

## Notes

- `prepublishOnly` script runs full validation before publish
- Package uses trusted publisher — no npm token needed in CI
- Conventional Commits help generate changelog entries
