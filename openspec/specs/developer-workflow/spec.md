## Requirements

### Requirement: OpenSpec-first development workflow is enforced
The repository SHALL define a lightweight workflow of explore/propose/apply/review/merge for non-trivial work and SHALL keep implementation tasks traceable to OpenSpec artifacts.

#### Scenario: Starting implementation work
- **WHEN** a maintainer or agent begins a non-trivial repository change
- **THEN** the work SHALL be anchored to an OpenSpec change with proposal, design/spec context, and actionable tasks

#### Scenario: Reaching a review checkpoint
- **WHEN** a workstream changes repository architecture, public docs structure, or engineering workflow
- **THEN** the work SHALL pass through a deliberate `/review`-style inspection before merge

### Requirement: Tool roles are explicit
The repository SHALL define clear roles for Claude, Codex, Copilot, OpenSpec commands, review mode, and subagents so that multiple tools do not compete as parallel sources of process truth.

#### Scenario: Choosing a tool for repository work
- **WHEN** a maintainer or agent selects a tool path
- **THEN** the canonical workflow document SHALL explain which tool is preferred for exploration, implementation, review, and long-running execution

#### Scenario: Managing cost-sensitive agent usage
- **WHEN** a task can be completed with local commands, skills, or lightweight subagents
- **THEN** the workflow SHALL prefer those approaches over heavier remote or higher-cost modes such as unnecessary `/fleet` usage

### Requirement: Local environment guidance is project-specific
The repository SHALL provide project-specific guidance for Chinese Copilot responses, recommended LSP setup, and MCP/plugin trade-offs without over-prescribing user environment state.

#### Scenario: Configuring local AI tooling
- **WHEN** a maintainer wants to configure Copilot, LSP, MCP, or related plugins for this project
- **THEN** the repository SHALL provide a concise recommendation that explains what is useful, what is optional, and what should be avoided for context-cost reasons
