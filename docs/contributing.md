# Contributing Guide

Thank you for your interest in contributing to WebGPU FFT Library!

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork: `git clone https://github.com/your-username/gpu-fft.git`
3. Install dependencies: `npm install`
4. Create a short-lived branch: `git checkout -b fix/clear-short-name`

## Development Workflow

```bash
# Canonical validation chain
npm run lint
npm run format:check
npm run typecheck
npm test

# Package/docs checks when affected
npm run build
npm run smoke:package
npm run docs:build
```

## Code Style

This project uses:
- **TypeScript** strict mode
- **ESLint** for code quality
- **Prettier** for formatting (single quotes, semicolons, trailing comma)
- **Conventional Commits** for commit messages

### Commit Message Format

```
type(scope): description
```

Examples:
```
feat(real-fft): add rectangular RFFT coverage
fix(spectrum): correct dB calculation for zero magnitude
docs(readme): add browser compatibility section
test(complex): add property tests for complex multiplication
```

## Pull Request Process

1. Update README, docs, and OpenSpec for public API or behavior changes
2. Add tests for new behavior and bug fixes
3. Run `npm run lint && npm run format:check && npm run typecheck && npm test`
4. Run `npm run build`, `npm run smoke:package`, or `npm run docs:build` when the change affects package or docs output
5. Request review for architecture, public API, docs IA, workflow, or governance changes

## Spec-Driven Development

This project follows OpenSpec-driven development:
- All feature changes must align with canonical specs in `openspec/specs/`
- New features require spec updates first
- See `openspec/specs/` for repository specifications and `openspec/changes/` for active change artifacts
- Avoid long-running parallel worktrees in the closeout phase; merge, close, or delete short-lived branches quickly

## Running Examples

```bash
# Run TypeScript examples
npx tsx examples/node/basic-fft.ts

# Serve web demos
npx serve examples/web
```

## Building Documentation

```bash
# Build docs
npm run docs:build

# Serve docs locally
npm run docs:dev
```

## Reporting Issues

When reporting issues, please include:
- Browser/Node.js version
- GPU information (if applicable)
- Minimal reproduction code
- Error messages and stack traces

## Code of Conduct

This project adheres to our [Code of Conduct](https://github.com/LessUp/gpu-fft/blob/main/CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
