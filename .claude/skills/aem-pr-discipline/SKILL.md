---
name: aem-pr-discipline
description: "Use this when about to push Edge Delivery Services code changes and open a pull request, or while waiting on a feature-branch preview or CI checks. Covers never pushing directly to main, confirming a preview is actually live via a real content marker instead of a blind sleep, watching PR checks in the background instead of blocking on them, what a complete PR description must reference, and the explicit human-only boundary at merge time."
---

# AEM PR Discipline

## Related Skills
- **visual-fidelity-loop** — run this and get it to pass before opening the PR; a PR shouldn't be the first time a visual change gets checked against source.

## When to Use This Skill
Any time you're about to push a code/content change intended to become a pull request, or you're already waiting on a feature-branch preview build or CI checks to resolve.

## Step 1: Always work on a feature branch
Never push directly to `main` (or whatever the production branch is called). This holds even when you're confident the change is small or correct — the review/merge gate exists precisely so a human sees the change before it reaches production, and that gate only works if changes actually go through a branch and PR.

**Mark complete when:** `git status`/`git branch` confirms you're not on the production branch before any push.

## Step 2: Wait for the real preview, not a timer
After pushing, some build/sync process needs to finish before the branch's preview URL reflects the new code. Don't guess how long that takes with a fixed sleep — poll for a real, specific marker that the new content is actually live (a piece of text, a computed style value, a file hash that should have changed) and stop polling once that marker is present. A fixed sleep either wastes time waiting past when the content was actually ready, or — worse — isn't long enough and lets you proceed to test against stale content without realizing it.

**Mark complete when:** you've confirmed the specific change is present on the preview URL, not just that "enough time" has passed.

## Step 3: Watch checks in the background, don't block
Once a PR is open, status checks (lint, visual regression, performance audits, etc.) take real time to run. Poll for their result in the background rather than blocking the whole session on a sleep-and-check loop — this lets other work continue while waiting, and avoids the failure mode of giving up on a check that just needed more time.

**Mark complete when:** you have the actual final status of every check, not an assumption based on how long it's been.

## Step 4: Write a PR description that names what was measured
A PR description that just says "fixed the bug" throws away exactly the information a reviewer needs and that the fidelity loop already produced. Include: the feature-preview URL (and, for a visual change, the exact path that demonstrates it), which breakpoints/widths were checked, the actual diff percentages or content-diff results, and the outcome of any accessibility/performance audit. If any known deviation or accepted exception exists (see contrast-parity-judgment), state it explicitly rather than letting a reviewer discover and re-litigate it.

**Mark complete when:** a reviewer could verify your claims from the PR description alone, without re-deriving them from scratch.

## Step 5: Stop at the human boundary
Merging the PR into the production branch is a human decision, always — regardless of how green every automated check is. Do not merge automatically, even when explicitly asked to "finish" the work; report that everything is ready for review and let the actual merge action come from the user.

**Mark complete when:** the PR is open, checks are reported, and the merge itself has not been performed by you.

## Troubleshooting
| Symptom | Likely cause | Check |
|---|---|---|
| Checks "look stuck" / nothing seems to be happening | The preview build itself may not have finished yet | Confirm the content marker from Step 2 is actually present before assuming the check process is broken |
| A check fails right after passing before | The push may not have actually included the latest commit, or the preview hadn't caught up | Re-verify the marker and the exact commit SHA under test |

## Resources
Point this skill at the current project's actual branch/PR/CI conventions (exact preview URL format, which check names to expect, how to poll them) — check the project's own docs, since these vary per project and per hosting setup.
