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
 * Most logos are inline base64 SVG <img>; Radiant Logic is a raster image.
 * The <img> element (with its src/alt) is preserved verbatim.
 */
export default function parse(element, { document }) {
  const logos = Array.from(element.querySelectorAll('img'));

  // Empty-block guard.
  if (logos.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  logos.forEach((logo) => {
    cells.push([logo]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-clients', cells });
  element.replaceWith(block);
}
