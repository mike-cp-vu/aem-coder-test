/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: ensemble HOMEPAGE site-chrome cleanup.
 *
 * Removes non-authorable chrome from the Gatsby/React homepage shell so the
 * import contains only page-level authorable content (hero, stats, portfolio
 * grid, services grid, about, CTA band, client logos remain untouched).
 *
 * Homepage-specific file: the contact page ships its own ensemble-cleanup.js
 * whose header selector keys on `sticky`; the homepage header wrapper instead
 * uses `fixed` (see line 5 below), so this file keys on z-[100] + fixed.
 *
 * All selectors below were verified against migration-work/homepage/cleaned.html:
 *  - Sticky/fixed header-nav wrapper ..... <div class="md:px-20 sm:px-8 px-4 top-0 left-0 right-0 z-[100] pt-10 transition-none fixed bg-white"> (line 5) — holds logo + nav links
 *  - Cookie-consent banner overlay ....... <div class="position: fixed bottom-0 z-50 ... bg-[#333333] ..."> (line 71) containing <button id="rcc-confirm-button"> (line 83)
 *  - Footer .............................. <footer class="relative w-full h-full z-0"> (line 707)
 *  - Gatsby a11y announcer ............... <div id="gatsby-announcer"> (line 802)
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie-consent banner: fixed bottom overlay that would otherwise leak into
    // the parsed content. Anchored on the verified confirm button id and walked
    // up to the fixed banner wrapper (class "... fixed bottom-0 z-50 ...").
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

    // Mobile-only duplicates: the portfolio section ships a desktop grid AND a
    // mobile slick-carousel (with cloned slides) hidden on desktop; the services
    // section similarly has a mobile-only accordion/list. These mirror the
    // desktop block content and would otherwise leak into section default
    // content. Remove the mobile carousel and any `.sm:hidden` wrapper that sits
    // alongside a desktop grid so only the desktop block content survives.
    element.querySelectorAll('.slick-slider, div[class*="sm:hidden"]').forEach((el) => {
      // Keep small inline `sm:hidden` bits that are not structural duplicates
      // (e.g. a lone mobile button) — only strip wrappers that contain images or
      // a slick track (the true mobile mirrors of a desktop block).
      if (el.querySelector('.slick-track, img') || el.classList.contains('slick-slider')) {
        el.remove();
      }
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Sticky/fixed header + navigation wrapper (logo, region selector, desktop
    // nav). Signature classes from captured DOM: z-[100] + fixed.
    element
      .querySelectorAll('div[class*="z-[100]"][class*="fixed"]')
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

    // Rewrite committed-icon placeholders to root-relative paths. The service
    // and client parsers emit img src="https://LOCAL.ICONS/icons/<name>.svg"
    // so WebImporter.adjustImageUrls (which absolutizes bare relative paths to
    // the source origin) leaves them alone; here we strip the placeholder host
    // to yield a proper /icons/<name>.svg reference served from this project.
    element.querySelectorAll('img[src*="LOCAL.ICONS"]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const idx = src.indexOf('/icons/');
      if (idx !== -1) img.setAttribute('src', src.slice(idx));
    });
  }
}
