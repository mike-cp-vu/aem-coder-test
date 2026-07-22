/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-portfolio. Base: cards.
 * Source: https://www.ensemble.com/ (portfolio project grid section)
 * Generated: 2026-07-22
 *
 * Cards convention: 2 columns, one row per card.
 *  - Row 1: block name (handled by createBlock)
 *  - Cell 1: portfolio project image (mandatory)
 *  - Cell 2: category label linked to the portfolio detail page
 *
 * The source carousel duplicates each tile across multiple slides (~20 anchors
 * for 6 unique projects), so tiles are de-duplicated by href to yield the 6
 * unique projects.
 */
export default function parse(element, { document }) {
  const anchors = Array.from(
    element.querySelectorAll('a[href*="/portfolio/"], a[href*="/products/"], a.group[href]'),
  );

  const cells = [];
  const seen = new Set();

  anchors.forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (!href || seen.has(href)) return;

    const img = anchor.querySelector('img');
    const label = anchor.querySelector('p');
    // Require both an image and a label for a valid card.
    if (!img || !label) return;

    seen.add(href);

    // Cell 2: category label wrapped in a link to the detail page.
    const link = document.createElement('a');
    link.setAttribute('href', href);
    link.textContent = label.textContent.trim();

    cells.push([img, link]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-portfolio', cells });
  element.replaceWith(block);
}
