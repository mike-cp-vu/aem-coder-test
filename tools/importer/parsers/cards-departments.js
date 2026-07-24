/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-departments. Base: cards.
 * Source: https://www.ensemble.com/about/ ("Our Team" department grid)
 * Generated: 2026-07-24
 *
 * Cards convention (library-description.txt): 2 columns, one row per card.
 *   - Row 1: block name (handled by createBlock)
 *   - Cell 1: department photo (mandatory)
 *   - Cell 2: department label (a two-word name split across two <h2> lines in
 *             the source, e.g. "Software" + "Development") emitted as a single
 *             heading.
 *
 * Selector (page-templates.json instances[]): the `div.grid` inside
 * `main > div > *:nth-child(5)`. Each card is a
 * `div.py-1 > div.flex.flex-col.w-fit` containing:
 *   div.rounded... > img            -> department photo
 *   div.mt-4.uppercase              -> two <h2> lines forming the label
 *
 * IMAGE HANDLING: These are PHOTOGRAPHIC department images (not logos), so they
 * are NOT routed through the LOCAL.ICONS placeholder. Three of the four cards
 * resolve to root-relative `/static/*.webp` URLs on the live page
 * (WebImporter.adjustImageUrls absolutizes them to the source origin so
 * Document Authoring rehosts them) — the original <img> is passed through
 * unchanged for those. The first card ("Software Development") is a lazy inline
 * base64 webp that the browser only ever exposes as an unusable blob:/data:
 * URI (the DA sanitizer would strip it), so it is mapped by label to a
 * committed copy at /images/dept-software-development.webp via the LOCAL.IMAGES
 * placeholder host (the import script rewrites LOCAL.IMAGES/images/... to a
 * root-relative /images/ path).
 */

// Lazy department photos with no usable hosted URL (blob:/data: at load time),
// keyed by their (lowercased) label -> committed /images/ asset.
const IMAGE_FALLBACKS = {
  'software development': 'https://LOCAL.IMAGES/images/dept-software-development.webp',
};

export default function parse(element, { document }) {
  // The parser receives the grid element (or an ancestor). Locate the grid.
  const grid = element.matches('[class*="grid"]')
    ? element
    : element.querySelector('[class*="grid"]');
  const scope = grid || element;

  // Each card is a direct child wrapper of the grid that contains an image.
  const cards = Array.from(scope.children).filter((child) => child.querySelector('img'));

  const cells = [];

  cards.forEach((card) => {
    // --- Cell 1: department photo (pass the original element through). ---
    const img = card.querySelector('img');

    // --- Cell 2: label. The source splits the name across two <h2> lines;
    // join them into a single heading so it round-trips as one title. ---
    const labelWrapper = card.querySelector('[class*="uppercase"]') || card;
    const labelLines = Array.from(labelWrapper.querySelectorAll('h1, h2, h3, h4'))
      .map((h) => h.textContent.trim())
      .filter(Boolean);
    const labelText = labelLines.length
      ? labelLines.join(' ')
      : labelWrapper.textContent.replace(/\s+/g, ' ').trim();

    // A valid card needs at least a label.
    if (!labelText) return;

    // Replace an unusable lazy placeholder (blob:/data:/empty) with the
    // committed hosted image, keyed by the department label.
    if (img) {
      const src = img.getAttribute('src') || '';
      const fallback = IMAGE_FALLBACKS[labelText.toLowerCase()];
      if (fallback && (src.startsWith('blob:') || src.startsWith('data:') || !src)) {
        img.setAttribute('src', fallback);
      }
    }

    const heading = document.createElement('h3');
    heading.textContent = labelText;

    cells.push([img || '', heading]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-departments', cells });
  element.replaceWith(block);
}
