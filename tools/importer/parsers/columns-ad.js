/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-ad. Base: columns.
 * Source: ad landing pages — the alternating image + text info bands
 * (sections 2, 3, 5, 6): Adobe partner logo band, "right-image" and
 * "left-image" implementation bands, and the "meeting-photo" build-products CTA
 * band.
 *
 * Columns convention: one row, N cells (one cell per column). Here always 2
 * columns: an image column and a text column, emitted in source visual order
 * (image-left or image-right per band). columns-ad.js flags the image-only
 * column and preserves order.
 *
 * TEXT HANDLING: the text column mixes real headings (<h1>) with plain <div>
 * lines (title / subheading) AND a body <div> whose paragraphs are bare text
 * nodes interleaved with inline <b>/<br> formatting. We collect, in document
 * order, every non-empty leaf text line and every bare text node of a mixed
 * container so no body copy is dropped.
 *
 * IMAGE HANDLING: the band photos are /static/ (root-relative, rehosted by
 * adjustImageUrls). We pick the real photo <img> (descriptive alt), prefixing
 * protocol-relative URLs and skipping data:/blob: placeholders.
 */
export default function parse(element, { document }) {
  const abs = (s) => (s && s.startsWith('//') ? `https:${s}` : s);
  const realSrc = (im) => {
    const s = im.getAttribute('src') || '';
    return s && !s.startsWith('data:') && !s.startsWith('blob:');
  };

  const imgs = Array.from(element.querySelectorAll('img'));
  const photo = imgs.find((im) => realSrc(im) && (im.getAttribute('alt') || '').trim())
    || imgs.find(realSrc);
  if (!photo) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const cleanImg = document.createElement('img');
  cleanImg.setAttribute('src', abs(photo.getAttribute('src') || ''));
  cleanImg.setAttribute('alt', photo.getAttribute('alt') || '');

  // Collect ordered text lines from the band. A "line" is either a leaf element
  // with no element children, or a bare text node of a container that also has
  // element children (the bold-lead-in body pattern).
  const lines = [];
  const seen = new Set();
  const pushLine = (text) => {
    const t = (text || '').replace(/\s+/g, ' ').trim();
    if (!t || seen.has(t)) return;
    seen.add(t);
    lines.push(t);
  };

  const headingEl = element.querySelector('h1, h2, h3, h4');
  const headingText = headingEl ? headingEl.textContent.trim() : '';

  const walk = (node) => {
    Array.from(node.children).forEach((child) => {
      if (child.tagName === 'IMG' || child.querySelector('img') && child.children.length === 1 && !child.textContent.trim()) return;
      if (child.tagName === 'BUTTON' || child.tagName === 'A') return;
      const hasElementChildren = child.children.length > 0;
      const directText = Array.from(child.childNodes)
        .filter((n) => n.nodeType === 3 && n.textContent.trim())
        .map((n) => n.textContent.trim());
      if (!hasElementChildren) {
        pushLine(child.textContent);
      } else if (directText.length) {
        // Mixed container: emit each bare text node as its own line.
        directText.forEach(pushLine);
        // Also descend to catch nested formatted-only children.
        walk(child);
      } else {
        walk(child);
      }
    });
  };
  walk(element);

  const textCell = [];
  lines.forEach((t, idx) => {
    if (headingText && t === headingText) {
      const h = document.createElement('h2');
      h.textContent = t;
      textCell.push(h);
    } else if (!headingText && idx === 0) {
      const h = document.createElement('h2');
      h.textContent = t;
      textCell.push(h);
    } else {
      const p = document.createElement('p');
      p.textContent = t;
      textCell.push(p);
    }
  });

  // Reconstruct any CTA button in the band as a link.
  const btn = element.querySelector('button');
  if (btn && btn.textContent.trim()) {
    const label = btn.textContent.trim();
    const href = /get in touch/i.test(label) ? 'mailto:inquiries@ensemble.com' : '/contact/';
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const a = document.createElement('a');
    a.setAttribute('href', href);
    a.textContent = label;
    strong.append(a);
    p.append(strong);
    textCell.push(p);
  }

  // Column order: image-left when the photo precedes the text in the DOM.
  const firstTextEl = headingEl
    || Array.from(element.querySelectorAll('div, p, span')).find((el) => el.textContent.trim());
  let imageFirst = true;
  if (firstTextEl) {
    const pos = photo.compareDocumentPosition(firstTextEl);
    imageFirst = Boolean(pos & 4); // firstText FOLLOWS photo → image is first.
  }

  const cells = imageFirst ? [[cleanImg, textCell]] : [[textCell, cleanImg]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-ad', cells });
  element.replaceWith(block);
}
