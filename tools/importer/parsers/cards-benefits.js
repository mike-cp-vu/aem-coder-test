/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-benefits. Base: cards.
 * Source: https://www.ensemble.com/careers/ ("Enjoy Great Benefits" icon grid).
 * Generated: 2026-07-24
 *
 * Cards convention (library-description.txt): 2 columns, one row per card.
 *   - Row 1: block name (handled by createBlock)
 *   - Cell 1: benefit icon (mandatory)
 *   - Cell 2: text content — H2 title + description paragraph.
 *
 * Selector (page-templates.json instances[]): the benefits container inside
 * `main > div > *:nth-child(4)`. Each benefit is a `[data-testid="benefitCard"]`
 * containing an icon <img>, an <h2> title, and a <p> description. There are 9
 * benefits (Industry Leading Health Benefits, Work-Life Flexibility, Diversity/
 * Equality & Inclusion, Career Growth Opportunities, Wellness, Learning &
 * Development, Health & Fitness, Choose Your Work Style, Social Events).
 *
 * IMAGE HANDLING (icons — mirror cards-service-detail.js): the 9 benefit icons
 * are lazy `../../../join/benefits/*.svg` files that the Document Authoring
 * sanitizer strips. They are keyed off the icon's alt text to a committed
 * asset at `/icons/benefit-<slug>.svg`, where <slug> = alt text lowercased with
 * the word "icon" removed and non-alphanumerics collapsed to hyphens
 * (e.g. "Health insurance icon" -> benefit-health-insurance, "Work-life icon"
 * -> benefit-work-life). Emitted via the LOCAL.ICONS placeholder host; the
 * cleanup transformer rewrites LOCAL.ICONS/icons/... to a root-relative
 * /icons/ path after adjustImageUrls.
 *
 * Benefit-icon slugs used (commit these SVGs at /icons/<slug>.svg):
 *   benefit-health-insurance, benefit-work-life, benefit-equality,
 *   benefit-career, benefit-wellness, benefit-learning, benefit-fitness,
 *   benefit-workstyle, benefit-social-events
 */

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function parse(element, { document }) {
  // The parser receives the benefits container (or an ancestor). Cards are the
  // `[data-testid="benefitCard"]` elements; fall back to any descendant that
  // pairs an <img> with an <h2> if the testid is ever absent.
  let cards = Array.from(element.querySelectorAll('[data-testid="benefitCard"]'));
  if (cards.length === 0) {
    cards = Array.from(element.querySelectorAll('div')).filter(
      (c) => c.querySelector(':scope img') && c.querySelector(':scope h2')
        && !c.querySelector('[data-testid="benefitCard"]'),
    );
  }

  const cells = [];

  cards.forEach((card) => {
    // --- Cell 2: title (H2) + description (P). Build first so we can guard. ---
    const contentCell = [];
    const heading = card.querySelector('h1, h2, h3, h4');
    if (heading) {
      const h = document.createElement('h3');
      h.textContent = heading.textContent.trim();
      contentCell.push(h);
    }
    card.querySelectorAll('p').forEach((p) => contentCell.push(p));

    // A valid benefit needs at least a title.
    if (!heading) return;

    // --- Cell 1: icon, keyed off the source <img> alt text to the committed
    // /icons/benefit-<slug>.svg asset via the LOCAL.ICONS placeholder host. ---
    const srcImg = card.querySelector('img');
    const alt = srcImg ? (srcImg.getAttribute('alt') || '').trim() : '';
    const slug = slugify(alt.replace(/\bicon\b/i, ''));
    const icon = document.createElement('img');
    icon.setAttribute('src', `https://LOCAL.ICONS/icons/benefit-${slug}.svg`);
    icon.setAttribute('alt', alt || `${heading.textContent.trim()} icon`);

    cells.push([icon, contentCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-benefits', cells });
  element.replaceWith(block);
}
