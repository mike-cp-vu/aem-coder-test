/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-portfolio-listing. Base: cards.
 * Source: https://www.ensemble.com/portfolio/ (project tile grid)
 *
 * Cards convention: 2 columns, one row per card.
 *  - Cell 1: tile image (mandatory)
 *  - Cell 2: text content — category (paragraph) + title (heading)
 *
 * The parser receives the grid container whose children are 12 project tiles.
 * Each tile = an image + two text lines (category, then title). Tiles are NOT
 * links on this page.
 *
 * IMAGE HANDLING: tile images are protocol-relative //images.ctfassets.net/...
 * (already absolute, DA-safe). Two tiles (Adobe GenStudio, Porsche) emit lazy
 * data:/blob: placeholder <img>s before the real one — pick the last img whose
 * src is a real http(s)/protocol-relative URL, skipping data:/blob:.
 */
export default function parse(element, { document }) {
  const tiles = Array.from(element.children);
  const cells = [];

  tiles.forEach((tile) => {
    const imgs = Array.from(tile.querySelectorAll('img'));
    // The real project photo is the <img> carrying descriptive alt text; the
    // lazy data:/blob: placeholders have empty alt. Prefer a real-src img WITH
    // alt, then any real-src img, then the last img.
    const realSrc = (im) => {
      const s = im.getAttribute('src') || '';
      return s && !s.startsWith('data:') && !s.startsWith('blob:');
    };
    const img = imgs.find((im) => realSrc(im) && (im.getAttribute('alt') || '').trim())
      || imgs.slice().reverse().find(realSrc)
      || imgs[imgs.length - 1];
    if (!img) return;

    let src = img.getAttribute('src') || '';
    if (src.startsWith('//')) src = `https:${src}`;

    // The visible overlay holds exactly two leaf divs in DOM order: category
    // then title. SSR markup appends hidden hover/description divs afterward,
    // so take only the first two — never join the trailing description text.
    const lines = Array.from(tile.querySelectorAll('div'))
      .filter((d) => d.children.length === 0 && d.textContent.trim())
      .map((d) => d.textContent.trim());

    const body = [];
    if (lines[0]) {
      const cat = document.createElement('p');
      cat.textContent = lines[0];
      body.push(cat);
    }
    if (lines[1]) {
      const title = document.createElement('h3');
      title.textContent = lines[1];
      body.push(title);
    }

    const cleanImg = document.createElement('img');
    cleanImg.setAttribute('src', src);
    cleanImg.setAttribute('alt', img.getAttribute('alt') || (lines[1] || ''));

    cells.push([cleanImg, body]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-portfolio-listing', cells });
  element.replaceWith(block);
}
