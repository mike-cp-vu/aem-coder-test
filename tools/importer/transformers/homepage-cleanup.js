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

    // CTA buttons: the homepage renders its calls-to-action as <button> elements
    // with no href, so they import as plain text. Reconstruct each known CTA as
    // a formatted link (strong = primary/orange, em = secondary/outline) so
    // decorateButtons renders it as a styled button. Destination is inferred
    // from the button label.
    const CTA_MAP = [
      { re: /^view our portfolio$/i, href: '/portfolio/', variant: 'em' },
      { re: /^learn more about what we do$/i, href: '/services/', variant: 'em' },
      { re: /^learn more about ensemble$/i, href: '/about/', variant: 'em' },
      { re: /^contact us$/i, href: '/contact/', variant: 'strong' },
    ];
    element.querySelectorAll('button').forEach((btn) => {
      const label = btn.textContent.trim();
      // Drop mobile-only duplicate CTAs (e.g. the short "LEARN MORE" twin of
      // "LEARN MORE ABOUT WHAT WE DO") so they don't leak in as stray text.
      if (/^learn more$/i.test(label)) {
        btn.remove();
        return;
      }
      const match = CTA_MAP.find((c) => c.re.test(label));
      if (!match) return;
      const doc = btn.ownerDocument;
      const p = doc.createElement('p');
      const wrap = doc.createElement(match.variant); // strong (primary) or em (secondary)
      const a = doc.createElement('a');
      a.setAttribute('href', match.href);
      a.textContent = label;
      wrap.append(a);
      p.append(wrap);
      btn.replaceWith(p);
    });

    // Mobile-only duplicates: the portfolio section ships a desktop grid AND a
    // mobile slick-carousel (with cloned slides) hidden on desktop; the services
    // section similarly has a mobile-only accordion/list. These mirror the
    // desktop block content and would otherwise leak into section default
    // content. Remove the mobile carousel and any `.sm:hidden` wrapper that sits
    // alongside a desktop grid so only the desktop block content survives.
    element.querySelectorAll('.slick-slider, div[class*="sm:hidden"]').forEach((el) => {
      if (!el.isConnected) return; // already removed via an ancestor
      // Strip true mobile mirrors of a desktop block: slick carousels, wrappers
      // with images, or wrappers holding a repeating list of links (the mobile
      // services accordion duplicates the desktop services grid). Keep small
      // inline sm:hidden bits (e.g. a lone mobile button — 0-1 links, no img).
      const isSlick = el.classList.contains('slick-slider') || el.querySelector('.slick-track');
      const hasImg = !!el.querySelector('img');
      const linkCount = el.querySelectorAll('a').length;
      if (isSlick || hasImg || linkCount >= 3) {
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

    // Lazy placeholder images (blob:/data:) — e.g. the /emea/home/ variant's
    // mobile menu icons whose header wrapper uses a different class combo than
    // the primary z-[100]+fixed selector above. They render as about:error.
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.startsWith('blob:') || src.startsWith('data:')) img.remove();
    });

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
