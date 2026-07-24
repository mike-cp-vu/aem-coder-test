/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-tech-stack. Base: cards.
 * Source: portfolio detail pages — the "Technologies" section.
 *
 * Cards convention: 2 columns, one row per technology item.
 *  - Cell 1: technology/platform icon image (mandatory)
 *  - Cell 2: short text label
 *
 * The parser receives the <ul> whose <li>s each hold a ctfassets icon <img>
 * (descriptive alt like "React Icon") followed by a short label. Icons are
 * absolute/protocol-relative ctfassets URLs (DA-safe).
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll(':scope > li'));
  const cells = [];

  items.forEach((li) => {
    const srcImg = li.querySelector('img');
    if (!srcImg) return;
    let src = srcImg.getAttribute('src') || '';
    if (src.startsWith('//')) src = `https:${src}`;
    if (!src || src.startsWith('data:') || src.startsWith('blob:')) return;

    // Label: the text node/element beside the icon.
    const label = Array.from(li.querySelectorAll('div, span, p'))
      .map((d) => d.textContent.trim())
      .find((t) => t) || (srcImg.getAttribute('alt') || '').replace(/\s*icon$/i, '').trim();

    const icon = document.createElement('img');
    icon.setAttribute('src', src);
    icon.setAttribute('alt', srcImg.getAttribute('alt') || label);

    const p = document.createElement('p');
    p.textContent = label;

    cells.push([icon, p]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-tech-stack', cells });
  element.replaceWith(block);
}
