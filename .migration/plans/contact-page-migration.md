# Contact Page Migration Plan — ensemble.com/contact

## Objective
Migrate `https://www.ensemble.com/contact/` into this AEM Edge Delivery Services project — reproducing its content structure, block layout, and visual design so it renders correctly in the local preview.

## Source
- **URL:** https://www.ensemble.com/contact/
- **Target site:** aem-coder-test (preview org: mike-cp-vu)
- **Project state:** Fresh boilerplate — existing blocks: `cards`, `columns`, `footer`, `fragment`, `header`, `hero`, `widget`. No import infrastructure (`tools/importer/`) exists yet.

## Approach
Run the single-page migration workflow: scrape → analyze structure → map/create blocks → build import infrastructure (parsers/transformers) → run the import to generate content HTML → verify in preview → migrate the visual design.

## Checklist

- [ ] **Confirm project type** (doc / da / xwalk) and the Block Library endpoint to use for block discovery
- [ ] **Scrape the page** — capture cleaned HTML, metadata, screenshots, and download images
- [ ] **Analyze page structure** — identify sections, content sequences, and authoring decisions (default content vs. blocks)
- [ ] **Survey block palette** — match content to existing blocks (hero, cards, columns, etc.); flag any new block variants needed
- [ ] **Create/adjust block variants** for any content the existing blocks don't cover (e.g. contact form, map, address/office info)
- [ ] **Build import infrastructure** — page template, block parsers, and page transformers under `tools/importer/`
- [ ] **Generate & run the bundled import script** to produce the content HTML in the content directory (not hand-written)
- [ ] **Preview & verify** rendering at the local dev server; compare against the original page and fix structural issues
- [ ] **Migrate visual design** — extract source styles and apply block/section CSS so the page visually matches the original
- [ ] **Visual critique pass** — validate the migrated page against the original and iterate on styling gaps
- [ ] **Lint** (`npm run lint`) and confirm the page renders cleanly

## Notes / Open Questions
- Contact pages commonly include a **form**, **map embed**, and **office/address details** — these may require new block variants or a `widget`/`fragment` treatment. I'll confirm the right approach once the structure analysis reveals what's actually on the page.
- No new external dependencies will be added; all work follows boilerplate conventions (vanilla JS/CSS, mobile-first, scoped selectors).

> Execution requires Execute mode. Approve this plan to proceed, and I'll start with project-type confirmation and scraping the page.
