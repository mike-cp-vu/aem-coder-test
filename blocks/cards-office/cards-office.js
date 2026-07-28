import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      // Image cell = contains picture(s) and no meaningful text (handles
      // single-image cells and multi-image cells wrapped in multiple <p>s).
      if (div.querySelector('picture') && !div.textContent.trim()) div.className = 'cards-office-card-image';
      else div.className = 'cards-office-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // Variant detection: the Contact page office cards carry an address block
  // (phone + street paragraphs) beside each photo; the About "Our Offices"
  // cards show only a single circular skyline photo with a city name and no
  // address. When no card body has a paragraph, mark the block as the circular
  // variant so the CSS keys on an explicit class rather than the section's
  // background style.
  const hasAddress = [...ul.querySelectorAll('.cards-office-card-body')]
    .some((body) => body.querySelector('p'));
  if (!hasAddress) block.classList.add('cards-office-circular');

  block.replaceChildren(ul);
}
