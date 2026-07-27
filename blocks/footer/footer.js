import { getMetadata } from '../../scripts/aem.js';
import { normalizeInternalLinks } from '../../scripts/scripts.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // The authoring tool flattens nested column divs, so the upper row arrives as
  // a sequence of <h4> headings each followed by their content inside a single
  // content wrapper. Re-group each heading + following siblings into a column
  // so the CSS can lay them out side-by-side.
  const headingWrapper = [...footer.querySelectorAll('div')]
    .find((div) => div.querySelector(':scope > h4'));
  if (headingWrapper) {
    headingWrapper.classList.add('footer-columns');
    const columns = [];
    let current = null;
    [...headingWrapper.childNodes].forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'H4') {
        current = document.createElement('div');
        current.className = 'footer-column';
        columns.push(current);
      }
      if (current) current.append(node);
    });
    headingWrapper.textContent = '';
    // The source orders the columns LOCATIONS, GET IN TOUCH, JOIN OUR TEAM, but
    // the migrated content arrives GET IN TOUCH first. Reorder by the source
    // heading sequence; any unlisted column keeps its original relative order.
    const order = ['locations', 'get in touch', 'join our team'];
    const rank = (col) => {
      const h = col.querySelector('h4');
      const i = h ? order.indexOf(h.textContent.trim().toLowerCase()) : -1;
      return i === -1 ? order.length : i;
    };
    columns
      .map((col, i) => ({ col, i }))
      .sort((a, b) => rank(a.col) - rank(b.col) || a.i - b.i)
      .forEach(({ col }) => headingWrapper.append(col));

    // Tag the other content wrapper (logo / social / copyright) for styling.
    footer.querySelectorAll('.default-content-wrapper').forEach((w) => {
      if (!w.classList.contains('footer-columns')) w.classList.add('footer-meta');
    });
  }

  // Migrated footer links carry trailing slashes (/privacy/) that 404 on EDS;
  // normalize them to the slash-less routes the site actually serves.
  normalizeInternalLinks(footer);

  block.append(footer);
}
