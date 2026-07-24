/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-team-detail. Base: cards.
 * Source: https://www.ensemble.com/careers/ ("Our Team" department cards).
 * Generated: 2026-07-24
 *
 * Cards convention (library-description.txt): 2 columns, one row per card.
 *   - Row 1: block name (handled by createBlock)
 *   - Cell 1: department photo (mandatory)
 *   - Cell 2: text content — department title (H3), description paragraph, and
 *             a bullet list of responsibilities (<ul>).
 *
 * Selector (page-templates.json instances[]): the teams container inside
 * `main > div > *:nth-child(5)`. Each department is a
 * `[data-testid="team-card-container"]` containing:
 *   div.rounded > img               -> department photo
 *   div.uppercase                   -> UPPERCASE department title
 *   div.text-12px                   -> description
 *   ul > li > span                  -> responsibilities bullet list
 * There are 6 departments (User Experience Design, Software Development,
 * Project Management, Digital Content, Quality Assurance, Consulting).
 *
 * The source <li> wraps each label in a <span> that renders its bullet via a
 * CSS ::before, so we rebuild a clean <ul>/<li> with the plain label text.
 *
 * IMAGE HANDLING: these are PHOTOGRAPHIC department images (not logos/icons),
 * so they are NOT routed through the LOCAL.ICONS placeholder. The live <img>
 * src is a root-relative `/join/teams/*.png`; we absolutize it to
 * `https://www.ensemble.com/join/teams/*.png` so Document Authoring rehosts the
 * real asset.
 */

const SRC_ORIGIN = 'https://www.ensemble.com';

// Resolve a possibly-relative team photo src to an absolute source URL so DA
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
  // The parser receives the teams container (or an ancestor). Cards are the
  // `[data-testid="team-card-container"]` elements; fall back to descendant
  // divs that pair an <img> with a <ul> if the testid is ever absent.
  let cards = Array.from(element.querySelectorAll('[data-testid="team-card-container"]'));
  if (cards.length === 0) {
    cards = Array.from(element.querySelectorAll('div')).filter(
      (c) => c.querySelector(':scope img, :scope > div img') && c.querySelector(':scope ul'),
    );
  }

  const cells = [];

  cards.forEach((card) => {
    // --- Cell 1: department photo (absolutized so DA rehosts the asset). ---
    const srcImg = card.querySelector('img');
    let imgCell = '';
    if (srcImg) {
      const img = document.createElement('img');
      img.setAttribute('src', absolutizeSrc(srcImg.getAttribute('src') || ''));
      img.setAttribute('alt', srcImg.getAttribute('alt') || '');
      imgCell = img;
    }

    // --- Cell 2: title + description + bullet list. ---
    const contentCell = [];

    // Title: the uppercase label div (or a heading if present).
    const titleEl = card.querySelector('[class*="uppercase"], h1, h2, h3, h4');
    const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (titleText) {
      const h = document.createElement('h3');
      h.textContent = titleText;
      contentCell.push(h);
    }

    // Description: text blocks that are neither the title nor the image wrapper
    // nor the list. Prefer explicit paragraphs; else the text-12px div.
    const descEls = Array.from(card.children).filter((c) => {
      if (c === titleEl) return false;
      if (c.querySelector('img') || c.tagName === 'UL' || c.tagName === 'IMG') return false;
      return c.textContent.trim().length > 0;
    });
    descEls.forEach((d) => {
      const p = document.createElement('p');
      p.textContent = d.textContent.replace(/\s+/g, ' ').trim();
      contentCell.push(p);
    });

    // Bullet list: rebuild a clean <ul> from the responsibility labels.
    const srcList = card.querySelector('ul');
    if (srcList) {
      const ul = document.createElement('ul');
      srcList.querySelectorAll('li').forEach((li) => {
        const label = li.textContent.replace(/\s+/g, ' ').trim();
        if (!label) return;
        const item = document.createElement('li');
        item.textContent = label;
        ul.appendChild(item);
      });
      if (ul.children.length) contentCell.push(ul);
    }

    // A valid card needs at least a title.
    if (!titleText) return;

    cells.push([imgCell, contentCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-team-detail', cells });
  element.replaceWith(block);
}
