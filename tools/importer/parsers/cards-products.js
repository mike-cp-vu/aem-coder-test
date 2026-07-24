/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-products. Base: cards.
 * Source: https://www.ensemble.com/products/ (product showcase grid)
 *
 * Cards convention: 2 columns, one row per product card.
 *  - Cell 1: product screenshot (mandatory)
 *  - Cell 2: body — category (paragraph), title (heading), description
 *    (paragraph), a paragraph of technology/platform icon <img>s, and a
 *    "Read more" call-to-action link to the product detail page.
 *
 * The parser receives the grid container (div.grid) whose children are 5
 * flip-container cards. Each card has a front (screenshot + overlay
 * category/title labels) and a back link carrying the full copy + tech icons.
 *
 * IMAGE HANDLING: all imagery is ctfassets (absolute / protocol-relative,
 * DA-safe). The real screenshot is the front <img> with descriptive alt;
 * lazy data:/blob: placeholders have empty alt. Tech icons live inside the
 * card's product-detail link.
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.children);
  const cells = [];

  const realSrc = (im) => {
    const s = im.getAttribute('src') || '';
    return s && !s.startsWith('data:') && !s.startsWith('blob:');
  };
  const abs = (s) => (s && s.startsWith('//') ? `https:${s}` : s);

  cards.forEach((card) => {
    const link = card.querySelector('a[href^="/products/"]');

    // Product screenshot: prefer a real-src img WITH descriptive alt (front
    // banner), skipping the lazy placeholders and the small tech icons.
    const allImgs = Array.from(card.querySelectorAll('img'));
    const iconImgs = link ? new Set(Array.from(link.querySelectorAll('img'))) : new Set();
    const bannerImgs = allImgs.filter((im) => !iconImgs.has(im));
    const banner = bannerImgs.find((im) => realSrc(im) && (im.getAttribute('alt') || '').trim())
      || bannerImgs.slice().reverse().find(realSrc)
      || bannerImgs[bannerImgs.length - 1];
    if (!banner) return;

    // Category + title from the front overlay leaf divs (first two).
    const labels = Array.from(card.querySelectorAll('div'))
      .filter((d) => d.children.length === 0 && d.textContent.trim())
      .map((d) => d.textContent.trim());
    const category = labels[0] || '';
    const title = labels[1] || '';

    // Description: the longest text-only leaf paragraph/div inside the link.
    let description = '';
    if (link) {
      const texts = Array.from(link.querySelectorAll('div, p'))
        .filter((d) => d.children.length === 0 && d.textContent.trim())
        .map((d) => d.textContent.trim())
        .filter((t) => t !== category && t !== title && !/^read more$/i.test(t));
      description = texts.sort((a, b) => b.length - a.length)[0] || '';
    }

    // Tech / platform icons (ctfassets SVGs) from the card link.
    const icons = link
      ? Array.from(link.querySelectorAll('img')).map((im) => {
        const clean = document.createElement('img');
        clean.setAttribute('src', abs(im.getAttribute('src') || ''));
        clean.setAttribute('alt', im.getAttribute('alt') || '');
        return clean;
      })
      : [];

    const href = link ? link.getAttribute('href') : '';

    const body = [];
    if (category) {
      const cat = document.createElement('p');
      cat.textContent = category;
      body.push(cat);
    }
    if (title) {
      const h = document.createElement('h3');
      h.textContent = title;
      body.push(h);
    }
    if (description) {
      const p = document.createElement('p');
      p.textContent = description;
      body.push(p);
    }
    if (icons.length) {
      const iconP = document.createElement('p');
      icons.forEach((ic) => iconP.append(ic));
      body.push(iconP);
    }
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = 'Read more';
      p.append(a);
      body.push(p);
    }

    const cleanImg = document.createElement('img');
    cleanImg.setAttribute('src', abs(banner.getAttribute('src') || ''));
    cleanImg.setAttribute('alt', banner.getAttribute('alt') || title);

    cells.push([cleanImg, body]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-products', cells });
  element.replaceWith(block);
}
