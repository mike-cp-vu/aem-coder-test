/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-service-detail. Base: cards.
 * Source: https://www.ensemble.com/services/ (repeating service-detail items)
 * Generated: 2026-07-23
 *
 * Each parser invocation receives ONE service-detail item element
 * (`div[data-testid="<slug>-service-container"]`). The template's instances[]
 * lists 8 such sibling containers, so the parser produces a one-row cards block
 * per item; the importer merges them into the single cards-service-detail block.
 *
 * Cards convention (library-description.txt): 2 columns, one row per card.
 *  - Row 1: block name (handled by createBlock)
 *  - Cell 1: icon image (mandatory)
 *  - Cell 2: stacked text content — H2 title, optional platform-logo strip,
 *            description paragraph, optional client-logo strip, and up to two
 *            CTA links.
 *
 * IMAGE HANDLING (see migration-work/page-structure.json gotcha):
 *  - Service icons are inline data:image/svg+xml;base64 URIs on the live page
 *    (stripped to a placeholder at scrape time). The identical icons were
 *    already committed at /icons/service-<slug>.svg for the homepage services
 *    grid, keyed by the service title. Rebuild the icon <img> to point at that
 *    committed asset via the LOCAL.ICONS placeholder host, which the services
 *    cleanup transformer rewrites to a root-relative /icons/ path.
 *  - Platform/client logos are lazy-loaded on the live page: at scrape time
 *    their src is a blob:/placeholder, and even when resolved they are a mix of
 *    inline data URIs and root-relative /static/*.svg — both of which the
 *    Document Authoring sanitizer mishandles. All 30 distinct logos have been
 *    committed locally at /icons/logo-<slug>.svg (slug derived from the img
 *    alt text, e.g. "Android logo" → logo-android). Rebuild each logo <img> to
 *    point at its committed asset via the LOCAL.ICONS placeholder host, which
 *    the services cleanup transformer rewrites to a root-relative /icons/ path.
 */

// CTA label → destination page. The source renders CTAs as <button> elements
// with no href; map by (case-insensitive) label to the correct route.
const CTA_HREFS = {
  'view our portfolio': '/portfolio/',
  'contact us': '/contact/',
};

export default function parse(element, { document }) {
  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  // Rebuild a logo <img> to reference its committed /icons/logo-<slug>.svg asset
  // (slug from the alt text, e.g. "Android logo" → logo-android). The live src
  // is lazy/blob/inline and unreliable, so we key purely off alt text. Emit via
  // the LOCAL.ICONS placeholder host; the cleanup transformer strips it to a
  // root-relative /icons/ path after adjustImageUrls.
  const committedLogo = (img) => {
    const alt = (img.getAttribute('alt') || '').trim();
    const slug = slugify(alt.replace(/\blogo\b/i, ''));
    const out = document.createElement('img');
    out.setAttribute('src', `https://LOCAL.ICONS/icons/logo-${slug}.svg`);
    out.setAttribute('alt', alt);
    return out;
  };

  // Title (H2) — mandatory for a valid service item.
  const heading = element.querySelector('h2, h1, h3');
  const title = heading ? heading.textContent.trim() : '';
  if (!title) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Icon: reference the committed /icons/service-<slug>.svg for this title.
  const icon = document.createElement('img');
  icon.setAttribute('src', `https://LOCAL.ICONS/icons/service-${slugify(title)}.svg`);
  icon.setAttribute('alt', `${title} icon`);

  const contentCell = [];

  // Title as an <h2> heading.
  const h = document.createElement('h2');
  h.textContent = title;
  contentCell.push(h);

  // Optional platform-logo strip: absolutize each /static/*.svg logo and keep
  // them together in a wrapping paragraph so they render as an inline strip.
  const productLogos = element.querySelector('[data-testid="product-logos-container"]');
  if (productLogos) {
    const logos = Array.from(productLogos.querySelectorAll('img'));
    if (logos.length) {
      const strip = document.createElement('p');
      logos.forEach((logo) => strip.appendChild(committedLogo(logo)));
      contentCell.push(strip);
    }
  }

  // Description paragraph(s) that are NOT inside a logo container.
  const paragraphs = Array.from(element.querySelectorAll('p')).filter(
    (p) => !p.closest('[data-testid="product-logos-container"]')
      && !p.closest('[data-testid="client-logos-container"]'),
  );
  paragraphs.forEach((p) => contentCell.push(p));

  // Optional client-logo strip.
  const clientLogos = element.querySelector('[data-testid="client-logos-container"]');
  if (clientLogos) {
    const logos = Array.from(clientLogos.querySelectorAll('img'));
    if (logos.length) {
      const strip = document.createElement('p');
      logos.forEach((logo) => strip.appendChild(committedLogo(logo)));
      contentCell.push(strip);
    }
  }

  // Up to two CTAs: source uses <button> (no href) or <a>. Convert each to an
  // <a> pointing at the mapped route so it round-trips as a link.
  const ctaEls = Array.from(element.querySelectorAll('a[href], button'));
  ctaEls.forEach((cta) => {
    const label = cta.textContent.trim();
    if (!label) return;
    const key = label.toLowerCase();
    const href = cta.getAttribute && cta.getAttribute('href')
      ? cta.getAttribute('href')
      : CTA_HREFS[key];
    if (!href) return;
    const link = document.createElement('a');
    link.setAttribute('href', href);
    link.textContent = label;
    contentCell.push(link);
  });

  const cells = [[icon, contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-service-detail', cells });
  element.replaceWith(block);
}
