/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-ad-feature. Base: cards.
 * Source: ad landing pages — the icon feature grids on the brand-blue bands:
 * "Connecting Your AI Ecosystem" (3 items) and "Our Services" (7 items). Each
 * item is: icon + bold title (h3) + optional subtitle line + description.
 *
 * Cards convention (2 columns with images, 1 column without): one row per card.
 * cards-ad-feature.js treats a cell with an icon/picture and no heading as the
 * image cell and the rest as the body. We emit:
 *   cell 1: the icon image (only when a real, non-data icon exists)
 *   cell 2: body — title (h3), optional subtitle (p), description (p)
 *
 * IMAGE HANDLING: the source icons are inline data: base64 placeholders (no
 * fetchable URL), so per the skip-data: rule they are dropped and every card is
 * body-only (a consistent 1-column table), which the block renders gracefully.
 * Any real /static/ or ctfassets icon is kept (yielding a consistent 2-column
 * table).
 */
export default function parse(element, { document }) {
  const abs = (s) => (s && s.startsWith('//') ? `https:${s}` : s);
  const realSrc = (im) => {
    const s = im.getAttribute('src') || '';
    return s && !s.startsWith('data:') && !s.startsWith('blob:');
  };

  const items = Array.from(element.children)
    .filter((c) => c.textContent.trim() || c.querySelector('img'));

  // Decide table shape once: 2-column only if at least one item has a real icon.
  const anyRealIcon = items.some((it) => Array.from(it.querySelectorAll('img')).some(realSrc));

  const cells = [];
  items.forEach((item) => {
    const body = [];

    const titleEl = item.querySelector('h1, h2, h3, h4, h5, h6');
    const title = titleEl ? titleEl.textContent.trim() : '';
    if (title) {
      const h = document.createElement('h3');
      h.textContent = title;
      body.push(h);
    }

    const paras = Array.from(item.querySelectorAll('p, div, span'))
      .filter((el) => el.children.length === 0 && el.textContent.trim())
      .map((el) => el.textContent.trim())
      .filter((t) => t && t !== title);
    const seen = new Set();
    paras.forEach((t) => {
      if (seen.has(t)) return;
      seen.add(t);
      const p = document.createElement('p');
      p.textContent = t;
      body.push(p);
    });

    if (!body.length) return;

    if (anyRealIcon) {
      const iconImg = Array.from(item.querySelectorAll('img')).find(realSrc);
      const iconCell = [];
      if (iconImg) {
        const icon = document.createElement('img');
        icon.setAttribute('src', abs(iconImg.getAttribute('src') || ''));
        icon.setAttribute('alt', iconImg.getAttribute('alt') || title);
        iconCell.push(icon);
      }
      cells.push([iconCell, body]);
    } else {
      cells.push([body]);
    }
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-ad-feature', cells });
  element.replaceWith(block);
}
