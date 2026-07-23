import { getMetadata } from '../../scripts/aem.js';
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
  // a single block with a sequence of <h4> headings each followed by their
  // content. Re-group each heading + following siblings into a column so the
  // CSS can lay them out side-by-side.
  const [columnsSection] = footer.children;
  if (columnsSection && columnsSection.querySelector('h4')) {
    columnsSection.classList.add('footer-columns');
    const columns = [];
    let current = null;
    [...columnsSection.childNodes].forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'H4') {
        current = document.createElement('div');
        current.className = 'footer-column';
        columns.push(current);
      }
      if (current) current.append(node);
    });
    columnsSection.textContent = '';
    columns.forEach((col) => columnsSection.append(col));
  }

  block.append(footer);
}
