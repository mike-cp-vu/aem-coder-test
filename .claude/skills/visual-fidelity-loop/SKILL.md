---
name: visual-fidelity-loop
description: "Use this when validating a migrated or restyled Edge Delivery Services page against its source of truth before considering a visual change complete. Covers the test-compare-fix-revalidate loop with stitch-and-diff screenshot tooling and DOM-level content diffing, plus the false-positive/false-negative traps that make screenshot- and computed-style-based checks unreliable read in isolation: stale caches, stitching artifacts, sticky-positioning false positives, compression-garbled fetches, ancestor-vs-element style probes, and framework breakpoint assumptions."
---

# Visual Fidelity Loop

## Related Skills
- **contrast-parity-judgment** — invoke from Step 7 when a best-practice audit flags a color-contrast (or similar accessibility) finding on a page that's meant to faithfully reproduce a source design.
- **aem-pr-discipline** — the natural next step once this loop passes: pushing the change and opening a PR.

## When to Use This Skill
- Before reporting any migration/restyling change as "done."
- After any fix to a migrated page, as re-validation — not just the first pass.
- Whenever a screenshot, pixel-diff percentage, or computed-style check produces a result that seems off, too clean, or unchanged after a real edit — that's a signal to apply this skill's trap catalogue (Step 3), not to trust the number at face value.

This skill assumes a project has some way to (a) screenshot a URL at a given viewport width, (b) pixel-diff two screenshots, and (c) DOM/content-diff two URLs. If those don't exist yet, build minimal versions before proceeding — the methodology below doesn't depend on any specific tool, only on having all three capabilities.

**Automated 0% is necessary, not sufficient.** A page can pass every automated check in Steps 1-3 below and still have real, visible defects the tooling simply didn't measure — this has happened for real on at least one project's reference page (see Step 4). Steps 1-3 are the fast first pass, not the whole gate: Step 4's human visual checkpoint is mandatory even on a clean read, not an optional extra step for when something looks off.

## Step 1: Capture responsive screenshots
Screenshot both the source-of-truth page and the candidate page at every breakpoint the project cares about — never desktop-only. A single width can look perfect while others are badly broken.

If the project has both a "live/adversarial" source (a real external site that may actively resist automated capture) and a "local/preview" candidate (your own dev/staging environment, with no such adversarial protection), prefer whichever capture tool fits each side rather than forcing one tool to do both: a stealth-hardened headless-browser script for the adversarial side, a lighter/interactive tool (e.g. a browser MCP already used elsewhere in your toolchain) for the cooperative side. Don't assume the lighter tool for the cooperative side is a drop-in replacement without checking it reproduces the same capture behavior (see the lazy-load gotcha in the Troubleshooting table) — validate this once, not on faith.

**Consent/overlay gotcha:** cookie-consent banners and marketing popups corrupt a full-page screenshot capture if not dismissed first. A dismiss mechanism with a *default* candidate list (common "Accept"/"Agree" button patterns) will miss sites using unusual copy (e.g. a button labeled just "Dismiss"). If a captured screenshot shows a banner or overlay repeating down the page or sitting over content, that's not cosmetic noise — it's actively corrupting every pixel measurement below it. Add a site-specific dismiss selector rather than accepting the noise.

**Mark complete when:** you have one screenshot per side per breakpoint, and a visual skim confirms no banner/overlay artifact is present in any of them.

## Step 2: Compare precisely
Run both comparisons, not just one:
- **Pixel diff** between same-width screenshot pairs — get a number, not a vibe. If the tool supports a per-band breakdown (dividing the page into horizontal strips), use it.
- **Content/DOM diff** between the two live URLs — this catches what pixels can miss or actively mislead on (see Step 3).

**Band-breakdown discipline:** read a per-band breakdown top-down. Fix the *first* hot band's root cause before treating every other hot band as a separate bug — bands below the first real defect are frequently "offset-contaminated": once something above them is the wrong height, everything below inherits that vertical shift and shows up as "different" even though its own content and styling are already correct. Fix the top band, re-measure the whole page, and only then decide whether lower bands are still real.

**Never trust a screenshot alone for a content claim.** A screenshot can make it look like text or an element is missing when it's actually present but styled differently, mid-transition, or landed in a stitching seam. Before reporting "X is missing," corroborate with the DOM/content diff or a direct query against the live page. Screenshots are for *visual* claims; DOM diffs are for *content* claims — don't use one to answer the other's question.

**Mark complete when:** you have a pixel-diff percentage (plus band breakdown if available) and a content-diff result for every breakpoint, and any screenshot-suggested content issue has been independently confirmed against the DOM.

## Step 3: Distinguish real defects from measurement artifacts
Every trap below caused a real, wrong conclusion at least once. Work through this list whenever a measurement looks surprising — either surprisingly bad (before assuming a defect) or surprisingly good/unchanged (before assuming a fix worked or didn't).

- **Stitching artifact from fixed/sticky chrome.** If a screenshot is built by scrolling and capturing in chunks, any `position: fixed`/`sticky` element gets re-captured at the top of every chunk — this is *correct* behavior, not a bug, and produces a visually odd repeating-header look in the raw screenshot. Don't "fix" this; it reflects real page behavior.
- **Symmetric vs. asymmetric sticky repeats.** If both the source and the candidate have genuinely sticky/fixed chrome, the repeats are a fair, symmetric artifact on both sides — not a discrepancy. If only one side repeats, that's a real behavioral difference (one page's header actually stays pinned, the other's doesn't) worth investigating as a defect, not dismissing as noise.
- **Height-mismatch "offset contamination."** When the two pages being compared have different total content heights, repeating chrome (or any periodic element) lands at different Y-positions in each stitched image purely because of the height difference — inflating the pixel-diff number in a way that has nothing to do with any single visual defect at that band. If pixel-diff stays high after fixing an obvious defect, check whether overall page height still differs before chasing individual bands further.
- **Stale-capture trap.** After making a real fix and re-deploying, a fresh screenshot capture can come back byte-identical to the pre-fix version — even though an independent check (e.g. querying a live computed style on a fresh page load) proves the underlying change is genuinely live. Always hash/diff a new capture against the previous run before trusting a "nothing changed" result; a suspiciously identical measurement after a real fix is a signal to check for staleness in the capture path itself, not proof the fix failed. Re-running the exact same capture command a second time, or capturing via a distinctly different method, will usually reveal whether the first result was stale.
- **Fetch decoding trap.** Fetching a text asset (CSS, HTML) directly and seeing binary-looking garbage instead of readable text almost always means the response is compressed (gzip/brotli) and the fetch tool didn't request or apply decompression — not that the deployed file is broken or empty. Decode properly before concluding anything about the deploy.
- **Layout-probe trap.** When probing a computed layout property (e.g. a grid/flex track value) on an element to determine a breakpoint, also check the element's `display` at that same width. A property like a grid-template can hold a stale or simply-unused value when the element isn't actually in that layout mode at the probed width (e.g. it's in `flex` mode at that width, with an inert `grid-template` sitting unused, ready to activate at a wider breakpoint) — reading the property alone, without confirming the display mode, produces a misleading conclusion about where the real breakpoint is.
- **`position: sticky` false positive.** A computed style check reporting `position: sticky` does NOT prove the element is *behaviorally* sticky — sticky positioning silently no-ops when the element's immediate parent has the same height as the element itself, leaving no room to "stick" within. Confirm real stickiness by scrolling the page and screenshotting — if the element isn't still pinned at the viewport edge after a real scroll, it's not working regardless of what the computed style says. The fix is usually to move the sticky positioning to an ancestor that has genuine extra height/scroll room, not to add more properties to the non-working element.
- **Framework breakpoint assumption trap.** Never assume a CSS framework's named breakpoint (e.g. a "small/medium/large" tier) maps to a specific pixel value for a given project without checking — and don't assume it maps to the pixel value you'd guess from the class name alone. Empirically probe computed styles at boundary pixel pairs (one pixel below and at a suspected threshold) to find both the exact width where a property changes and *which* property changes there — a project can have multiple distinct breakpoints bundled under what looks like one visual "jump," and misattributing which measured change belongs to which threshold produces a wrong fix.

**Mark complete when:** every surprising measurement (unexpectedly bad or unexpectedly unchanged) has been explained by one of the above or ruled out, not just accepted at face value.

## Step 4: Human visual checkpoint (mandatory, even at 0% automated diff)
Present the user with the exact URL for each side at every breakpoint tested — the candidate and the source-of-truth, not a description of them — plus the automated findings from Steps 2-3 for context. Then stop and wait for the user's actual reply.

**Why this step exists and can't be skipped on a clean read:** an automated pixel-diff/content-diff pass reporting 0%/no-findings is proof that *what the tooling measured* matches — not proof nothing is wrong. This has happened for real: a project's own reference page was reported as passing this loop at 0%, and real styling issues only surfaced later, on a subsequent re-validation pass the first pass should have caught. A checkpoint that only asks the user to approve the AI's own compiled finding list doesn't close that gap — it just adds a rubber stamp on top of the same blind spot. The user has to look at the actual rendered page, independently of what the automated steps above measured.

This step runs **twice** per iteration: once here, before any fix is written (to catch what Steps 1-3 missed going in), and again after Step 6's revalidation (to confirm the fix actually worked, not just that the automated re-measurement says so).

**Mark complete when:** the user has actually responded — confirming a match, or describing what's still wrong, possibly including things the automated steps above never flagged.

## Step 5: Implement the fix
Fix what Steps 2-4 measured and what the user reported, not what looks aesthetically off to you. Before editing a selector that's global or shared across multiple pages/components, check what else currently depends on the behavior you're about to change — a fix that's correct for the page you're testing can be a regression for another page relying on the current (buggy, for your purposes) behavior on purpose.

**Mark complete when:** the fix is applied and its blast radius (what else uses this selector/component) has been checked, not just this one page.

## Step 6: Revalidate
Repeat Steps 1-2 against the same URLs and widths, then return to **Step 4** and get the user's explicit re-confirmation — the loop's "done" condition is automated 0% **and** explicit human confirmation, not either alone. The automated goal is still zero: 0% pixel diff, 0 structural/content findings, at every breakpoint checked — not "under some threshold." If the user still sees a problem after a fix (whether or not the automated tools agree), loop back to Step 5, not silently past the checkpoint. Anything short of both bars clearing is either an unresolved bug or a genuine platform constraint that needs to be named explicitly, not silently accepted as "close enough."

**Mark complete when:** every breakpoint shows 0% (or an explicitly named, justified exception) **and** the user has explicitly confirmed the fix, before moving to Step 7.

## Step 7: Confirm best-practice audit
Run whatever performance/accessibility/best-practices audit tooling is available (e.g. a local Lighthouse-equivalent) against the deployed candidate URL. Prefer running this locally/immediately over waiting on a slower external CI check — treat the external check as confirmation that the local result agreed, not as the first opportunity to discover a problem.

Route any color-contrast (or similar accessibility) finding through **contrast-parity-judgment** before touching any color — don't assume it's a defect, and don't assume it's fine either.

**Mark complete when:** the audit has run against the real deployed artifact and every finding has either been fixed or explicitly resolved as a confirmed non-defect.

## Troubleshooting
| Symptom | Likely cause | Check |
|---|---|---|
| Screenshot shows a repeating header/footer | Fixed/sticky chrome captured at each scroll chunk | Confirm it's symmetric on both sides; not a bug if so |
| Pixel diff stays high after an obvious fix | Height mismatch causing offset contamination | Compare total page heights, not just the one band |
| A screenshot suggests content is missing | Content is present but mis-tagged/mis-styled, or landed in a stitching seam | Cross-check against a DOM/content diff |
| Pixel diff is unchanged after a real fix | Stale capture | Hash the new capture against the previous run; re-capture via a different method |
| A fetched CSS/HTML file looks like binary garbage | Missing decompression | Decode gzip/brotli before concluding the deploy is broken |
| A layout property reads correctly but the layout looks wrong | Element isn't in that display mode at the probed width | Check `display` alongside the property |
| `position: sticky` computed correctly but doesn't stick on scroll | Parent height equals element height, no room to stick | Move sticky to an ancestor with real scroll room |
| A responsive breakpoint doesn't match the framework's "expected" pixel value | Framework class-name assumption vs. project reality | Probe boundary pixel pairs empirically |
| A lighter/interactive capture tool used for the cooperative side comes back with gray boxes where images should be | It didn't trigger lazy-loading before shooting | Scroll through the page first (or use a tool that does), then capture; fall back to the stealth-hardened script if it can't be made to work reliably |
| Automated diff reads 0%/no-findings but the user still spots a problem | Steps 1-3 measured correctly but didn't measure the right thing | Don't argue with the user's eyes — treat it as real, go to Step 5; consider whether a new automated check should be added so this class of issue gets caught next time |

## Resources
Point this skill at whatever screenshot/pixel-diff/content-diff tooling the current project provides (check the project's own docs for exact commands, flags, and breakpoints — this skill deliberately doesn't hardcode any of those, since they vary per project). If the project has both an adversarial live source and a cooperative local/preview candidate, expect (and prefer) two different capture tools split along that line rather than one tool for both — see Step 1.
