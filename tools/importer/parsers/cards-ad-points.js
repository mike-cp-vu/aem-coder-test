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
 * (no fetchable URL). These 4 "Why Choose" icons are IDENTICAL across all 20 ad
 * pages, so they were extracted once and committed to /icons/ad-why-*.png; this
 * parser restores them by keying off each source item's img alt (Expertise
 * first/second/third/fourth photo). It emits a LOCAL.ICONS placeholder host that
 * the ad-cleanup transformer rewrites to a root-relative /icons/ path.
 */

// Source item alt -> committed shared "Why Choose" icon slug.
const POINT_ICONS = {
  'Expertise first photo': 'ad-why-partnership',
  'Expertise second photo': 'ad-why-products',
  'Expertise third photo': 'ad-why-supplychain',
  'Expertise fourth photo': 'ad-why-crossplatform',
};

export default function parse(element, { document }) {
  const items = Array.from(element.children)
    .filter((c) => c.textContent.trim() || c.querySelector('img'));

  const slugFor = (item) => {
    const img = item.querySelector('img');
    const alt = img ? (img.getAttribute('alt') || '').trim() : '';
    return POINT_ICONS[alt] || null;
  };

  const anyIcon = items.some((it) => slugFor(it));

  const cells = [];
  items.forEach((item) => {
    const text = Array.from(item.querySelectorAll('p, div, span'))
      .map((el) => (el.children.length === 0 ? el.textContent.trim() : ''))
      .find((t) => t) || item.textContent.trim();
    if (!text) return;

    const p = document.createElement('p');
    p.textContent = text;

    if (anyIcon) {
      const slug = slugFor(item);
      const iconCell = [];
      if (slug) {
        const icon = document.createElement('img');
        icon.setAttribute('src', `https://LOCAL.ICONS/icons/${slug}.png`);
        icon.setAttribute('alt', text);
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
