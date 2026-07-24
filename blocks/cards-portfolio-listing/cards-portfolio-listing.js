import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-portfolio-listing-card-image';
      } else {
        div.className = 'cards-portfolio-listing-card-body';
        /* first text line = category (grey), remaining = title (white) */
        const lines = [...div.children];
        if (lines[0]) lines[0].classList.add('cards-portfolio-listing-card-category');
        lines.slice(1).forEach((el) => el.classList.add('cards-portfolio-listing-card-title'));
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    // Only run EDS optimization on same-origin / rehosted media assets. External
    // hosts (e.g. ctfassets) reject the appended width/format query params.
    const { src } = img;
    const isExternal = /^https?:\/\//.test(src) && !src.startsWith(window.location.origin);
    if (isExternal) return;
    const optimizedPic = createOptimizedPicture(src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
