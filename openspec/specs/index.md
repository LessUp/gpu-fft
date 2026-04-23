# OpenSpec Specifications

`openspec/specs/` is the canonical specification root for `gpu-fft`. The legacy top-level `/specs` tree is retired and MUST NOT be used as an active source of truth.

## Current Repository Phase

The project is in a **closeout and stabilization** phase. Specification work now prioritizes:

1. Preserving a single source of truth
2. Keeping documentation and public claims accurate
3. Simplifying workflows and maintenance burden
4. Preparing the repository for low-maintenance archive-stage stewardship

## Canonical Structure

```
openspec/
├── specs/
│   ├── product/       # Product requirements and scope boundaries
│   ├── rfc/           # Architecture decisions and project governance RFCs
│   ├── api/           # Public API contracts
│   └── testing/       # Testing and quality expectations
└── changes/           # Proposal/design/tasks for in-flight changes
```

## Baseline Specification Documents

### Product

- [`product/webgpu-fft-library.md`](./product/webgpu-fft-library.md) - Core library scope and functional behavior

### RFCs

- [`rfc/0001-webgpu-fft-library-architecture.md`](./rfc/0001-webgpu-fft-library-architecture.md) - Core WebGPU FFT architecture
- [`rfc/0002-project-quality-enhancement-architecture.md`](./rfc/0002-project-quality-enhancement-architecture.md) - Historical quality/project architecture context
- [`rfc/index.md`](./rfc/index.md) - RFC index and OpenSpec workflow entry

### API

- [`api/public-api.md`](./api/public-api.md) - Public API contract and exported surface area

### Testing

- [`testing/testing-strategy.md`](./testing/testing-strategy.md) - Test strategy, properties, and quality baselines

## Closeout Governance Capability Map

The repository's closeout governance baseline is defined by these maintained capability specs:

- [`project-governance/spec.md`](./project-governance/spec.md)
- [`documentation-platform/spec.md`](./documentation-platform/spec.md)
- [`developer-workflow/spec.md`](./developer-workflow/spec.md)
- [`public-api-alignment/spec.md`](./public-api-alignment/spec.md)
- [`quality-gates/spec.md`](./quality-gates/spec.md)

These capability specs define the normalized closeout workflow, documentation policy, API-claim discipline, and quality gates that all future low-maintenance changes must follow.

## Working Model

1. Use `/opsx:explore` to investigate or clarify a problem
2. Use `/opsx:propose` to create proposal/design/specs/tasks for non-trivial work
3. Use `/opsx:apply` to implement the approved tasks
4. Use `/opsx:archive` only after the change is fully implemented and reconciled

When any guidance conflicts with this directory, the content under `openspec/specs/` and active change artifacts in `openspec/changes/` win.
