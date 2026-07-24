/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-timeline. Base: carousel.
 * Source: https://www.ensemble.com/about/ ("Our story" history slider)
 * Generated: 2026-07-24
 *
 * Carousel convention (library-description.txt): 2 columns, one row per slide.
 *   - Row 1: block name (handled by createBlock)
 *   - Cell 1: slide image
 *   - Cell 2: slide text — the year as a heading, then the description sentence
 *
 * carousel-timeline.js treats each block row as a slide and maps `:scope > div`
 * columns to image (col 0) and content (col 1), which matches this 2-column
 * layout.
 *
 * Source structure (see migration-work/block-context/carousel-timeline/source.html):
 *   div.slick-slider.storyCarousel
 *     button.carouselArrowLeft (decorative arrow — dropped)
 *     div.slick-list > div.slick-track
 *       div.slick-slide (x10)          -> one milestone slide each
 *         div > div > div
 *           img[alt="Slide N"]         -> milestone photo
 *           div.font-bold ...          -> year (e.g. "1995")
 *           div.text-sm ...            -> description sentence
 *     button.carouselArrowRight (decorative arrow — dropped)
 *
 * Because the live page hydrates slick.js (which can clone slides), slides are
 * de-duplicated by the "Slide N" image alt so each milestone appears once.
 *
 * IMAGE HANDLING: These are PHOTOGRAPHIC milestone images (not logos), so they
 * are NOT routed through LOCAL.ICONS. Most slides resolve to root-relative
 * `/static/*.webp` URLs on the live page (WebImporter.adjustImageUrls
 * absolutizes them so Document Authoring rehosts them) — the original <img> is
 * passed through unchanged for those. Three slides (2002, 2009, 2010) are lazy
 * inline base64 webp that the browser only ever exposes as unusable
 * blob:/data: URIs, so they are mapped by year to committed copies at
 * /images/timeline-<year>.webp via the LOCAL.IMAGES placeholder host (the
 * import script rewrites LOCAL.IMAGES/images/... to a root-relative /images/
 * path).
 */

// Lazy milestone photos with no usable hosted URL (blob:/data: at load time),
// keyed by their year -> committed /images/ asset.
const IMAGE_FALLBACKS = {
  '2002': 'https://LOCAL.IMAGES/images/timeline-2002.webp',
  '2009': 'https://LOCAL.IMAGES/images/timeline-2009.webp',
  '2010': 'https://LOCAL.IMAGES/images/timeline-2010.webp',
};

export default function parse(element, { document }) {
  const slides = Array.from(element.querySelectorAll('.slick-slide'));

  const cells = [];
  const seen = new Set();

  slides.forEach((slide) => {
    const img = slide.querySelector('img');

    // Text nodes: the year (bold) and the description (text-sm). Fall back to
    // the first two non-empty divs that are not the image wrapper.
    const yearEl = slide.querySelector('[class*="font-bold"], [class*="font-extrabold"]');
    const descEl = slide.querySelector('[class*="text-sm"]');

    const year = yearEl ? yearEl.textContent.trim() : '';
    const desc = descEl ? descEl.textContent.trim() : '';

    // A valid slide needs at least a year or a description.
    if (!year && !desc) return;

    // De-duplicate cloned slides (slick.js clones for infinite scroll).
    const key = `${year}|${desc}`;
    if (seen.has(key)) return;
    seen.add(key);

    // Replace an unusable lazy placeholder (blob:/data:/empty) with a committed
    // hosted image, keyed by year.
    if (img) {
      const src = img.getAttribute('src') || '';
      const fallback = IMAGE_FALLBACKS[year];
      if (fallback && (src.startsWith('blob:') || src.startsWith('data:') || !src)) {
        img.setAttribute('src', fallback);
      }
    }

    // Cell 2: year as a heading, description as a paragraph.
    const contentCell = [];
    if (year) {
      const h = document.createElement('h3');
      h.textContent = year;
      contentCell.push(h);
    }
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      contentCell.push(p);
    }

    cells.push([img || '', contentCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-timeline', cells });
  element.replaceWith(block);
}
