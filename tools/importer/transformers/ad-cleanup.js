/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: ad-landing cleanup.
 *
 * The ad landing pages (adsGenStudio et al.) wrap their content in
 * `main .flex.flex-col.place-self-center`. The first child is a minimal landing
 * header (logo + GET IN TOUCH mailto) and the last child is a minimal landing
 * footer (logo + social + copyright) — both are chrome, not content, and are
 * removed.
 *
 * beforeTransform:
 *   - remove the minimal header (first child, div.bg-[#fff]) and the minimal
 *     footer (div.bg-[#4485B6]).
 *   - reconstruct any leftover standalone "REQUEST A CONSULTATION" / "GET IN
 *     TOUCH" / "SUBMIT FORM" buttons (i.e. those NOT already turned into links
 *     by a block parser) as <p><strong><a>…</a></strong></p> links to /contact/
 *     or mailto:inquiries@ensemble.com.
 *
 * afterTransform:
 *   - strip lazy data:/blob: placeholder <img>s (the inline base64 icons).
 *   - remove script/style/noscript/link/source/iframe.
 *
 * Landing pages carry their own minimal chrome, so the standard EDS
 * header/footer selectors used by other templates are not present and are not
 * touched.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

function reconstructButton(btn) {
  const label = btn.textContent.trim();
  if (!label) {
    btn.remove();
    return;
  }
  const doc = btn.ownerDocument;
  let href = '/contact/';
  if (/get in touch/i.test(label)) href = 'mailto:inquiries@ensemble.com';

  const p = doc.createElement('p');
  const strong = doc.createElement('strong');
  const a = doc.createElement('a');
  a.setAttribute('href', href);
  a.textContent = label;
  strong.append(a);
  p.append(strong);
  btn.replaceWith(p);
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    const wrapper = element.querySelector('.flex.flex-col.place-self-center') || element;

    // Minimal landing header: first child that is a white band holding only the
    // logo + GET IN TOUCH mailto.
    const header = wrapper.querySelector(':scope > div.bg-\\[\\#fff\\]:first-child');
    if (header) header.remove();

    // Minimal landing footer: the blue #4485B6 band.
    element.querySelectorAll('div.bg-\\[\\#4485B6\\]').forEach((el) => el.remove());
  }

  if (hookName === TransformHook.afterTransform) {
    // Reconstruct any standalone CTA buttons that block parsers did not consume.
    element.querySelectorAll('button').forEach((btn) => reconstructButton(btn));

    // Strip lazy placeholder / inline base64 imagery so DA does not choke on it
    // (data: renders as about:error, blob: is unfetchable).
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.startsWith('blob:') || src.startsWith('data:')) img.remove();
    });

    // Strip the stray ";" separator text nodes the source renders between some
    // sections (they surface as literal "<p>;</p>" in the output otherwise).
    const walker = element.ownerDocument.createTreeWalker(element, 4 /* SHOW_TEXT */);
    const strays = [];
    let node = walker.nextNode();
    while (node) {
      if (node.textContent.trim() === ';') strays.push(node);
      node = walker.nextNode();
    }
    strays.forEach((n) => n.remove());

    WebImporter.DOMUtils.remove(element, [
      'script', 'style', 'noscript', 'link', 'source', 'iframe',
    ]);
  }
}
