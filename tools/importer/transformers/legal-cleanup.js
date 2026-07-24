/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: legal/utility page cleanup.
 * Covers /privacy/, /cookies/, /terms/, /thank-you/ — long-form prose pages
 * with no blocks. Neutral chrome removal + heading normalization: the source
 * markups EVERY section heading as <h1> (flat, non-hierarchical). Keep the
 * first <h1> as the page title and demote the remaining <h1>s to <h2> so the
 * document has a valid single-H1 hierarchy. Also strips lazy blob:/data:
 * placeholder images. No LOCAL.ICONS rewrite needed (no content images).
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    const cookieBtn = element.querySelector('#rcc-confirm-button');
    if (cookieBtn) {
      const banner = cookieBtn.closest('div[class*="fixed"][class*="bottom-0"]')
        || cookieBtn.closest('div[class*="z-50"]');
      if (banner) banner.remove();
      else cookieBtn.remove();
    }
  }

  if (hookName === TransformHook.afterTransform) {
    element
      .querySelectorAll('div[class*="sticky"][class*="z-[100]"], div[class*="top-0"][class*="z-[100]"]')
      .forEach((el) => el.remove());
    WebImporter.DOMUtils.remove(element, ['footer', '#gatsby-announcer']);
    WebImporter.DOMUtils.remove(element, [
      'script', 'style', 'noscript', 'link', 'source', 'iframe',
    ]);

    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.startsWith('blob:') || src.startsWith('data:')) img.remove();
    });

    // Heading normalization: first h1 stays; demote the rest to h2.
    const h1s = Array.from(element.querySelectorAll('h1'));
    h1s.slice(1).forEach((h1) => {
      const h2 = element.ownerDocument.createElement('h2');
      h2.innerHTML = h1.innerHTML;
      h1.replaceWith(h2);
    });
  }
}
