import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-tech-stack
 * Technology/platform icon grid. Each row authors as:
 *   | icon image | short label |
 * Renders as an icon-above-label grid (no card chrome), matching the
 * "Technologies" section on portfolio detail pages.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-tech-stack-card-image';
      else div.className = 'cards-tech-stack-card-body';
    });
    ul.append(li);
  });

  ul.querySelectorAll('.cards-tech-stack-card-image picture > img').forEach((img) => {
    // Only run EDS optimization on same-origin / rehosted media assets. External
    // hosts (e.g. ctfassets) reject the appended width/format query params.
    const { src } = img;
    const isExternal = /^https?:\/\//.test(src) && !src.startsWith(window.location.origin);
    if (isExternal) return;
    const optimizedPic = createOptimizedPicture(src, img.alt, false, [{ width: '120' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
