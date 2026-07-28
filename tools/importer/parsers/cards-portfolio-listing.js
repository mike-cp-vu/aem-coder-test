/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-portfolio-listing. Base: cards.
 * Source: https://www.ensemble.com/portfolio/ (project tile grid)
 *
 * Each source tile is a flip card: the FRONT shows the project photo with a
 * category + title overlay; the BACK (an <a href="/portfolio/{slug}/">) reveals
 * a description paragraph, a row of tech-stack icon images, and a "Read more"
 * link. We capture all of it so the migrated block can reproduce the flip and
 * make the whole tile clickable.
 *
 * Cards convention: 2 columns, one row per card.
 *  - Cell 1: tile photo (mandatory)
 *  - Cell 2: category <p>, title <h3>, description <p>, a <p> of tech-icon
 *    images, and a "Read more" <a> carrying the tile's link. The block JS
 *    classifies each part and promotes the link to cover the whole card.
 *
 * IMAGE HANDLING: tile/tech images are protocol-relative //images.ctfassets.net
 * (already absolute, DA-safe). Some tiles emit lazy data:/blob: placeholder
 * <img>s before the real one — pick imgs whose src is a real http(s)/
 * protocol-relative URL, skipping data:/blob:. Tech icons carry an alt ending
 * in "Icon" (e.g. "React Icon"); the project photo does not.
 */
export default function parse(element, { document }) {
  const tiles = Array.from(element.children);
  const cells = [];

  const isRealSrc = (im) => {
    const s = im.getAttribute('src') || '';
    return s && !s.startsWith('data:') && !s.startsWith('blob:');
  };
  const absSrc = (im) => {
    let s = im.getAttribute('src') || '';
    if (s.startsWith('//')) s = `https:${s}`;
    return s;
  };
  const isTechIcon = (im) => /\bicon\b/i.test(im.getAttribute('alt') || '');

  tiles.forEach((tile) => {
    // The tile's link (back panel) points at the project detail page.
    const linkEl = tile.querySelector('a[href]');
    let href = linkEl ? linkEl.getAttribute('href') || '' : '';
    // Normalize trailing slash to the slash-less routes EDS serves (keep root).
    if (href.length > 1) href = href.replace(/\/+$/, '');

    const imgs = Array.from(tile.querySelectorAll('img'));

    // Project photo: a real-src img that is NOT a tech icon (prefer one with
    // alt text), then any non-icon real-src img, then the last real-src img.
    const photoImgs = imgs.filter((im) => isRealSrc(im) && !isTechIcon(im));
    const photo = photoImgs.find((im) => (im.getAttribute('alt') || '').trim())
      || photoImgs[photoImgs.length - 1]
      || imgs.slice().reverse().find(isRealSrc)
      || imgs[imgs.length - 1];
    if (!photo) return;

    // Tech-stack icons (may be none, e.g. the GenStudio white paper tile).
    const techIcons = imgs.filter((im) => isRealSrc(im) && isTechIcon(im));

    // Leaf text lines in DOM order: category, title, then the long description.
    const lines = Array.from(tile.querySelectorAll('div'))
      .filter((d) => d.children.length === 0 && d.textContent.trim())
      .map((d) => d.textContent.trim());
    // Dedupe consecutive repeats (category/title appear on both faces).
    const seen = new Set();
    const uniqueLines = lines.filter((t) => {
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    });
    const category = uniqueLines[0] || '';
    const title = uniqueLines[1] || '';
    const description = uniqueLines.find((t) => t.length > 80) || '';

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
    if (description && description !== category && description !== title) {
      const p = document.createElement('p');
      p.textContent = description;
      body.push(p);
    }
    if (techIcons.length) {
      const techP = document.createElement('p');
      techIcons.forEach((im) => {
        const icon = document.createElement('img');
        icon.setAttribute('src', absSrc(im));
        icon.setAttribute('alt', im.getAttribute('alt') || '');
        techP.append(icon);
      });
      body.push(techP);
    }
    if (href) {
      const cta = document.createElement('a');
      cta.setAttribute('href', href);
      cta.textContent = 'Read more';
      const ctaP = document.createElement('p');
      ctaP.append(cta);
      body.push(ctaP);
    }

    const cleanImg = document.createElement('img');
    cleanImg.setAttribute('src', absSrc(photo));
    cleanImg.setAttribute('alt', photo.getAttribute('alt') || title || '');

    cells.push([cleanImg, body]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-portfolio-listing', cells });
  element.replaceWith(block);
}
