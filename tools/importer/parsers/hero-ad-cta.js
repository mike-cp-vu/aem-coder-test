/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-ad-cta. Base: hero.
 * Source: ad landing pages — the closing "Do right by people." quote banner: a
 * centered large heading, a paragraph, and a single "REQUEST A CONSULTATION"
 * call-to-action over a full-bleed background image.
 *
 * Hero convention (1 column, 3 rows):
 *   row 1: block name (added by createBlock)
 *   row 2: background image cell (optional)
 *   row 3: content cell — heading + paragraph + call-to-action link.
 *
 * The background image, when present, is an inline
 * `background-image:url(/static/...)`; we extract it into row 2 as an <img>.
 * The CTA button becomes a link to /contact/.
 */
export default function parse(element, { document }) {
  // ----- row 2: background image (optional) -----
  const imageCell = [];
  const style = element.getAttribute('style') || '';
  const bgMatch = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
  if (bgMatch && bgMatch[1]) {
    let src = bgMatch[1].trim();
    if (src.startsWith('//')) src = `https:${src}`;
    if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
      const img = document.createElement('img');
      img.setAttribute('src', src);
      img.setAttribute('alt', 'background');
      imageCell.push(img);
    }
  }

  // ----- row 3: content -----
  const contentCell = [];

  const leaves = Array.from(element.querySelectorAll('*'))
    .filter((el) => el.children.length === 0 && el.textContent.trim());
  const headingText = leaves[0] ? leaves[0].textContent.trim() : '';
  if (headingText) {
    const h = document.createElement('h2');
    h.textContent = headingText;
    contentCell.push(h);
  }
  const paraText = leaves[1] ? leaves[1].textContent.trim() : '';
  if (paraText && paraText !== headingText) {
    const p = document.createElement('p');
    p.textContent = paraText;
    contentCell.push(p);
  }

  // CTA button → link to /contact/.
  const btn = element.querySelector('button, a');
  const ctaLabel = (btn ? btn.textContent.trim() : '') || 'Request a Consultation';
  const ctaP = document.createElement('p');
  const strong = document.createElement('strong');
  const a = document.createElement('a');
  a.setAttribute('href', '/contact/');
  a.textContent = ctaLabel;
  strong.append(a);
  ctaP.append(strong);
  contentCell.push(ctaP);

  const cells = [];
  if (imageCell.length) cells.push([imageCell]);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-ad-cta', cells });
  element.replaceWith(block);
}
