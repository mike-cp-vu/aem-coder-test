/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: ensemble site-wide cleanup.
 *
 * Removes non-authorable chrome from the Gatsby/React contact page shell so the
 * import contains only page-level authorable content.
 *
 * All selectors below were verified against migration-work/cleaned.html:
 *  - Sticky header/nav wrapper .......... <div class="... top-0 left-0 right-0 z-[100] pt-10 ... sticky bg-white"> (line 5)
 *  - Cookie-consent banner overlay ...... fixed bottom overlay containing <button id="rcc-confirm-button"> (lines 71/83)
 *  - Footer ............................. <footer class="relative w-full h-full z-0"> (line 421)
 *  - Gatsby a11y announcer .............. <div id="gatsby-announcer"> (line 516)
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie-consent banner: fixed overlay that would otherwise leak into the
    // parsed content. Anchored on the verified confirm button id and walked up
    // to the fixed banner wrapper (class "... fixed bottom-0 z-50 ...").
    const cookieBtn = element.querySelector('#rcc-confirm-button');
    if (cookieBtn) {
      const banner = cookieBtn.closest('div[class*="fixed"][class*="bottom-0"]')
        || cookieBtn.closest('div[class*="z-50"]');
      if (banner) {
        banner.remove();
      } else {
        cookieBtn.remove();
      }
    }
  }

  if (hookName === TransformHook.beforeTransform) {
    // Email CTA: the source renders "inquiries@ensemble.com" as a <button>
    // with no href, so it would import as plain text. Reconstruct it as a
    // strong-wrapped mailto link so decorateButtons renders it as a primary
    // (orange) button.
    element.querySelectorAll('button').forEach((btn) => {
      const text = btn.textContent.trim();
      const emailMatch = text.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      if (!emailMatch) return;
      const doc = btn.ownerDocument;
      const p = doc.createElement('p');
      const strong = doc.createElement('strong');
      const a = doc.createElement('a');
      a.setAttribute('href', `mailto:${text}`);
      a.textContent = text;
      strong.append(a);
      p.append(strong);
      btn.replaceWith(p);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Sticky header / navigation wrapper (logo, hamburger menu, desktop nav).
    // Signature classes from captured DOM: sticky + z-[100].
    element
      .querySelectorAll('div[class*="sticky"][class*="z-[100]"]')
      .forEach((el) => el.remove());

    // Footer and Gatsby a11y announcer live-region.
    WebImporter.DOMUtils.remove(element, [
      'footer',
      '#gatsby-announcer',
    ]);

    // Script/style noise and safe non-authorable leftovers.
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'link',
      'source',
      'iframe',
    ]);
  }
}
