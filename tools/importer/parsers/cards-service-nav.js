/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-service-nav. Base: cards.
 * Source: https://www.ensemble.com/services/ (services quick-nav grid section)
 * Generated: 2026-07-23
 *
 * Cards convention (library-description.txt): 2 columns, one row per card.
 *  - Row 1: block name (handled by createBlock)
 *  - Cell 1: icon image (mandatory)
 *  - Cell 2: short text label
 *
 * Each nav item is a `div.flex.flex-col` containing a
 * `div[data-testid="service-icon-container"]` (inline <svg>) above a text
 * label div (`.font-semibold`). The 8 labels match the committed service
 * icons at /icons/service-<slug>.svg.
 *
 * The source icons are inline SVGs (no fetchable URL). The identical icons
 * were already extracted/committed for the homepage services grid at
 * /icons/service-<slug>.svg, keyed by the service label. Rebuild each icon
 * <img> to point at that committed asset, emitting a placeholder host that the
 * services-page cleanup transformer rewrites to a root-relative /icons/ path
 * (WebImporter.adjustImageUrls would otherwise absolutize a bare /icons/ path
 * to the source origin).
 */
export default function parse(element, { document }) {
  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  // Nav items: the flex-col item containers. The icon container and label live
  // inside; fall back to any direct grid children if the layout classes vary.
  const grid = element.querySelector(':scope > div, :scope') || element;
  let items = Array.from(grid.querySelectorAll(':scope > div'));
  if (items.length === 0) items = Array.from(element.querySelectorAll(':scope > div'));

  const cells = [];

  items.forEach((item) => {
    // Label: the semibold text div. Fall back to any deepest text node.
    const labelEl = item.querySelector('.font-semibold, [class*="font-semibold"]')
      || item.querySelector('div:last-child');
    const label = labelEl ? labelEl.textContent.trim() : '';
    if (!label) return;

    // Icon: reference the committed SVG for this service label. Inline source
    // SVGs have no fetchable URL; they were extracted to /icons/service-<slug>.svg.
    const icon = document.createElement('img');
    icon.setAttribute('src', `https://LOCAL.ICONS/icons/service-${slugify(label)}.svg`);
    icon.setAttribute('alt', label);

    // Cell 2: the label as a paragraph so it round-trips as text content.
    const p = document.createElement('p');
    p.textContent = label;

    cells.push([icon, p]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-service-nav', cells });
  element.replaceWith(block);
}
