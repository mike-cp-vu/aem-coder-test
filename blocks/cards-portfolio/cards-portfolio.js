import { createOptimizedPicture } from '../../scripts/aem.js';

// Source's exact prev/next arrow icons (decoded from the live DOM's inline
// base64 SVGs: a full arrow — shaft + head — not a plain chevron). fill
// swapped for currentColor so CSS controls the color instead of a baked-in
// #333333, matching the pattern already used for hero-home's card arrow.
/* eslint-disable-next-line quotes */
const PREV_ARROW_SVG = `<svg width="31" height="24" viewBox="0 0 31 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M0.93934 10.9393C0.353553 11.5251 0.353553 12.4749 0.93934 13.0607L10.4853 22.6066C11.0711 23.1924 12.0208 23.1924 12.6066 22.6066C13.1924 22.0208 13.1924 21.0711 12.6066 20.4853L4.12132 12L12.6066 3.51472C13.1924 2.92893 13.1924 1.97919 12.6066 1.3934C12.0208 0.807611 11.0711 0.807611 10.4853 1.3934L0.93934 10.9393ZM2 13.5H31V10.5H2V13.5Z"/></svg>`;
/* eslint-disable-next-line quotes */
const NEXT_ARROW_SVG = `<svg width="31" height="24" viewBox="0 0 31 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M30.0607 13.0607C30.6464 12.4749 30.6464 11.5251 30.0607 10.9393L20.5147 1.3934C19.9289 0.80761 18.9792 0.80761 18.3934 1.3934C17.8076 1.97918 17.8076 2.92893 18.3934 3.51472L26.8787 12L18.3934 20.4853C17.8076 21.0711 17.8076 22.0208 18.3934 22.6066C18.9792 23.1924 19.9289 23.1924 20.5147 22.6066L30.0607 13.0607ZM1.31134e-07 13.5L29 13.5L29 10.5L-1.31134e-07 10.5L1.31134e-07 13.5Z"/></svg>`;

/**
 * Mobile-only carousel nav (see cards-portfolio.css: the grid becomes a
 * scroll-snapped track below 640px, source's own small-screen breakpoint).
 * Follows this project's existing carousel-cases pattern (index + wraparound
 * + scrollTo) rather than DOM-cloning an infinite track — source's Slick
 * carousel clones slides internally, but a wrapping index scrolled smoothly
 * to the target tile reads the same to a user and avoids maintaining cloned
 * DOM nodes in parallel with the real ones.
 */
function showTile(block, index) {
  const tiles = [...block.querySelectorAll(':scope > ul > li')];
  if (!tiles.length) return;
  let next = index % tiles.length;
  if (next < 0) next += tiles.length;
  block.dataset.activeTile = String(next);
  block.querySelector(':scope > ul').scrollTo({
    top: 0,
    left: tiles[next].offsetLeft,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
}

function decorateCarouselNav(block, tileCount) {
  if (tileCount < 2) return;
  const nav = document.createElement('div');
  nav.className = 'cards-portfolio-arrows';
  nav.innerHTML = `
    <button type="button" class="cards-portfolio-prev" aria-label="Previous project">${PREV_ARROW_SVG}</button>
    <button type="button" class="cards-portfolio-next" aria-label="Next project">${NEXT_ARROW_SVG}</button>
  `;
  block.append(nav);
  nav.querySelector('.cards-portfolio-prev').addEventListener('click', () => {
    showTile(block, parseInt(block.dataset.activeTile || '0', 10) - 1);
  });
  nav.querySelector('.cards-portfolio-next').addEventListener('click', () => {
    showTile(block, parseInt(block.dataset.activeTile || '0', 10) + 1);
  });
  block.dataset.activeTile = '0';
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-portfolio-card-image';
      else div.className = 'cards-portfolio-card-body';
    });
    /* Make the WHOLE tile clickable: the source only links the small top-left
       label, so clicking the image (most of the tile) did nothing. Reuse the
       label's href to wrap the entire tile content in one anchor. */
    const labelLink = li.querySelector('.cards-portfolio-card-body a[href]');
    if (labelLink) {
      const tileLink = document.createElement('a');
      tileLink.className = 'cards-portfolio-card-link';
      tileLink.setAttribute('href', labelLink.getAttribute('href'));
      tileLink.setAttribute('aria-label', labelLink.textContent.trim());
      /* unwrap the label's inner anchor to plain text so we don't nest anchors */
      labelLink.replaceWith(...labelLink.childNodes);
      while (li.firstElementChild) tileLink.append(li.firstElementChild);
      li.append(tileLink);
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  const tileCount = ul.children.length;
  block.textContent = '';
  block.append(ul);
  decorateCarouselNav(block, tileCount);
}
