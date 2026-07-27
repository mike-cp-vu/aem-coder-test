import { createOptimizedPicture } from '../../scripts/aem.js';

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
  block.textContent = '';
  block.append(ul);
}
