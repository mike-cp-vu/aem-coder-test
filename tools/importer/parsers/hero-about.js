/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-about. Base: hero.
 * Source: https://www.ensemble.com/about/ (top intro hero)
 * Generated: 2026-07-24
 *
 * Hero convention (library-description.txt): 1 COLUMN, up to 3 rows.
 *   - Row 1: block name (handled by createBlock)
 *   - Row 2: background image (optional) — OMITTED here. This is a text-on-light
 *            hero with no image on the About page; hero-about.js adds the
 *            `no-image` modifier when the first content row has no picture.
 *   - Row 3: content cell — Title (heading) + Subheading (additional text)
 *            + optional Call-to-Action.
 *
 * Because the block is single-column, EVERY row has exactly one cell. The
 * content row's single cell stacks all of the text content.
 *
 * Source structure (see migration-work/block-context/hero-about/source.html):
 *   div.flex.flex-col ...
 *     div.text-sm.uppercase                 -> eyebrow "ABOUT US"
 *     div.text-2xl.font-extrabold ...        -> headline, rendered twice:
 *       div.block.lg:hidden  (mobile line-broken variant)
 *       div.hidden.lg:block  (desktop line-broken variant)  <-- use this one
 *     p.mt-6 ...                             -> intro paragraph "Since 1995 ..."
 *     div.mt-7 (empty CTA slot)              -> ignored (no CTA on this hero)
 *
 * Only ONE headline variant is emitted (the desktop one) so the headline text
 * is not duplicated. The multiple inner <div> lines are joined into one heading.
 */
export default function parse(element, { document }) {
  const cells = [];

  // --- Optional Row 2: background image. None on the About hero, but keep the
  // logic defensive in case a variant of this hero includes one. ---
  const bgImage = element.querySelector('img');
  if (bgImage) cells.push([bgImage]);

  // --- Row 3: content cell (single-column => one cell). ---
  const contentCell = [];

  // Eyebrow label (e.g. "ABOUT US"). Small uppercase label above the headline.
  const eyebrowEl = element.querySelector('.uppercase, [class*="uppercase"]');
  const eyebrowText = eyebrowEl ? eyebrowEl.textContent.trim() : '';
  if (eyebrowText) {
    const eyebrow = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = eyebrowText;
    eyebrow.appendChild(strong);
    contentCell.push(eyebrow);
  }

  // Headline: the source renders two responsive variants (mobile + desktop),
  // each with the line broken across inner <div>s. Prefer the desktop variant
  // (hidden lg:block); fall back to the mobile variant; finally to the whole
  // headline wrapper. Join inner text into one heading string.
  const headlineWrapper = element.querySelector('.font-extrabold, [class*="font-extrabold"]');
  let headlineSource = null;
  if (headlineWrapper) {
    headlineSource = headlineWrapper.querySelector('[class*="lg:block"]')
      || headlineWrapper.querySelector('[class*="lg:hidden"]')
      || headlineWrapper;
  }
  if (headlineSource) {
    // The headline is split across inner <div> lines (with an empty spacer
    // div in the desktop variant). Join the per-line text with spaces so
    // adjacent words don't run together ("with" + "a" -> "with a").
    const lineDivs = Array.from(headlineSource.querySelectorAll(':scope > div'));
    const headlineText = (lineDivs.length
      ? lineDivs.map((d) => d.textContent.trim()).filter(Boolean).join(' ')
      : headlineSource.textContent.replace(/\s+/g, ' ').trim());
    if (headlineText) {
      const h1 = document.createElement('h1');
      h1.textContent = headlineText;
      contentCell.push(h1);
    }
  }

  // Subheading / intro paragraph(s).
  Array.from(element.querySelectorAll('p')).forEach((p) => {
    if (p.textContent.trim()) contentCell.push(p);
  });

  // Empty-block guard: bail if nothing meaningful was extracted.
  if (contentCell.length === 0 && cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  if (contentCell.length) cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-about', cells });
  element.replaceWith(block);
}
