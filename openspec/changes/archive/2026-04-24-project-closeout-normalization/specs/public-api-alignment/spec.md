## ADDED Requirements

### Requirement: Public API claims are consistent across surfaces
The repository SHALL keep public API names, behavior claims, and support boundaries consistent across implementation exports, OpenSpec, README, and documentation pages.

#### Scenario: Changing a public API contract
- **WHEN** an exported API is added, removed, renamed, or behaviorally changed
- **THEN** the implementation, OpenSpec API documentation, README references, and relevant docs pages SHALL be updated together in the same change

#### Scenario: Detecting a mismatched API description
- **WHEN** a public API is described differently in two repository surfaces
- **THEN** the mismatch SHALL be resolved in favor of the actual supported contract and the inaccurate description SHALL be corrected or removed

### Requirement: Performance and acceleration claims are precise
The repository SHALL distinguish GPU-accelerated functionality from CPU-only utilities and SHALL avoid overstating support or acceleration scope.

#### Scenario: Describing mixed GPU and CPU features
- **WHEN** documentation or marketing copy mentions spectrum analysis, image filtering, or FFT acceleration
- **THEN** it SHALL clearly state which parts are GPU-accelerated and which parts remain CPU-based

#### Scenario: Presenting benchmark-based claims
- **WHEN** speedup or capability claims are published in README or Pages
- **THEN** the claim SHALL be supportable by repository benchmarks or be removed

