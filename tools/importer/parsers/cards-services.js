/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-services. Base: cards.
 * Source: https://www.ensemble.com/ (services grid section)
 * Generated: 2026-07-22
 *
 * Cards convention: 2 columns, one row per card.
 *  - Row 1: block name (handled by createBlock)
 *  - Cell 1: service icon image (mandatory)
 *  - Cell 2: title (h3, linked to /services/#anchor) + subtitle tech list + description
 *
 * Each service item is a `div.max-w-[260px]` containing an icon anchor/img and
 * a `div.flex.flex-col` text block.
 */
export default function parse(element, { document }) {
  // Service items: the fixed-width item containers.
  let items = Array.from(element.querySelectorAll(':scope > div[class*="max-w-"]'));
  if (items.length === 0) {
    items = Array.from(element.querySelectorAll(':scope > div'));
  }

  const cells = [];

  items.forEach((item) => {
    const icon = item.querySelector('img');
    const heading = item.querySelector('h3, h2, h4');
    const subtitle = item.querySelector('span');
    const description = item.querySelector('p');

    // A valid service card needs at least a title.
    if (!heading) return;

    // Determine the link href for this service (icon anchor or heading anchor).
    const linkEl = item.querySelector('a[href]');
    const href = linkEl ? linkEl.getAttribute('href') : null;

    const contentCell = [];

    // Title as an <h3>; when a link exists, nest the <a> INSIDE the heading
    // (standard EDS pattern) so it round-trips as a heading, not "### " text.
    const h = document.createElement('h3');
    if (href) {
      const titleLink = document.createElement('a');
      titleLink.setAttribute('href', href);
      titleLink.textContent = heading.textContent.trim();
      h.appendChild(titleLink);
    } else {
      h.textContent = heading.textContent.trim();
    }
    contentCell.push(h);

    if (subtitle) contentCell.push(subtitle);
    if (description) contentCell.push(description);

    // Cell 1 = icon (empty string if missing so row stays 2-column).
    cells.push([icon || '', contentCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-services', cells });
  element.replaceWith(block);
}
