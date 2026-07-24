/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: about page cleanup.
 *
 * Neutral chrome removal (header/nav, cookie banner, footer, a11y announcer,
 * scripts) plus the LOCAL.ICONS → /icons/ rewrite the about parsers depend on.
 * The LOCAL.IMAGES → /images/ rewrite for committed photo assets is handled in
 * the import script's post-adjustImageUrls step (step 5b), matching homepage.
 * Does NOT reconstruct CTA <button>s globally — the join-us / contact CTAs are
 * reconstructed here only within their own default-content sections.
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

    // Standalone CTA <button>s (Our Offices "CONTACT US", Join-us "JOIN US")
    // render with no href. Reconstruct as strong-wrapped links so
    // decorateButtons renders them as primary buttons. Label → destination.
    const CTA = { 'contact us': '/contact/', 'join us': '/careers/' };
    element.querySelectorAll('button').forEach((btn) => {
      const label = btn.textContent.trim();
      const href = CTA[label.toLowerCase()];
      if (!href) return;
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
    element
      .querySelectorAll('div[class*="sticky"][class*="z-[100]"]')
      .forEach((el) => el.remove());

    WebImporter.DOMUtils.remove(element, ['footer', '#gatsby-announcer']);
    WebImporter.DOMUtils.remove(element, [
      'script', 'style', 'noscript', 'link', 'source', 'iframe',
    ]);

    // Normalize committed-icon references (LOCAL.ICONS) to root-relative /icons/.
    element.querySelectorAll('img[src*="LOCAL.ICONS"]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const idx = src.indexOf('/icons/');
      if (idx > 0) img.setAttribute('src', src.slice(idx));
    });

    // Default-content badges (Partner / ISO certifications) are lazy inline
    // webp that arrive as unusable blob: srcs and live outside any block parser.
    // Rewrite them by alt text to their committed /images/ assets so DA rehosts
    // them (the import script's /images/ step strips the placeholder host).
    const BADGES = {
      'adobe partner image': '/images/badge-adobe-partner.webp',
      'iso first certification': '/images/badge-iso-9001.webp',
      'iso second certification': '/images/badge-iso-27001.webp',
    };
    element.querySelectorAll('img[alt]').forEach((img) => {
      const key = (img.getAttribute('alt') || '').trim().toLowerCase();
      if (BADGES[key]) img.setAttribute('src', `https://LOCAL.IMAGES${BADGES[key]}`);
    });
  }
}
