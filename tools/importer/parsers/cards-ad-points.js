/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-ad-points. Base: cards.
 * Source: ad landing pages — the "Why Choose Ensemble" proof-point row: 4 items,
 * each an icon above a short text point (e.g. "Adobe partnership spanning 25+
 * years").
 *
 * Cards convention (2 columns with images, 1 column without): one row per point.
 * cards-ad-points.js treats a cell with an icon/picture and no heading as the
 * image cell and the rest as the short text body. We emit:
 *   cell 1: the icon image (only when a real, non-data icon exists)
 *   cell 2: the short text point (paragraph)
 *
 * IMAGE HANDLING: the source point icons are inline data: base64 placeholders
 * (no fetchable URL), so per the skip-data: rule they are dropped and each point
 * becomes a consistent text-only (1 column) card, rendered gracefully.
 */
export default function parse(element, { document }) {
  const abs = (s) => (s && s.startsWith('//') ? `https:${s}` : s);
  const realSrc = (im) => {
    const s = im.getAttribute('src') || '';
    return s && !s.startsWith('data:') && !s.startsWith('blob:');
  };

  const items = Array.from(element.children)
    .filter((c) => c.textContent.trim() || c.querySelector('img'));

  const anyRealIcon = items.some((it) => Array.from(it.querySelectorAll('img')).some(realSrc));

  const cells = [];
  items.forEach((item) => {
    const text = Array.from(item.querySelectorAll('p, div, span'))
      .map((el) => (el.children.length === 0 ? el.textContent.trim() : ''))
      .find((t) => t) || item.textContent.trim();
    if (!text) return;

    const p = document.createElement('p');
    p.textContent = text;

    if (anyRealIcon) {
      const iconImg = Array.from(item.querySelectorAll('img')).find(realSrc);
      const iconCell = [];
      if (iconImg) {
        const icon = document.createElement('img');
        icon.setAttribute('src', abs(iconImg.getAttribute('src') || ''));
        icon.setAttribute('alt', iconImg.getAttribute('alt') || '');
        iconCell.push(icon);
      }
      cells.push([iconCell, [p]]);
    } else {
      cells.push([[p]]);
    }
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-ad-points', cells });
  element.replaceWith(block);
}
