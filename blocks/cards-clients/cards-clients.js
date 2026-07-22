import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-clients-card-image';
      else div.className = 'cards-clients-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    // SVG logos are vector — the image optimizer can't rasterize them (and
    // returns an empty source), so keep the plain <img>. Only raster sources
    // go through createOptimizedPicture.
    if (/\.svg(\?|$)/i.test(img.src)) {
      const plain = document.createElement('img');
      plain.setAttribute('src', img.getAttribute('src').replace(/\?.*$/, ''));
      plain.setAttribute('alt', img.getAttribute('alt') || '');
      plain.setAttribute('loading', 'lazy');
      img.closest('picture').replaceWith(plain);
    } else {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '300' }]);
      img.closest('picture').replaceWith(optimizedPic);
    }
  });
  block.textContent = '';
  block.append(ul);
}
