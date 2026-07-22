/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-office.
 * Base: cards. Source: https://www.ensemble.com/contact/
 * Structure (Cards, 2 columns):
 *   - Row 1: block name.
 *   - One row per office. Cell 1: office photo image(s). Cell 2: city heading
 *     (h2), tel link, and multi-line address paragraphs.
 */
export default function parse(element, { document }) {
  const grid = element.matches('[class*="grid"]') ? element : element.querySelector('[class*="grid"]');
  const scope = grid || element;

  // Each office card is a direct child wrapper of the grid.
  const cards = Array.from(scope.children).filter((child) => child.querySelector('h2'));

  const cells = [];

  cards.forEach((card) => {
    // --- Cell 1: images. Keep only the desktop image set. ---
    // Each card has a mobile-only wrapper (.sm:hidden) holding a phone-crop
    // variant plus a desktop wrapper (.hidden.sm:flex). Skip images inside a
    // mobile-only wrapper, then dedupe by src as a safety net.
    const imgCell = [];
    const seen = new Set();
    Array.from(card.querySelectorAll('img')).forEach((img) => {
      if (img.closest('[class*="sm:hidden"]')) return;
      const src = img.getAttribute('src');
      if (src && !seen.has(src)) {
        seen.add(src);
        imgCell.push(img);
      }
    });

    // --- Cell 2: heading + tel link + address paragraphs. ---
    const textCell = [];
    const heading = card.querySelector('h2');
    if (heading) textCell.push(heading);

    // Tel link (skip empty tel:null placeholders).
    const telLink = card.querySelector('a[href^="tel:"]');
    if (telLink && telLink.textContent.trim() && telLink.getAttribute('href') !== 'tel:null') {
      const p = document.createElement('p');
      p.append(telLink);
      textCell.push(p);
    }

    // Address paragraphs.
    Array.from(card.querySelectorAll('p')).forEach((p) => {
      if (p.textContent.trim()) textCell.push(p);
    });

    cells.push([imgCell.length ? imgCell : '', textCell.length ? textCell : '']);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-office', cells });
  element.replaceWith(block);
}
