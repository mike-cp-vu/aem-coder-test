import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-services-card-image';
      else div.className = 'cards-services-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    // Service icons are SVG — vector, not rasterizable by the image optimizer.
    // Keep the plain <img>; only raster sources go through createOptimizedPicture.
    if (/\.svg(\?|$)/i.test(img.src)) {
      const plain = document.createElement('img');
      plain.setAttribute('src', img.getAttribute('src').replace(/\?.*$/, ''));
      plain.setAttribute('alt', img.getAttribute('alt') || '');
      plain.setAttribute('loading', 'lazy');
      img.closest('picture').replaceWith(plain);
    } else {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '128' }]);
      img.closest('picture').replaceWith(optimizedPic);
    }
  });
  block.textContent = '';
  block.append(ul);
}
