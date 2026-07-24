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
 * fetchable URL). The "Our Services" icons are IDENTICAL across all 20 ad pages,
 * so they were extracted once and committed to /icons/ad-svc-*.png; this parser
 * restores them by keying off each source item's img alt (First service, ...).
 * We emit a LOCAL.ICONS placeholder host that the ad-cleanup transformer rewrites
 * to a root-relative /icons/ path (so WebImporter.adjustImageUrls leaves it
 * alone). The "Connecting Your AI Ecosystem" icons (alt "Row one") vary per
 * campaign and are intentionally NOT restored — those items stay body-only.
 */

// Source item alt -> committed shared service icon slug. "Sixth service" is
// reused for two cards (Adobe Technologies, then Forward Deployed Engineering),
// disambiguated by occurrence order within the section.
const SERVICE_ICONS = {
  'First service': 'ad-svc-ai',
  'Second service': 'ad-svc-strategy',
  'Third service': 'ad-svc-streaming',
  'Fourth service': 'ad-svc-appweb',
  'Fifth service': 'ad-svc-content',
  'Sixth service': ['ad-svc-adobe', 'ad-svc-fde'],
};

export default function parse(element, { document }) {
  const items = Array.from(element.children)
    .filter((c) => c.textContent.trim() || c.querySelector('img'));

  // Resolve the committed shared icon slug for an item from its source img alt.
  const occ = {};
  const iconSlugFor = (item) => {
    const img = item.querySelector('img');
    const alt = img ? (img.getAttribute('alt') || '').trim() : '';
    const map = SERVICE_ICONS[alt];
    if (!map) return null;
    if (Array.isArray(map)) {
      occ[alt] = (occ[alt] || 0) + 1;
      return map[occ[alt] - 1] || map[map.length - 1];
    }
    return map;
  };

  // Decide table shape once: 2-column only if at least one item maps to a
  // shared service icon (i.e. this is the "Our Services" instance).
  const anyIcon = items.some((it) => iconSlugFor(it));
  // reset occurrence counter consumed by the probe above
  Object.keys(occ).forEach((k) => delete occ[k]);

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

    if (anyIcon) {
      const slug = iconSlugFor(item);
      const iconCell = [];
      if (slug) {
        const icon = document.createElement('img');
        icon.setAttribute('src', `https://LOCAL.ICONS/icons/${slug}.png`);
        icon.setAttribute('alt', title);
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
