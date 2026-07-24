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
 * fetchable URL), so they were extracted and committed under /icons/.
 *  - "Our Services" icons are IDENTICAL across all 20 ad pages → committed once
 *    as /icons/ad-svc-*.png, keyed off each item's img alt (First service, ...).
 *  - "Connecting Your AI Ecosystem" icons (alt "Row one") VARY per campaign →
 *    committed per page as /icons/ad-eco-<slug>-<n>.png (n = 1-based position),
 *    where <slug> is the page path (e.g. adsgenstudio). Resolved from the page
 *    URL passed to the parser.
 * Both emit a LOCAL.ICONS placeholder host that the ad-cleanup transformer
 * rewrites to a root-relative /icons/ path (so adjustImageUrls leaves it alone).
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

export default function parse(element, { document, url, params }) {
  // Derive the page slug (e.g. "adsgenstudio") for per-campaign ecosystem icons.
  let pageSlug = '';
  try {
    const u = (params && params.originalURL) || url || '';
    const seg = new URL(u).pathname.replace(/\/+$/, '').split('/').filter(Boolean).pop() || '';
    pageSlug = seg.toLowerCase();
  } catch (e) {
    pageSlug = '';
  }

  const items = Array.from(element.children)
    .filter((c) => c.textContent.trim() || c.querySelector('img'));

  // Is this the ecosystem instance? (its items carry alt "Row one")
  const isEcosystem = items.some((it) => {
    const img = it.querySelector('img');
    return img && (img.getAttribute('alt') || '').trim() === 'Row one';
  });

  // Resolve the committed shared SERVICE icon slug for an item from its img alt.
  const occ = {};
  const serviceSlugFor = (item) => {
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

  // 2-column table when icons apply: the "Our Services" instance (mapped service
  // icons) OR the "Connecting Your AI Ecosystem" instance (per-page eco icons).
  const anyIcon = isEcosystem || items.some((it) => serviceSlugFor(it));
  Object.keys(occ).forEach((k) => delete occ[k]); // reset probe counter

  let ecoIndex = 0;
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
      let slug = null;
      if (isEcosystem) {
        // Per-campaign eco icon, keyed by page slug + 1-based position.
        ecoIndex += 1;
        slug = pageSlug ? `ad-eco-${pageSlug}-${ecoIndex}` : null;
      } else {
        slug = serviceSlugFor(item);
      }
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
