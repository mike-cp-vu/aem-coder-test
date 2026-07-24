/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-office.
 * Base: cards. Sources:
 *   - https://www.ensemble.com/contact/ (office locations grid)
 *   - https://www.ensemble.com/about/ ("Our Offices" flex row)
 *
 * Structure (Cards, 2 columns):
 *   - Row 1: block name.
 *   - One row per office. Cell 1: office photo image(s). Cell 2: city heading
 *     (h2), optional tel link, and multi-line address paragraphs.
 *
 * The two source pages differ in wrapper layout:
 *   - Contact page: a `.grid` whose direct children are office cards.
 *   - About page: `div.flex.flex-col.bg-[#EFF3F4]` -> `div.flex...` row wrapper
 *     -> per-office `div` (image + h2 city). Cards are grandchildren and there
 *     is a trailing "CONTACT US" button wrapper with no h2.
 *
 * To handle both, office cards are located as the DEEPEST wrappers that contain
 * a city heading (`h2`), rather than assuming a fixed depth. Wrappers that only
 * contain nested office cards (e.g. the flex row) are excluded so each office
 * yields exactly one row.
 */
export default function parse(element, { document }) {
  const grid = element.matches('[class*="grid"]') ? element : element.querySelector('[class*="grid"]');
  const scope = grid || element;

  // Candidate cards: every wrapper containing an h2 city heading. Keep only the
  // "leaf" wrappers — those that do NOT themselves contain another wrapper with
  // its own h2 — so a row/grid container that holds multiple office cards is
  // not mistaken for a single card.
  const withHeading = Array.from(scope.querySelectorAll('div'))
    .filter((div) => div.querySelector('h2'));
  const cards = withHeading.filter(
    (div) => !withHeading.some((other) => other !== div && div.contains(other)),
  );

  const cells = [];

  cards.forEach((card) => {
    // --- Cell 1: images. Keep only the desktop image set. ---
    // Some cards have a mobile-only wrapper (.sm:hidden) holding a phone-crop
    // variant plus a desktop wrapper. Skip images inside a mobile-only wrapper,
    // then dedupe by src as a safety net.
    const imgCell = [];
    const seen = new Set();
    Array.from(card.querySelectorAll('img')).forEach((img) => {
      if (img.closest('[class*="sm:hidden"]')) return;
      const src = img.getAttribute('src');
      if (src && !seen.has(src)) {
        seen.add(src);
        imgCell.push(img);
      }
    });

    // --- Cell 2: heading + optional tel link + address paragraphs. ---
    const textCell = [];
    const heading = card.querySelector('h2');
    if (heading) textCell.push(heading);

    // Tel link (skip empty tel:null placeholders).
    const telLink = card.querySelector('a[href^="tel:"]');
    if (telLink && telLink.textContent.trim() && telLink.getAttribute('href') !== 'tel:null') {
      const p = document.createElement('p');
      p.append(telLink);
      textCell.push(p);
    }

    // Address paragraphs.
    Array.from(card.querySelectorAll('p')).forEach((p) => {
      if (p.textContent.trim()) textCell.push(p);
    });

    cells.push([imgCell.length ? imgCell : '', textCell.length ? textCell : '']);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-office', cells });
  element.replaceWith(block);
}
