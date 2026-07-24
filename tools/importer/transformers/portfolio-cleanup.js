/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: portfolio listing cleanup.
 * Neutral chrome removal (broad header match) + reconstruct the "Contact us"
 * CTA button as a link to /contact/, and drop the "Load More" pagination
 * button (no EDS equivalent). No LOCAL.ICONS rewrite needed — tile images are
 * absolute ctfassets URLs.
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

    element.querySelectorAll('button').forEach((btn) => {
      const label = btn.textContent.trim();
      if (/^load more$/i.test(label)) {
        btn.remove();
        return;
      }
      if (/^contact us$/i.test(label)) {
        const doc = btn.ownerDocument;
        const p = doc.createElement('p');
        const strong = doc.createElement('strong');
        const a = doc.createElement('a');
        a.setAttribute('href', '/contact/');
        a.textContent = label;
        strong.append(a);
        p.append(strong);
        btn.replaceWith(p);
      }
    });
  }

  if (hookName === TransformHook.afterTransform) {
    element
      .querySelectorAll('div[class*="sticky"][class*="z-[100]"], div[class*="top-0"][class*="z-[100]"]')
      .forEach((el) => el.remove());
    WebImporter.DOMUtils.remove(element, ['footer', '#gatsby-announcer']);
    WebImporter.DOMUtils.remove(element, [
      'script', 'style', 'noscript', 'link', 'source', 'iframe',
    ]);
  }
}
