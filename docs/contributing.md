# Contributing Guide

Thank you for your interest in contributing to WebGPU FFT Library!

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork: `git clone https://github.com/your-username/gpu-fft.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/my-feature`

## Development Workflow

```bash
# Build the library
npm run build

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint and format
npm run lint:fix
npm run format
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
feat(fft): add 3D FFT support
fix(spectrum): correct dB calculation for zero magnitude
docs(readme): add browser compatibility section
test(complex): add property tests for complex multiplication
```

## Pull Request Process

1. Update documentation for any API changes
2. Add tests for new features
3. Ensure all tests pass: `npm test`
4. Update the CHANGELOG.md if needed
5. Submit PR with a clear description of changes

## Spec-Driven Development

This project follows OpenSpec-driven development:
- All feature changes must align with canonical specs in `openspec/specs/`
- New features require spec updates first
- See `openspec/specs/` for repository specifications and `openspec/changes/` for active change artifacts

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
