/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-services. Base: cards.
 * Sources:
 *   - https://www.ensemble.com/ (homepage services grid)
 *   - https://www.ensemble.com/about/ (company "values" 3-column row)
 *
 * Cards convention: 2 columns, one row per card.
 *  - Row 1: block name (handled by createBlock)
 *  - Cell 1: icon image (mandatory)
 *  - Cell 2: title (heading) + optional tech-list subtitle + description
 *
 * The two pages differ:
 *   - Homepage services: item `div.max-w-[260px]` with a linked <h3> title, a
 *     <span> tech list, and a <p>. Icons are inline SVGs with no fetchable URL;
 *     they were extracted to committed /icons/service-<slug>.svg keyed by title.
 *   - About values: item `div.text-center.flex.flex-col.md:w-1/3` with an <h2>
 *     title, no subtitle/link, and a <p>. Icons are small raster assets
 *     ("People icon asset", "Results icon", "Success central icon") with no
 *     committed service icon; they were extracted to committed
 *     /icons/value-<slug>.png keyed by the icon's alt text (minus the word
 *     "icon").
 *
 * Both committed-icon references are emitted via the LOCAL.ICONS placeholder
 * host, which the page cleanup transformer rewrites to a root-relative /icons/
 * path (WebImporter.adjustImageUrls would otherwise absolutize a bare /icons/
 * path to the source origin).
 */
export default function parse(element, { document }) {
  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  // Service items: fixed-width item containers on the homepage; the flex
  // value columns on the About page.
  let items = Array.from(element.querySelectorAll(':scope > div[class*="max-w-"]'));
  if (items.length === 0) {
    items = Array.from(element.querySelectorAll(':scope > div'));
  }

  const cells = [];

  items.forEach((item) => {
    const heading = item.querySelector('h3, h2, h4');
    const subtitle = item.querySelector('span');
    const description = item.querySelector('p');

    // A valid card needs at least a title.
    if (!heading) return;
    const title = heading.textContent.trim();

    // Icon: inline source icons have no fetchable URL, so reference a committed
    // asset. About "value" icons carry an alt like "People icon asset" — key
    // those off the alt text to /icons/value-<slug>.png. Homepage service icons
    // are keyed off the service title to /icons/service-<slug>.svg.
    const srcImg = item.querySelector('img');
    const alt = srcImg ? (srcImg.getAttribute('alt') || '').trim() : '';
    const icon = document.createElement('img');
    if (/\bicon\b/i.test(alt)) {
      // Value-style icon (About page): drop the word "icon" from the slug.
      const valueSlug = slugify(alt.replace(/\bicon\b/i, ''));
      icon.setAttribute('src', `https://LOCAL.ICONS/icons/value-${valueSlug}.png`);
      icon.setAttribute('alt', alt);
    } else {
      // Service icon (homepage): keyed off the service title.
      icon.setAttribute('src', `https://LOCAL.ICONS/icons/service-${slugify(title)}.svg`);
      icon.setAttribute('alt', title);
    }

    // Determine the link href for this item (icon anchor or heading anchor).
    const linkEl = item.querySelector('a[href]');
    const href = linkEl ? linkEl.getAttribute('href') : null;

    const contentCell = [];

    // Title as a heading; when a link exists, nest the <a> INSIDE the heading
    // (standard EDS pattern) so it round-trips as a heading, not "### " text.
    const h = document.createElement('h3');
    if (href) {
      const titleLink = document.createElement('a');
      titleLink.setAttribute('href', href);
      titleLink.textContent = title;
      h.appendChild(titleLink);
    } else {
      h.textContent = title;
    }
    contentCell.push(h);

    if (subtitle) contentCell.push(subtitle);
    if (description) contentCell.push(description);

    // Cell 1 = icon (empty string if missing so row stays 2-column).
    cells.push([icon || '', contentCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-services', cells });
  element.replaceWith(block);
}
