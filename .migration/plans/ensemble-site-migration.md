# Ensemble.com Full-Site Migration Plan

## Objective
Migrate the entire `https://www.ensemble.com/` website into this AEM Edge Delivery Services project — every top-level page and its detail/listing sub-pages — reproducing content structure, block layout, and visual design so each page renders correctly in local preview and matches the source **responsively**, at every breakpoint.

## Source & Target
- **Source:** `https://www.ensemble.com/` (Gatsby-rendered marketing site)
- **Target site:** `aem-coder-test` (preview org `mike-cp-vu`, see `.migration/project.json`)
- **Content authoring:** Adobe Document Authoring (DA / da.live). **Google Docs are no longer part of this workflow** — do not generate Google-Doc-ready HTML for new pages. `migration-work/contact-google-doc.html` is a leftover artifact from the old contact-only workflow; it is not part of the current process and should not be used as a template.
- **Content review:** every page goes through the **DA content-approval workflow** in da.live before publish. Treat this as a required gate, not an optional step — do not consider a page migrated until it has cleared DA approval, in addition to the visual-fidelity gate below.
- **Prior work:** the contact page (`/contact/`) was migrated under `.migration/plans/contact-page-migration.md` before this plan existed. Treat it as the reference/first archetype, not something to redo — its blocks (`form-contact`, `cards-office`, `cards-team`) are the starting point for the block palette below.

## Site crawl — what actually exists on ensemble.com

Crawled `www.ensemble.com` nav, footer, and each top-level page on 2026-08-06. No public sitemap for the live domain resolved to real content (`/sitemap-index.xml` points at an unrelated `ensemblesoftware.ro` sitemap with mismatched URL patterns — **do not treat it as authoritative**; it appears to be a stale/misconfigured entry). Page inventory below is from direct navigation + on-page link crawling.

| Page | Path | Notes |
|---|---|---|
| Home | `/` | Hero, client logo strip, likely service/portfolio teasers, CTA |
| Services | `/services/` | Single page, 8 service categories via in-page anchors (`#app_development`, `#web_development`, `#streaming_ott`, `#adobe_technologies`, `#adobe_enterprise`, `#ux_ui_design`, `#product_project_management`, `#forward_deployed_engineering`) |
| Portfolio (index) | `/portfolio/` | Filterable case-study grid, "Load More" pagination — 12+ items visible, likely more |
| Portfolio (detail) | e.g. `/emea/portfolio/{slug}/` | One template, many instances — needs a repeatable archetype, not per-page hand authoring |
| Products (index) | `/products/` | Lists ≥4 products: Ensemble QAi, Ensemble Streams, Ensemble Flow, Sales Journal, (BPrime) |
| Products (detail) | e.g. `/products/ensembe-streams/` | One template, one instance per product |
| About | `/about/` | Intro, core values, philosophy, departments, **global offices (5 locations)**, company farm, company timeline, client roster, CTA |
| Careers | `/careers/` | Hero, culture, benefits (8 categories), team departments, employee testimonials, CTA |
| Contact | `/contact/` | **Done** — see `contact-page-migration.md` |
| Legal | `/privacy/`, `/cookies/`, `/terms/` | Plain text pages — default content only, no blocks expected |
| Header / Footer | global | Footer adds `/privacy/`, `/cookies/`, `/terms/`, phone, email, LinkedIn/Instagram/Facebook — content-only change via the existing `header`/`footer` fragments, no code change needed |

Not yet enumerated: the full portfolio list (only a "Load More"-gated subset was visible) and whether `/emea/` region-variant pages are in scope. **Confirm with the user whether region variants (`/emea/...`) should be migrated, or only the primary/global site**, before building the portfolio import at scale.

## Block palette mapping — reuse before building new

Existing blocks (`hero`, `columns`, `cards`, `cards-office`, `cards-team`, `footer`, `form-contact`, `fragment`, `header`, `widget`) already cover a meaningful share of the new pages:

| Source content pattern | Reuse this block | New block needed? |
|---|---|---|
| Global offices (About) — same "image + heading + phone + address" shape as Contact | `cards-office` (direct reuse) | No |
| Departments / team grids (About, Careers) — same "name + title (+ email)" shape as Contact leadership | `cards-team` (direct reuse) | No |
| Generic 2–3 column content (core values, philosophy, culture, benefits) | `columns` | No |
| Generic card grids (departments, benefit categories, product highlights) | `cards` | No |
| Banners / page intros (every page) | `hero` | No |
| Header / footer nav, legal links, social icons | `header` / `footer` (content-only via DA) | No |
| Client logo strip (Home, About) | — | **Yes** — no logo-grid block exists; needs its own variant (`cards` with an `imagePattern: logos` characteristic is a plausible starting point) |
| Portfolio grid with filter + "Load More" | — | **Yes** — no existing block supports client-side filtering/pagination |
| Portfolio / case-study detail template | — | Possibly reuse `hero` + `columns` + `cards`; evaluate once the first case-study page is scraped — only build a dedicated block if the existing composition can't carry structured fields (client, industry, tech stack) |
| Company timeline (About) | — | **Yes** — no timeline/milestone block exists |
| Employee testimonials (Careers) | — | **Yes** — no quote/testimonial block exists |

Follow the existing `metadata.json` convention (see `cards-office`/`cards-team`/`form-contact`) for every new block variant so reuse guidance stays discoverable.

## Approach

Run the same single-page workflow used for Contact — scrape → analyze structure → map/create blocks → build import infrastructure → generate → verify → migrate visual design — but scaled across pages, grouped by shared template:

1. **Confirm scope** — region variants in/out (see open question above), and get the full portfolio/product URL list (crawl past "Load More", or get it from the user/CMS export).
2. **Group pages into archetypes**, not one-by-one: `home`, `services`, `portfolio-index`, `portfolio-detail` (×N via one template), `products-index`, `products-detail` (×N via one template), `about`, `careers`, `contact` (done), `legal` (×3, default-content only).
3. **Per archetype:** scrape → identify sections/blocks against the mapping table above → extend `tools/importer/parsers/` and `tools/importer/transformers/` → add an entry to `tools/importer/page-templates.json` → generate content HTML for DA upload (via the `generate-import-html`/`page-import` skill rules — never hand-write the HTML).
4. **Upload to DA** (`da-auth` + `da-content` skills) and run the **DA content-approval** workflow before treating any page as content-complete.
5. **Visual-fidelity + responsive gate, per page, mandatory:**
   - Use Chrome DevTools MCP against the local preview, or `stardust:replica`'s measured gate, against the live `ensemble.com` equivalent page.
   - Check every breakpoint the source site uses (mobile / tablet / desktop — confirm the project's `600px`/`900px`/`1200px` convention from `AGENTS.md` lines up with what the source actually does responsively; don't assume it does).
   - A page is not done until it passes this gate — matching desktop only is not sufficient.
6. **Lint** (`npm run lint`) on every batch of block/script changes.

## Notes / Open Questions
- Region variants (`/emea/...` etc.): in scope or not? Confirm before bulk-importing portfolio/product detail pages, since the same case studies appear to exist under both region-prefixed and unprefixed paths.
- Full portfolio count is unknown (paginated via "Load More"); need either a crawl past pagination or an authoritative list from the user.
- No new external dependencies — all work stays vanilla JS/CSS per `AGENTS.md`.
