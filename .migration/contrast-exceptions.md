# Confirmed contrast exceptions — source-inherited, not migration defects

Tracks `color-contrast` (Lighthouse/PSI) findings that were measured against
the live ensemble.com source and confirmed to be an exact reproduction of
source's own color choice, not something introduced during migration. See
AGENTS.md § "Accessibility findings vs. source-inherited defects" for the
policy. Re-verify with `tools/fidelity-gate/contrast-parity.mjs` if any of
these underlying color tokens ever change.

Measured 2026-08-06 against `https://www.ensemble.com/contact/` vs.
`https://fix-contact-fidelity-1to1--aem-coder-test--mike-cp-vu.aem.page/contact`.

| Element | Colors | Source ratio | Migrated ratio | Verdict |
|---|---|---|---|---|
| "Contact" eyebrow label | `#9a9a9a` on white | 2.81:1 | 2.81:1 | MATCH — confirmed exception |
| Leadership job titles (`cards-team`) | `#7d7d7d` on `#eff3f4` | 3.68:1 | 3.68:1 | MATCH — confirmed exception |
| Leadership email links (`cards-team`) | `--link-color` (`#2886bb`) on `#eff3f4` | 3.60:1 | 3.60:1 | MATCH — confirmed exception |
| Primary/CTA buttons (SUBMIT, email CTA) | white on `--brand-orange` (`#ff8e2f`) | 2.29:1 | 2.29:1 | MATCH — confirmed exception |

All four use site-wide design tokens (`--brand-orange`, `--link-color`, the
`cards-team` job-title grey, `--eyebrow-color`) that appear across many pages,
not just Contact — this table's verdicts apply anywhere these tokens are
reused, not only on `/contact`. If a future page shows the *same* token
flagged with a *different* ratio than listed here, that's a real signal
something else changed (background, font-size affecting the "large text"
WCAG threshold, etc.) and needs its own measurement, not an assumption that
this table still applies.
