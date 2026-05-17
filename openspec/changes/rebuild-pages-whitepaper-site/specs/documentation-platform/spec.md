## ADDED Requirements

### Requirement: GitHub Pages uses locale gateway entry points
The documentation site SHALL use a root language gateway and expose curated homepages at `/en/` and `/zh/` as the primary public entry points.

#### Scenario: Opening the root documentation URL
- **WHEN** a visitor opens the GitHub Pages root URL
- **THEN** the site SHALL route the visitor to `/en/` or `/zh/` through a dedicated language gateway page or client-side redirect

#### Scenario: Navigating from a locale homepage
- **WHEN** a visitor lands on `/en/` or `/zh/`
- **THEN** the page SHALL provide the full academy-style navigation context for that locale instead of behaving like a thin mirror of the README

### Requirement: Core visual artifacts remain legible in both themes
The documentation site SHALL render logos, diagrams, charts, SVG assets, and interactive visuals with sufficient contrast in both light mode and dark mode.

#### Scenario: Viewing a structural diagram in light mode
- **WHEN** a visitor switches to light mode
- **THEN** the diagram strokes, labels, accents, and backgrounds SHALL remain readable without relying on dark-mode-only colors

#### Scenario: Viewing an interactive visualization in dark mode
- **WHEN** a visitor opens a chart or playground in dark mode
- **THEN** canvas, SVG, and chart colors SHALL derive from theme-aware tokens rather than fixed hard-coded values

### Requirement: GitHub Pages follows an academy-style information architecture
The documentation site SHALL guide visitors through a curated sequence of overview, guided evaluation, architecture explanation, evidence, and reference material.

#### Scenario: Evaluating the project from the homepage
- **WHEN** a new visitor lands on a locale homepage
- **THEN** the page SHALL present direct paths into quick understanding, architecture study, empirical evidence, and external reference material

#### Scenario: Browsing the site navigation
- **WHEN** a visitor uses the top navigation or sidebar
- **THEN** the structure SHALL foreground guide, academy, architecture, evidence, and reference roles rather than a flat collection of unrelated doc buckets

## MODIFIED Requirements

### Requirement: GitHub Pages has a dedicated positioning role
The GitHub Pages site SHALL present the project as a focused technical whitepaper, architecture showcase, and guided academy instead of a visual copy of the README.

#### Scenario: Landing on the documentation homepage
- **WHEN** a user opens the root GitHub Pages URL or a locale homepage
- **THEN** the homepage SHALL explain what the library is, why it is differentiated, what its capability boundaries are, where to start, and how to evaluate it further through curated paths

#### Scenario: Splitting responsibilities between README and Pages
- **WHEN** documentation content is updated
- **THEN** README SHALL remain the concise repository entry point while Pages SHALL carry the richer showcase, curated learning path, and architecture-oriented explanation

### Requirement: Documentation theme reflects technical domain identity
The visual design SHALL align with GPU compute and signal processing aesthetics while supporting both dark and light presentation modes as first-class experiences.

#### Scenario: Establishing brand cohesion
- **WHEN** a visitor lands on any documentation page
- **THEN** the color system, typography, spacing, and component styling SHALL communicate a technical, high-performance, research-oriented identity rather than a generic SaaS docs appearance

#### Scenario: Switching between themes
- **WHEN** a visitor toggles light mode or dark mode
- **THEN** the site SHALL preserve the same technical identity and clarity instead of degrading into a low-contrast fallback theme
