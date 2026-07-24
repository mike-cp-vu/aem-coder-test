/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: portfolio DETAIL (case study) cleanup.
 * Neutral chrome removal (broad header match) + reconstruct the footer action
 * buttons: "Back to portfolio" → link to /portfolio/, "contact us" → link to
 * /contact/. The "Download Report" button (present on a few pages) has no
 * discoverable target — drop it. Tile/hero/tech-icon imagery is absolute
 * ctfassets (DA-safe), so no LOCAL.ICONS rewrite is needed.
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
      const doc = btn.ownerDocument;
      const makeLink = (href, text, strongWrap) => {
        const p = doc.createElement('p');
        const a = doc.createElement('a');
        a.setAttribute('href', href);
        a.textContent = text;
        if (strongWrap) {
          const strong = doc.createElement('strong');
          strong.append(a);
          p.append(strong);
        } else {
          p.append(a);
        }
        btn.replaceWith(p);
      };

      if (/^back to portfolio$/i.test(label)) {
        makeLink('/portfolio/', 'Back to portfolio', false);
      } else if (/^contact us$/i.test(label)) {
        makeLink('/contact/', 'Contact us', true);
      } else if (/^download report$/i.test(label)) {
        btn.remove();
      }
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // The hero is a multi-image lazy tile: a blob:/data: placeholder <img>
    // (empty alt) precedes the real ctfassets image. Strip placeholders so DA
    // does not choke on them (they render as about:error).
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.startsWith('blob:') || src.startsWith('data:')) img.remove();
    });

    element
      .querySelectorAll('div[class*="sticky"][class*="z-[100]"], div[class*="top-0"][class*="z-[100]"]')
      .forEach((el) => el.remove());
    WebImporter.DOMUtils.remove(element, ['footer', '#gatsby-announcer']);
    WebImporter.DOMUtils.remove(element, [
      'script', 'style', 'noscript', 'link', 'source', 'iframe',
    ]);
  }
}
