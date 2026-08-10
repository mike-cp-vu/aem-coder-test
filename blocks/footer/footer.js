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
    // The source keeps the legal links (Privacy / Cookies / Terms) as their own
    // right-aligned column, but the migrated content nests that list inside the
    // JOIN OUR TEAM column (a bare <ul> with no <h4>). Split it into its own
    // column so the CSS can right-align it as the fourth column.
    const joinColumn = columns.find((col) => /join our team/i.test(col.querySelector('h4')?.textContent || ''));
    if (joinColumn) {
      const legalList = joinColumn.querySelector(':scope > ul');
      if (legalList) {
        const legalColumn = document.createElement('div');
        legalColumn.className = 'footer-column footer-legal';
        legalColumn.append(legalList);
        columns.push(legalColumn);
      }
    }

    // Source's mobile wrapper isn't a flex/grid container, so its `order-last`
    // utility on GET IN TOUCH is inert there — mobile keeps authored DOM order
    // (GET IN TOUCH, LOCATIONS, JOIN OUR TEAM, then legal), and only swaps to
    // LOCATIONS-first once the grid layout kicks in at 768px. Tag each column
    // by its heading id so the CSS can do that swap with `order` at 768px+.
    columns.forEach((col) => {
      const id = col.querySelector('h4')?.id;
      if (id) col.dataset.heading = id;
    });

    columns.forEach((col) => headingWrapper.append(col));

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
