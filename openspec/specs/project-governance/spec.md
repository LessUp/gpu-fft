## Requirements

### Requirement: OpenSpec is the single governance source
The repository SHALL treat `openspec/` as the only normative source for repository governance, change control, and implementation planning.

#### Scenario: Starting a new repository change
- **WHEN** a maintainer or coding agent starts a non-trivial change
- **THEN** the change SHALL be proposed and tracked through OpenSpec artifacts before implementation begins

#### Scenario: Encountering conflicting legacy guidance
- **WHEN** a legacy file conflicts with an OpenSpec artifact or canonical governance document
- **THEN** the OpenSpec artifact or canonical governance document SHALL take precedence and the conflicting legacy guidance SHALL be removed, archived, or explicitly marked non-authoritative

### Requirement: Governance documents have canonical owners
The repository SHALL maintain one canonical document per AI/tooling entry point and SHALL avoid parallel documents that restate the same project rules with conflicting detail.

#### Scenario: Providing project instructions to an AI coding tool
- **WHEN** an AI coding tool needs repository-specific instructions
- **THEN** the repository SHALL provide one maintained canonical instruction file for that tool family and SHALL link or defer legacy variants instead of duplicating the same guidance

#### Scenario: Reviewing governance document sprawl
- **WHEN** a governance or instruction file is found to be stale, redundant, or low-value
- **THEN** it SHALL be deleted, archived, or reduced to a pointer to the canonical document

### Requirement: Closeout scope is explicit
The repository SHALL document that the current project phase prioritizes stabilization, documentation accuracy, workflow simplification, and archive-readiness over net-new feature expansion.

#### Scenario: Evaluating proposed work during closeout
- **WHEN** a new task is considered during the closeout phase
- **THEN** the task SHALL be justified in terms of quality, consistency, maintainability, or archive-readiness before it is accepted
