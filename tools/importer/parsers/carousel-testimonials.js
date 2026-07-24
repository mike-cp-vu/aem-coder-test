/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-testimonials. Base: carousel.
 * Source: https://www.ensemble.com/careers/ ("Employee Testimonials" slider).
 * Generated: 2026-07-24
 *
 * Carousel convention (library-description.txt): 1 or 2 columns, one row per
 * slide, first row is the block name.
 *   - Cell 1: slide image (optional).
 *   - Cell 2: slide text content (optional) — heading + body text.
 *
 * Selector (page-templates.json instances[]): the testimonials section
 * `main > div > *:nth-child(6)`. The source is a single photo beside a set of
 * rotating quote slides: a `[data-testid="testimonials-container"]` holding one
 * photo (alt "Gardening"), a heading "Employee Testimonials", a single shared
 * attribution ("Herman, Manager, Solutions Consulting"), and 4
 * `[data-testid="quote-text"]` quote slides + prev/next arrows.
 *
 * Output (2-column carousel, content-complete):
 *   - Row 1: section photo (cell 1) + heading "Employee Testimonials" and the
 *     attribution (cell 2). This becomes the lead slide and carries the image.
 *   - One row per quote: empty image cell + the quote text with the shared
 *     attribution beneath it.
 * The prev/next arrow <button>s and their inline SVGs are navigation chrome and
 * are intentionally dropped.
 *
 * IMAGE HANDLING: the testimonial photo is a PHOTOGRAPHIC image (not a logo/
 * icon), so it is NOT routed through the LOCAL.ICONS placeholder. The live
 * <img> src is a root-relative `/join/testimonials/testimonials.jpg`; we
 * absolutize it to `https://www.ensemble.com/join/testimonials/testimonials.jpg`
 * so Document Authoring rehosts the real asset.
 */

const SRC_ORIGIN = 'https://www.ensemble.com';

// Resolve a possibly-relative photo src to an absolute source URL so DA rehosts
// it. Handles ../../../join/... , /join/... and already-absolute URLs.
function absolutizeSrc(src) {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) return src;
  const idx = src.indexOf('/join/');
  if (idx !== -1) return SRC_ORIGIN + src.slice(idx);
  const clean = src.replace(/^(\.\.\/)+/, '');
  return `${SRC_ORIGIN}/${clean.replace(/^\//, '')}`;
}

export default function parse(element, { document }) {
  const container = element.querySelector('[data-testid="testimonials-container"]') || element;

  // Section photo (absolutized so DA rehosts the asset).
  const srcImg = container.querySelector('img');
  let imgCell = '';
  if (srcImg) {
    const img = document.createElement('img');
    img.setAttribute('src', absolutizeSrc(srcImg.getAttribute('src') || ''));
    img.setAttribute('alt', srcImg.getAttribute('alt') || '');
    imgCell = img;
  }

  // Heading ("Employee Testimonials") and the shared attribution
  // ("Herman, Manager, Solutions Consulting"). The attribution appears twice in
  // the source (desktop + mobile); take the first non-empty occurrence.
  const headingText = 'Employee Testimonials';
  let attribution = '';
  const attrCandidates = Array.from(container.querySelectorAll('div')).filter(
    (d) => d.children.length === 0 && /,/.test(d.textContent) && /manager|consult|director|lead|developer/i.test(d.textContent),
  );
  if (attrCandidates.length) attribution = attrCandidates[0].textContent.replace(/\s+/g, ' ').trim();

  // Quote slides.
  const quotes = Array.from(container.querySelectorAll('[data-testid="quote-text"]'))
    .map((q) => q.textContent.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  // Empty-block guard: need at least a quote or the photo.
  if (quotes.length === 0 && !imgCell) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 1: lead slide carrying the section photo + heading/attribution.
  const leadCell = [];
  const h = document.createElement('h3');
  h.textContent = headingText;
  leadCell.push(h);
  if (attribution) {
    const p = document.createElement('p');
    p.textContent = attribution;
    leadCell.push(p);
  }
  cells.push([imgCell, leadCell]);

  // One row per quote (no image); attribution repeated beneath each quote.
  quotes.forEach((quote) => {
    const quoteCell = [];
    const qp = document.createElement('p');
    qp.textContent = quote;
    quoteCell.push(qp);
    if (attribution) {
      const ap = document.createElement('p');
      const em = document.createElement('em');
      em.textContent = attribution;
      ap.appendChild(em);
      quoteCell.push(ap);
    }
    cells.push(['', quoteCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-testimonials', cells });
  element.replaceWith(block);
}
