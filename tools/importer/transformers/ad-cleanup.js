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
 *   - rewrite committed shared-icon placeholders (LOCAL.ICONS) to /icons/.
 *   - strip the remaining lazy data:/blob: placeholder <img>s (per-campaign
 *     ecosystem icons + chrome logos that were not restored).
 *   - remove script/style/noscript/link/source/iframe.
 *
 * SHARED ICON RESTORE (beforeTransform): the "Our Process" step graphics, the
 * client-logo strip, and the Adobe product tiles are default content (not
 * parsed blocks) whose source imgs are inline data: base64. Those icons are
 * IDENTICAL across all 20 ad pages, so they were extracted once to
 * /icons/ad-*.png. Here we rewrite each such data: img to a LOCAL.ICONS
 * placeholder host keyed off its source alt, so it survives as a default-content
 * image (afterTransform then normalizes LOCAL.ICONS -> /icons/). Per-campaign
 * "Row one" ecosystem icons and chrome logos have no mapping and are stripped.
 *
 * Landing pages carry their own minimal chrome, so the standard EDS
 * header/footer selectors used by other templates are not present and are not
 * touched.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// Source img alt -> committed shared icon slug for DEFAULT-CONTENT sections
// (process steps, client logos, Adobe product tiles). Block-owned icons
// (services, why-choose) are handled by their parsers, not here.
const DEFAULT_CONTENT_ICONS = {
  'First process': 'ad-process-1',
  'Second Process': 'ad-process-2',
  'Third Process': 'ad-process-3',
  'Fourth Process': 'ad-process-4',
  'adobe-photo': 'ad-client-adobe',
  'paramount-photo': 'ad-client-paramount',
  'dreamworks-photo': 'ad-client-dreamworks',
  'pgatour-photo': 'ad-client-pgatour',
  'natgeo-photo': 'ad-client-natgeo',
  'twitch-photo': 'ad-client-twitch',
  'wondery-photo': 'ad-client-wondery',
  'porsche-photo': 'ad-client-porsche',
  'funimation-photo': 'ad-client-funimation',
  'discovery-photo': 'ad-client-discovery',
  'royalcollege-photo': 'ad-client-royalcollege',
  'samsung-photo': 'ad-client-samsung',
  'Benefits first photo': 'ad-adobe-experience-platform',
  'Benefits second photo': 'ad-adobe-experience-manager',
  'Benefits third photo': 'ad-adobe-creative-cloud',
  'Benefits fourth photo': 'ad-adobe-document-cloud',
};

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

    // Restore shared default-content icons: rewrite mapped data: placeholders to
    // committed /icons/ assets (via LOCAL.ICONS host). Runs before the
    // afterTransform strip so these survive while unmapped placeholders are cut.
    element.querySelectorAll('img').forEach((img) => {
      const alt = (img.getAttribute('alt') || '').trim();
      const slug = DEFAULT_CONTENT_ICONS[alt];
      if (!slug) return;
      const src = img.getAttribute('src') || '';
      if (!src.startsWith('data:') && !src.startsWith('blob:')) return;
      img.setAttribute('src', `https://LOCAL.ICONS/icons/${slug}.png`);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Reconstruct any standalone CTA buttons that block parsers did not consume.
    element.querySelectorAll('button').forEach((btn) => reconstructButton(btn));

    // Normalize committed shared-icon placeholders to root-relative /icons/.
    // WebImporter.adjustImageUrls (which absolutizes bare relative paths to the
    // source origin) leaves the LOCAL.ICONS host alone; strip that host here so
    // the reference resolves to this project's /icons/ad-*.png asset.
    element.querySelectorAll('img[src*="LOCAL.ICONS"]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const idx = src.indexOf('/icons/');
      if (idx !== -1) img.setAttribute('src', src.slice(idx));
    });

    // Strip lazy placeholder / inline base64 imagery so DA does not choke on it
    // (data: renders as about:error, blob: is unfetchable). This runs after the
    // LOCAL.ICONS normalization, so restored shared icons (now /icons/…) survive
    // and only unmapped per-campaign/chrome placeholders are removed.
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
