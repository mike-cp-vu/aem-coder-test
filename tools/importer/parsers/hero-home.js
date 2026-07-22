/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-home. Base: hero.
 * Source: https://www.ensemble.com/ (hero + stats banner section)
 * Generated: 2026-07-22
 *
 * Hero library structure: 1 column, 3 rows.
 *  - Row 1: block name (handled by createBlock)
 *  - Row 2: background image (optional)
 *  - Row 3: title (H1) + optional subheading/CTA
 *
 * The source element also contains the stats grid (handled by the separate
 * cards-stats block), so we deliberately extract ONLY the background image
 * and the headline here.
 */
export default function parse(element, { document }) {
  // Background image: the absolutely-positioned cover image behind the hero.
  const bgImage = element.querySelector(
    'img.object-cover, img[class*="object-cover"], img',
  );

  // Headline: the H1 in the hero text overlay. Its three lines live in separate
  // <div>s (verb / "ALL THINGS" / "DIGITAL") which flatten into concatenated
  // text on import. Rebuild as a single H1 with <br> between lines so they stay
  // on separate lines. Also normalize the animated verb to canonical "WE DEVELOP".
  const heading = element.querySelector('h1, h2, [class*="max-w-"] h1');
  if (heading) {
    const lineDivs = heading.querySelectorAll(':scope > div');
    let lines;
    if (lineDivs.length > 0) {
      lines = [...lineDivs].map((d) => d.textContent.trim()).filter(Boolean);
    } else {
      lines = [heading.textContent.trim()];
    }
    if (lines[0] && /^WE\b/i.test(lines[0])) lines[0] = 'WE DEVELOP';
    heading.textContent = '';
    lines.forEach((line, i) => {
      if (i > 0) heading.appendChild(document.createElement('br'));
      heading.appendChild(document.createTextNode(line));
    });
  }

  // Empty-block guard: bail if neither key element is present.
  if (!bgImage && !heading) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (optional).
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 3: single cell holding the headline (and any future subheading/CTA).
  const contentCell = [];
  if (heading) contentCell.push(heading);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-home', cells });

  // The stats grid lives inside this hero container and is handled by the
  // separate cards-stats block. Preserve that node by moving it out to be a
  // sibling AFTER the hero block, so the cards-stats parser (which holds a
  // reference to it) can still replace it in place.
  const statsGrid = element.querySelector('div.grid.grid-cols-3, [class*="grid-cols-3"]');
  if (statsGrid) {
    element.replaceWith(block, statsGrid);
  } else {
    element.replaceWith(block);
  }
}
