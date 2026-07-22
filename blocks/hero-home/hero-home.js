import { createOptimizedPicture } from '../../scripts/aem.js';

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
}
