/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: careers page cleanup.
 * Neutral chrome removal + LOCAL.ICONS → /icons/ rewrite (benefit icons).
 * Reconstructs the apply-section "Send us a message" <button> as a mailto link.
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

    // Apply CTA: "Send us a message" button → mailto link (address is present
    // in the same section as a mailto <a>). Reconstruct as a strong-wrapped
    // link so decorateButtons renders it as a primary button.
    element.querySelectorAll('button').forEach((btn) => {
      const label = btn.textContent.trim();
      if (!/send us a message/i.test(label)) return;
      const mail = element.querySelector('a[href^="mailto:"]');
      const href = mail ? mail.getAttribute('href') : 'mailto:employment@ensemble.com';
      const doc = btn.ownerDocument;
      const p = doc.createElement('p');
      const strong = doc.createElement('strong');
      const a = doc.createElement('a');
      a.setAttribute('href', href);
      a.textContent = label;
      strong.append(a);
      p.append(strong);
      btn.replaceWith(p);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Header/nav wrapper. On most pages it is sticky+z-[100]; on careers it is
    // top-0+z-[100] without the sticky class, so match z-[100] with top-0 too.
    element
      .querySelectorAll('div[class*="sticky"][class*="z-[100]"], div[class*="top-0"][class*="z-[100]"]')
      .forEach((el) => el.remove());
    WebImporter.DOMUtils.remove(element, ['footer', '#gatsby-announcer']);
    WebImporter.DOMUtils.remove(element, [
      'script', 'style', 'noscript', 'link', 'source', 'iframe',
    ]);
    element.querySelectorAll('img[src*="LOCAL.ICONS"]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const idx = src.indexOf('/icons/');
      if (idx > 0) img.setAttribute('src', src.slice(idx));
    });
  }
}
