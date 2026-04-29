## ADDED Requirements

### Requirement: GPU FFT engine SHALL cache plans for multiple transform sizes
The GPU FFT engine SHALL retain reusable per-size plan resources for more than one transform size at a time.

#### Scenario: Alternating 2D transform sizes reuse previously prepared plans
- **WHEN** the engine executes transforms for one supported size, then a second supported size, then the first size again
- **THEN** the engine SHALL be able to reuse cached resources for the repeated size instead of rebuilding every plan from scratch

### Requirement: GPU FFT plan caching SHALL remain bounded
The GPU FFT engine SHALL bound plan-cache growth so that long-lived processes do not accumulate unbounded GPU resources.

#### Scenario: Exceeding cache capacity evicts an older size entry
- **WHEN** the engine prepares plans for more sizes than the configured cache capacity
- **THEN** the engine SHALL evict at least one older cached size entry before admitting a new one

#### Scenario: Dispose releases all cached plan resources
- **WHEN** the engine is disposed
- **THEN** the engine SHALL release resources associated with every cached plan entry
