---
name: contrast-parity-judgment
description: "Use this when an accessibility audit (Lighthouse, PSI, axe, etc.) flags a color-contrast or similar finding on a page that is a deliberate 1:1 reproduction of an existing source design. Covers telling a faithful-reproduction exception from a genuine migration defect by measuring the same ratio on both source and candidate, and recording a confirmed exception durably so it is not re-litigated on every page that reuses the same design token."
---

# Contrast Parity Judgment

## Related Skills
- **visual-fidelity-loop** — this skill is normally invoked from that loop's best-practice audit step, but is also usable standalone against any single accessibility finding.

## When to Use This Skill
Whenever an accessibility audit flags a `color-contrast` (or similarly styling-based) finding on a page whose job is to faithfully reproduce an existing source design, rather than to be a fresh, unconstrained design. In that situation there's a real, structural conflict: the mandate to match source exactly and the mandate to meet an accessibility standard can point in opposite directions for the same element. Don't resolve this by picking a side from intuition — measure it.

## Step 1: Identify the finding's underlying design token
Don't treat the finding as belonging to one page or one element instance. Identify the actual design decision behind it — a specific color variable, a specific component style — since the same token is very likely reused across many pages. Judging and recording at the token level, not the page level, means the work done here doesn't need repeating every time the same token shows up somewhere else.

## Step 2: Measure both sides
Compute the actual contrast ratio (or whatever metric the audit tool uses) for the flagged element on both the source-of-truth page and the candidate page. Use the same algorithm the auditor itself would use for determining the *effective* background — for contrast specifically, that means walking up the ancestor chain to find the first actually-opaque background color, not just reading the element's own (possibly transparent) background. Getting this walk wrong is the single most common way to get a false result in either direction.

**Mark complete when:** you have a real, computed number for both source and candidate, not an assumption that they're "probably the same" because the CSS looks like it was copied.

## Step 3: Decide
- **MATCH** (the two ratios are equal, or equal within a small, explicitly stated tolerance) → this is a confirmed, faithful reproduction of an existing design choice, not a migration defect. Leave the color alone. The underlying design problem — if it really is one — belongs upstream, on the source design itself, not as a patch applied only during migration.
- **DRIFT** (the ratios genuinely differ) → this is a real defect introduced during migration. Fix it to match source's actual color precisely — the goal is restoring fidelity to source, not satisfying the accessibility standard in the abstract. If the fix also happens to improve the accessibility score, that's a side effect of correctness, not the goal itself.

Never resolve this step by eyeballing "these look close enough to be the same" — always cite the two measured numbers.

## Step 4: Record durably, keyed by token
Write the finding down somewhere persistent: the token/element identified in Step 1, both measured ratios, and the verdict. Key the record by the design token, not by the specific page it was first found on — so when the same token shows up flagged on a different page later, the answer is "already confirmed, see this record" instead of re-running the whole judgment from scratch.

**Mark complete when:** the verdict and both numbers are written somewhere a future check on the same token will actually find them.

## Troubleshooting
| Symptom | Likely cause |
|---|---|
| A finding you're confident should MATCH comes back as DRIFT | The effective-background walk didn't find the same ancestor background on both sides — recheck the walk, not the raw color values |
| A finding you're confident should DRIFT comes back as MATCH | The source fetch may be stale/cached, or you're comparing the wrong element on one side |
| The same token gets re-flagged on every new page | The record from Step 4 isn't actually being checked before re-measuring — fix the process, not the token |

## Resources
Point this skill at whatever ratio-measurement tooling the current project provides, and at wherever confirmed exceptions get recorded (check the project's own docs — this skill deliberately doesn't hardcode either).
