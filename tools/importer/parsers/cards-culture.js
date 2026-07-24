/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-culture. Base: cards.
 * Source: https://www.ensemble.com/careers/ ("Culture" photo + text grid).
 * Generated: 2026-07-24
 *
 * Cards convention (library-description.txt): 2 columns, one row per card.
 *   - Row 1: block name (handled by createBlock)
 *   - Cell 1: card photo (mandatory)
 *   - Cell 2: text content — H2 title + description paragraph.
 *
 * Selector (page-templates.json instances[]): the culture container inside
 * `main > div > *:nth-child(3)`. The container holds an intro heading block
 * plus three "cultureSection" rows; each section pairs one large accent photo
 * with a stack of two `[data-testid="cultureCard"]` items. There are 6 culture
 * cards total (Company culture matters, Work-Life balance, Grow with Ensemble,
 * Celebrate successes, promoting from within, Work with the best), each made of
 * a small photo + an <h2> title + a <p> description.
 *
 * The three large accent photos (alt "Meeting picture", "Romanian
 * Teambuilding", "Warehouse") are section decoration, NOT cards — they live
 * outside any `[data-testid="cultureCard"]`, so keying off the card testid
 * naturally excludes them and yields exactly the 6 content cards.
 *
 * IMAGE HANDLING: these are PHOTOGRAPHIC culture images (not logos/icons), so
 * they are NOT routed through the LOCAL.ICONS placeholder. On the live page the
 * card <img> src is a relative `../../../join/culture/*.png` path; we absolutize
 * it to `https://www.ensemble.com/join/culture/*.png` so Document Authoring
 * rehosts the real asset. (The .webp <source> in the <picture> is dropped; only
 * the <img> is emitted.)
 */

const SRC_ORIGIN = 'https://www.ensemble.com';

// Resolve a possibly-relative culture photo src to an absolute source URL so DA
// rehosts it. Handles ../../../join/... , /join/... and already-absolute URLs.
function absolutizeSrc(src) {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) return src;
  const idx = src.indexOf('/join/');
  if (idx !== -1) return SRC_ORIGIN + src.slice(idx);
  const clean = src.replace(/^(\.\.\/)+/, '');
  return `${SRC_ORIGIN}/${clean.replace(/^\//, '')}`;
}

export default function parse(element, { document }) {
  // The parser receives the culture container (or an ancestor). Cards are the
  // `[data-testid="cultureCard"]` elements; fall back to inner flex rows that
  // pair an <img> with an <h2> if the testid is ever absent.
  let cards = Array.from(element.querySelectorAll('[data-testid="cultureCard"]'));
  if (cards.length === 0) {
    cards = Array.from(element.querySelectorAll('div.flex.gap-4')).filter(
      (c) => c.querySelector('img') && c.querySelector('h2'),
    );
  }

  const cells = [];

  cards.forEach((card) => {
    // --- Cell 1: card photo (absolutized so DA rehosts the real asset). ---
    const srcImg = card.querySelector('img');
    let imgCell = '';
    if (srcImg) {
      const img = document.createElement('img');
      img.setAttribute('src', absolutizeSrc(srcImg.getAttribute('src') || ''));
      img.setAttribute('alt', srcImg.getAttribute('alt') || '');
      imgCell = img;
    }

    // --- Cell 2: title (H2) + description (P). ---
    const contentCell = [];
    const heading = card.querySelector('h1, h2, h3, h4');
    if (heading) {
      const h = document.createElement('h3');
      h.textContent = heading.textContent.trim();
      contentCell.push(h);
    }
    card.querySelectorAll('p').forEach((p) => contentCell.push(p));

    // A valid card needs at least some text.
    if (contentCell.length === 0) return;

    cells.push([imgCell, contentCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-culture', cells });
  element.replaceWith(block);
}
