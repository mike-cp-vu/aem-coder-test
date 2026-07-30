import { createOptimizedPicture } from '../../scripts/aem.js';

// Shared right-arrow icon used on every careers hero quick-nav card (matches
// the source SVG: viewBox 0 0 25 16). Template literal so the embedded double
// quotes need no escaping.
/* eslint-disable-next-line quotes */
const ARROW_SVG = `<svg class="hero-home-card-arrow" width="25" height="16" viewBox="0 0 25 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M24.7071 8.70711C25.0976 8.31658 25.0976 7.68342 24.7071 7.29289L18.3431 0.928932C17.9526 0.538408 17.3195 0.538408 16.9289 0.928932C16.5384 1.31946 16.5384 1.95262 16.9289 2.34315L22.5858 8L16.9289 13.6569C16.5384 14.0474 16.5384 14.6805 16.9289 15.0711C17.3195 15.4616 17.9526 15.4616 18.3431 15.0711L24.7071 8.70711ZM0.5 9H24V7H0.5V9Z"/></svg>`;

/**
 * Careers hero quick-nav cards. The parser emits a trailing content cell whose
 * paragraphs each hold an anchor: <a href="#target"><strong>LABEL</strong><br>
 * description</a>. Decorate those into a row of jump-link cards (label +
 * description + arrow). Returns true when cards were found and decorated.
 */
function decorateCards(block) {
  const cells = [...block.querySelectorAll(':scope > div')];
  // The cards cell is the last content row whose links all point at in-page
  // anchors (href starting with "#").
  const cardsCell = [...cells].reverse().find((cell) => {
    const links = [...cell.querySelectorAll('a[href^="#"]')];
    return links.length >= 2 && links.length === cell.querySelectorAll('a').length;
  });
  if (!cardsCell) return false;

  const nav = document.createElement('nav');
  nav.className = 'hero-home-cards';
  nav.setAttribute('aria-label', 'Careers sections');

  cardsCell.querySelectorAll('a[href^="#"]').forEach((link) => {
    const card = document.createElement('a');
    card.className = 'hero-home-card';
    card.href = link.getAttribute('href');

    const label = link.querySelector('strong');
    const text = document.createElement('span');
    text.className = 'hero-home-card-text';

    const labelEl = document.createElement('span');
    labelEl.className = 'hero-home-card-label';
    labelEl.textContent = label ? label.textContent.trim() : link.textContent.trim();
    text.append(labelEl);

    // Description = the anchor's text nodes after the <strong>/<br>.
    const desc = [...link.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent.trim())
      .filter(Boolean)
      .join(' ');
    if (desc) {
      const descEl = document.createElement('span');
      descEl.className = 'hero-home-card-desc';
      descEl.textContent = desc;
      text.append(descEl);
    }

    card.append(text);
    card.insertAdjacentHTML('beforeend', ARROW_SVG);
    nav.append(card);
  });

  // Replace the raw cards cell with the decorated nav.
  cardsCell.replaceChildren(nav);
  cardsCell.classList.add('hero-home-cards-wrapper');
  block.classList.add('has-cards');
  return true;
}

export default function decorate(block) {
  const firstCell = block.querySelector(':scope > div:first-child');
  const img = firstCell?.querySelector('img');
  if (img) {
    // Full-bleed hero: regenerate the picture at large widths so it isn't
    // upscaled from the default 750px rendition (which looks soft across a
    // 1440px+ banner).
    const optimized = createOptimizedPicture(
      img.src,
      img.alt || '',
      true,
      [{ width: '2000' }, { width: '1600' }, { width: '1200' }, { width: '750' }],
    );
    img.closest('picture')?.replaceWith(optimized);
  } else {
    block.classList.add('no-image');
  }

  // Careers hero only: build the quick-nav cards if the parser emitted them.
  decorateCards(block);
}
