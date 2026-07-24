/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: services page cleanup.
 *
 * Neutral chrome removal (header/nav, cookie banner, footer, a11y announcer,
 * scripts) plus the LOCAL.ICONS → /icons/ rewrite that the services parsers
 * depend on. Deliberately does NOT reconstruct "View our portfolio" / "Contact
 * us" <button>s into links — the cards-service-detail parser emits those CTAs
 * as proper <a> links itself, so a global button reconstruction here would
 * duplicate them.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie-consent banner: fixed overlay anchored on the confirm button id.
    const cookieBtn = element.querySelector('#rcc-confirm-button');
    if (cookieBtn) {
      const banner = cookieBtn.closest('div[class*="fixed"][class*="bottom-0"]')
        || cookieBtn.closest('div[class*="z-50"]');
      if (banner) banner.remove();
      else cookieBtn.remove();
    }

    // Closing CTA: the "contact-container" section renders its "CONTACT US"
    // call-to-action as a <button> with no href. Reconstruct it as a
    // strong-wrapped link to /contact/ so decorateButtons renders it as a
    // primary (orange) button. Scoped to the contact-container so it does NOT
    // touch the service-item CTAs (those are handled by the block parser).
    const contactSection = element.querySelector('[data-testid="contact-container"]');
    if (contactSection) {
      contactSection.querySelectorAll('button').forEach((btn) => {
        const label = btn.textContent.trim();
        if (!label) return;
        const doc = btn.ownerDocument;
        const p = doc.createElement('p');
        const strong = doc.createElement('strong');
        const a = doc.createElement('a');
        a.setAttribute('href', '/contact/');
        a.textContent = label;
        strong.append(a);
        p.append(strong);
        btn.replaceWith(p);
      });
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // Sticky header / navigation wrapper (logo, hamburger, desktop nav).
    element
      .querySelectorAll('div[class*="sticky"][class*="z-[100]"]')
      .forEach((el) => el.remove());

    // Footer + Gatsby a11y announcer.
    WebImporter.DOMUtils.remove(element, [
      'footer',
      '#gatsby-announcer',
    ]);

    // Script/style noise and non-authorable leftovers.
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'link',
      'source',
      'iframe',
    ]);

    // Normalize committed-icon references emitted via the LOCAL.ICONS
    // placeholder host to root-relative /icons/ paths.
    element.querySelectorAll('img[src*="LOCAL.ICONS"]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const idx = src.indexOf('/icons/');
      if (idx > 0) img.setAttribute('src', src.slice(idx));
    });
  }
}
