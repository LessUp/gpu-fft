# Contributing to WebGPU FFT Library

Thank you for your interest in contributing to WebGPU FFT Library! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Spec-Driven Development](#spec-driven-development)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Spec-Driven Development

This project follows **OpenSpec-driven development**. All non-trivial code changes must derive from the canonical specifications in `openspec/specs/` and from the relevant OpenSpec change artifacts in `openspec/changes/`.

### Spec Directory Structure

```
openspec/
├── specs/
│   ├── product/       # Product requirements and user stories
│   ├── rfc/           # Technical design documents (architecture decisions)
│   ├── api/           # API interface specifications
│   └── testing/       # Testing specifications and property definitions
└── changes/           # Change proposals, design docs, and task lists
```

### Contribution Workflow

1. **Read OpenSpec first** — Before writing code, review relevant docs in `openspec/specs/`
2. **Propose before implementation** — For non-trivial features, fixes, or interface changes, create/update an OpenSpec change in `openspec/changes/`
3. **Implement per spec** — Follow spec and design decisions exactly; do not expand scope opportunistically
4. **Review cross-cutting work** — Architecture, public API, documentation information architecture, workflow, and governance changes require a `/review`-style checkpoint before merge
5. **Test against specs** — Write tests that verify acceptance criteria and documented quality gates

When submitting a PR, reference the relevant spec documents in your description.

### Available Specifications

| Spec Type | Location | Purpose |
|-----------|----------|---------|
| Product | `openspec/specs/product/webgpu-fft-library.md` | What to build |
| Architecture | `openspec/specs/rfc/0001-webgpu-fft-library-architecture.md` | How it's designed |
| API | `openspec/specs/api/public-api.md` | Interface contracts |
| Testing | `openspec/specs/testing/testing-strategy.md` | Verification approach |

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- A browser with WebGPU support (Chrome 113+, Edge 113+, or Firefox 128+)

### Setting Up the Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/gpu-fft.git
   cd gpu-fft
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run tests** to ensure everything is working:
   ```bash
   npm test
   ```

5. **Start the development server** (optional):
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Create a short-lived branch** for the change:
   ```bash
   git checkout -b fix/clear-short-name
   ```

2. **For non-trivial changes, create or update an OpenSpec change** in `openspec/changes/`

3. **Make focused changes** following the code style guidelines

4. **Write or update tests** for behavior changes and bug fixes

5. **Run the canonical validation chain**:
   ```bash
   npm run lint
   npm run format:check
   npm run typecheck
   npm test
   ```

6. **Run package/docs checks when affected**:
   ```bash
   npm run build
   npm run smoke:package
   npm run docs:build
   ```

7. **Request review** for architecture, public API, docs IA, workflow, or governance changes

8. **Commit your changes** following the commit message guidelines

9. **Push to your fork**:
   ```bash
   git push origin fix/clear-short-name
   ```

10. **Open a Pull Request** on GitHub

Avoid long-running parallel worktrees unless a change truly needs isolation. The repository is in a low-maintenance closeout phase, so unfinished branches should be merged, closed, or deleted quickly.

## Code Style

### TypeScript Guidelines

- Use TypeScript for all new code
- Enable strict mode in your IDE
- Use explicit type annotations for function parameters and return types
- Avoid using `any` type; use `unknown` if the type is truly unknown
- Use interfaces for object shapes, types for unions and primitives

### Naming Conventions

- **Files**: Use kebab-case (e.g., `fft-engine.ts`)
- **Classes**: Use PascalCase (e.g., `FFTEngine`)
- **Functions/Methods**: Use camelCase (e.g., `computeFFT`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_FFT_SIZE`)
- **Interfaces**: Use PascalCase with descriptive names (e.g., `FFTEngineConfig`)

### Code Organization

- Keep files focused and single-purpose
- Group related functionality in directories
- Export public APIs from `index.ts` files
- Keep WGSL source strings in `src/shaders/sources.ts`; do not reintroduce standalone `.wgsl` source copies

### Documentation

- Add JSDoc comments to all public APIs
- Include `@param`, `@returns`, and `@example` tags
- Document complex algorithms with inline comments
- Update README when adding new features

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Place test files in the `tests/` directory
- Name test files with `.test.ts` suffix
- Use descriptive test names that explain the expected behavior
- Include both unit tests and property-based tests

### Property-Based Testing

We use [fast-check](https://github.com/dubzzz/fast-check) for property-based testing. When writing property tests:

- Test mathematical properties (e.g., FFT/IFFT round-trip)
- Use generators to create random valid inputs
- Run at least 100 iterations per property
- Tag tests with the property number from the testing spec: `openspec/specs/testing/testing-strategy.md`

Example:
```typescript
// Feature: webgpu-fft-library, Property 1: FFT/IFFT Round-Trip
// Validates: Requirements 3.1, 4.1, 4.4
it('should satisfy FFT/IFFT round-trip property', () => {
  fc.assert(
    fc.property(fc.array(fc.float()), (input) => {
      // Test implementation
    }),
    { numRuns: 100 }
  );
});
```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting) |
| `refactor` | Code refactoring without feature changes |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks (dependencies, build, etc.) |

### Examples

```
feat(real-fft): add rectangular RFFT coverage

fix(spectrum): correct dB calculation for zero magnitudes

docs(readme): add browser compatibility section

test(complex): add property tests for complex multiplication
```

## Pull Request Process

1. **Ensure your PR**:
    - Has a clear, descriptive title
    - References any related issues
    - Includes tests for new functionality
    - Passes all CI checks
    - Has no merge conflicts
    - Updates README/docs/OpenSpec when public behavior changes

2. **Fill out the PR template** completely

3. **Request review** from maintainers

4. **Address feedback** promptly and push updates

5. **Once approved**, a maintainer will merge your PR

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Tests have been added/updated
- [ ] Documentation has been updated
- [ ] `npm run lint && npm run format:check && npm run typecheck && npm test` passes locally
- [ ] Commit messages follow conventions
- [ ] PR description explains the changes
- [ ] Relevant spec documents are updated (if applicable)

## Reporting Issues

### Bug Reports

When reporting a bug, please include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Browser and OS information
- WebGPU adapter information (if relevant)
- Code samples or screenshots

### Feature Requests

When requesting a feature, please include:

- A clear description of the feature
- Use cases and benefits
- Any implementation suggestions
- Related issues or PRs

## Questions?

If you have questions about contributing, feel free to:

- Open a [Discussion](https://github.com/LessUp/gpu-fft/discussions)
- Ask in an existing issue
- Reach out to the maintainers

Thank you for contributing! 🎉
