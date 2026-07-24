/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-key-points. Base: cards (no images).
 * Source: portfolio detail pages — "Initiative Key Considerations" and
 * "Results and Deliverables" text grids.
 *
 * Cards (no images) convention: 1 column, one row per item.
 *  - Cell 1: bold sub-heading (h3) + descriptive paragraph.
 *
 * The parser receives the grid container whose children are the individual
 * items, each an <h1> (source uses h1 for the item title) + <p>. The title is
 * re-emitted as an <h3> so it renders as a heading without clashing with the
 * page's single h1.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.children).filter((c) => c.textContent.trim());
  const cells = [];

  items.forEach((item) => {
    const titleEl = item.querySelector('h1, h2, h3, h4, h5, h6, strong, b');
    const title = titleEl ? titleEl.textContent.trim() : '';
    const para = Array.from(item.querySelectorAll('p'))
      .map((p) => p.textContent.trim())
      .find((t) => t)
      || Array.from(item.querySelectorAll('div'))
        .map((d) => (d.children.length === 0 ? d.textContent.trim() : ''))
        .filter((t) => t && t !== title)[0]
      || '';

    if (!title && !para) return;

    const cell = [];
    if (title) {
      const h = document.createElement('h3');
      h.textContent = title;
      cell.push(h);
    }
    if (para) {
      const p = document.createElement('p');
      p.textContent = para;
      cell.push(p);
    }
    cells.push([cell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-key-points', cells });
  element.replaceWith(block);
}
