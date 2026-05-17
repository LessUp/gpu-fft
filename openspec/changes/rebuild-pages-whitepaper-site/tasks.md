## 1. Governance and information architecture

- [x] 1.1 Write and verify the OpenSpec proposal, design, and documentation-platform delta for the Pages rebuild
- [x] 1.2 Create the whitepaper design spec and implementation plan under `docs/superpowers/`
- [x] 1.3 Define the new locale gateway, navigation model, and target page map before touching theme code

## 2. Docs shell rebuild

- [x] 2.1 Rewrite `docs/.vitepress/config.ts` to adopt the locale gateway structure and new sidebar / nav model
- [x] 2.2 Simplify `docs/.vitepress/theme/index.ts` and rebuild `docs/.vitepress/theme/styles/custom.css` around dual-theme tokens
- [x] 2.3 Add or refactor shared diagram / matrix / visual components that the new pages depend on

## 3. Content and asset reconstruction

- [ ] 3.1 Rebuild the English and Chinese homepages plus the guided hub pages under `docs/en/**` and `docs/zh/**`
- [ ] 3.2 Rewrite the highest-value shared technical pages in `docs/architecture/**`, `docs/showcase/**`, `docs/reference/**`, `docs/setup/quick-start.md`, and `docs/playground/index.md`
- [ ] 3.3 Replace or fix theme-sensitive SVG and visual assets so they remain readable in both light and dark mode

## 4. Verification and finish

- [ ] 4.1 Run the canonical repo validation chain plus docs build and address regressions
- [ ] 4.2 Review public wording against README and OpenSpec so GPU vs CPU-only claims stay accurate
