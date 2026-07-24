/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-ad-process. Base: cards.
 * Source: ad landing pages — the "Our Process:" horizontal step flow: a row of
 * pre-composed step graphics separated by arrow connectors (a desktop set and a
 * duplicate "* Mobile" set).
 *
 * Cards convention (2 columns with images, 1 column without): one row per step.
 * cards-ad-process.js treats a cell with a picture/image and no heading as the
 * step image cell. Each step becomes a single image cell.
 *
 * IMAGE HANDLING: the source step graphics are inline data: base64 images (the
 * step copy is baked into each graphic; there are no separate text labels). Per
 * the skip-data: rule these have no fetchable URL, so the parser finds no usable
 * step content and leaves the flow container in place — the section renders as
 * default content (the heading, paragraph and "Our Process:" label authored
 * above the flow are preserved). Any real /static/ or ctfassets step image is
 * kept.
 */
export default function parse(element, { document }) {
  const abs = (s) => (s && s.startsWith('//') ? `https:${s}` : s);
  const realSrc = (im) => {
    const s = im.getAttribute('src') || '';
    return s && !s.startsWith('data:') && !s.startsWith('blob:');
  };

  const stepImgs = Array.from(element.querySelectorAll('img')).filter((im) => {
    const alt = (im.getAttribute('alt') || '').toLowerCase();
    if (/arrow/.test(alt)) return false;
    if (/mobile/.test(alt)) return false;
    return realSrc(im);
  });

  const cells = [];
  stepImgs.forEach((im) => {
    const img = document.createElement('img');
    img.setAttribute('src', abs(im.getAttribute('src') || ''));
    img.setAttribute('alt', im.getAttribute('alt') || '');
    cells.push([[img]]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-ad-process', cells });
  element.replaceWith(block);
}
