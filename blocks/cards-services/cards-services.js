// Source's exact right-arrow icon for the mobile row list (viewBox 21x16,
// distinct from hero-home's own 25x16 arrow — not the same icon reused).
/* eslint-disable-next-line quotes */
const SERVICES_ARROW_SVG = `<svg width="21" height="16" viewBox="0 0 21 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.7071 8.70711C21.0976 8.31658 21.0976 7.68342 20.7071 7.29289L14.3431 0.928932C13.9526 0.538408 13.3195 0.538408 12.9289 0.928932C12.5384 1.31946 12.5384 1.95262 12.9289 2.34315L18.5858 8L12.9289 13.6569C12.5384 14.0474 12.5384 14.6805 12.9289 15.0711C13.3195 15.4616 13.9526 15.4616 14.3431 15.0711L20.7071 8.70711ZM0 9L20 9L20 7L0 7L0 9Z"/></svg>`;

/**
 * Below source's own sm breakpoint (640px), the homepage services list
 * doesn't show the icon+description grid at all (`sm:hidden` on the grid) —
 * it shows a plain divided list of title + arrow rows instead (no icon, no
 * subtitle, no description). Built from the same authored content as the
 * grid (see decorate()); toggled by CSS media query, not JS, so both markups
 * exist and only one is ever visible at a time.
 */
function decorateMobileList(block, items) {
  const list = document.createElement('div');
  list.className = 'cards-services-mobile-list';
  items.forEach(({ href, text }) => {
    const link = document.createElement('a');
    link.className = 'cards-services-mobile-link';
    link.href = href;
    const label = document.createElement('span');
    label.textContent = text;
    link.append(label);
    link.insertAdjacentHTML('beforeend', SERVICES_ARROW_SVG);
    list.append(link);
  });
  block.append(list);
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      // The icon cell holds the service icon (a span.icon rendered from an EDS
      // icon token, or a picture/img) and no heading text. Everything else is
      // the text body.
      const hasIcon = div.querySelector('span.icon, picture, img');
      if (hasIcon && !div.querySelector('h1, h2, h3, h4, h5, h6')) {
        div.className = 'cards-services-card-image';
      } else {
        div.className = 'cards-services-card-body';
      }
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);

  // Variant detection: the homepage "What we provide" services cards link each
  // heading to a service anchor; the About "company values" cards do not. When
  // no card heading is a link, mark the block as the values variant so the CSS
  // can style it (centered, icon-on-top, dark text) via an explicit class
  // rather than a fragile structural selector.
  const headingLinks = [...ul.querySelectorAll('h2 a[href], h3 a[href], h4 a[href], h5 a[href], h6 a[href]')];
  if (!headingLinks.length) {
    block.classList.add('cards-services-values');
    return;
  }

  // Services variant only: the About values grid has no mobile-list equivalent.
  decorateMobileList(block, headingLinks.map((a) => ({
    href: a.getAttribute('href'),
    text: a.textContent.trim(),
  })));
}
