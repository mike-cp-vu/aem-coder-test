import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-products
 * Product showcase grid. Each row authors as:
 *   | image | category label, product title, description, icon-strip, Read more link |
 * The first paragraph in the body is treated as the category eyebrow, the first
 * heading (or bold line) as the product title, image-only paragraphs as the
 * technology/platform icon strip, and the trailing link as the CTA.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-products-card-image';
      else div.className = 'cards-products-card-body';
    });

    const body = li.querySelector('.cards-products-card-body');
    if (body) {
      /* first non-image paragraph = category eyebrow */
      const firstText = [...body.children].find(
        (el) => el.textContent.trim() && !el.querySelector('picture, img'),
      );
      if (firstText && firstText.tagName === 'P') {
        firstText.classList.add('cards-products-eyebrow');
      }

      /* image-only paragraphs = technology / platform icon strip */
      [...body.children].forEach((p) => {
        if (p.tagName !== 'P') return;
        const onlyImages = p.querySelector('picture, img') && !p.textContent.trim();
        if (onlyImages) p.classList.add('cards-products-icons');
      });

      /* trailing single-link paragraph = CTA */
      const ctaParagraph = [...body.children].reverse().find(
        (p) => p.tagName === 'P' && p.children.length === 1 && p.querySelector(':scope > a'),
      );
      if (ctaParagraph) {
        const link = ctaParagraph.querySelector('a');
        link.classList.add('cards-products-cta');
        ctaParagraph.classList.add('cards-products-cta-wrapper');
      }
    }

    ul.append(li);
  });

  ul.querySelectorAll('.cards-products-card-image picture > img').forEach((img) => {
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
