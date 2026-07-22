/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-clients. Base: cards.
 * Source: https://www.ensemble.com/ (client logos section)
 * Generated: 2026-07-22
 *
 * Client logos are images with no accompanying text, so each logo maps to a
 * single-cell row. Row 1 = block name (handled by createBlock); each following
 * row holds one logo image.
 *
 * The source logos are inline base64 SVGs (no fetchable URL). They were
 * extracted to committed files at /icons/client-<slug>.svg, keyed by the logo
 * alt text. Rebuild each logo <img> to point at that committed asset.
 */
export default function parse(element, { document }) {
  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const logos = Array.from(element.querySelectorAll('img'));

  // Empty-block guard.
  if (logos.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  logos.forEach((logo) => {
    const alt = (logo.getAttribute('alt') || '').trim();
    // Reference the committed /icons/client-<slug>.svg. The placeholder host is
    // rewritten to a root-relative path by the homepage-sections transformer;
    // the importer recognizes the /icons/NAME.svg pattern as an EDS icon.
    const icon = document.createElement('img');
    icon.setAttribute('src', `https://LOCAL.ICONS/icons/client-${slugify(alt)}.svg`);
    icon.setAttribute('alt', alt);
    cells.push([icon]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-clients', cells });
  element.replaceWith(block);
}
