/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-about. Base: columns.
 * Sources:
 *   - https://www.ensemble.com/ (homepage "about" section)
 *   - https://www.ensemble.com/about/ ("Our Farm" section)
 *
 * Columns convention: side-by-side cells, one row after the block-name row.
 *  - Cell 1: scenic / feature image
 *  - Cell 2: bold lead line (heading) + paragraph(s) + optional bullet list +
 *            optional CTA
 *
 * The two pages differ in the text wrapper:
 *   - Homepage: inner group `div.md:w-267px` / `div.md-820px:w-320px` holding a
 *     lead div, a paragraph div, and a div with the desktop/mobile CTA buttons.
 *     The CTA is a <button> (no href) converted to a "/about/" link; the
 *     mobile-only "WHO WE ARE" twin is excluded in favour of "LEARN MORE...".
 *   - About page: inner group `div.md:w-400px` holding a heading div
 *     ("Our Farm"), a paragraph div, and a div wrapping a <ul> bullet list of
 *     farm features. No CTA.
 *
 * The image is photographic (`/static/*` on the live page) and is passed through
 * unchanged so WebImporter.adjustImageUrls absolutizes it for rehosting.
 */
export default function parse(element, { document }) {
  // Left column: the scenic/feature image.
  const image = element.querySelector('img');

  // Right column: the text block wrapper.
  const textWrapper = element.querySelector('.flex.flex-col, div[class*="w-267px"], div[class*="w-320px"], div[class*="w-400px"]');

  // Empty-block guard.
  if (!image && !textWrapper) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];

  if (textWrapper) {
    // Drill into the innermost content group that directly holds the text divs.
    const inner = textWrapper.querySelector('div[class*="w-267px"], div[class*="w-320px"], div[class*="w-400px"]') || textWrapper;

    // Text divs: the lead/heading, paragraph(s), and any list wrapper. Exclude
    // the CTA button div (handled separately below).
    const textDivs = Array.from(inner.children).filter(
      (c) => c.tagName === 'DIV' && !c.querySelector('button') && c.textContent.trim().length > 0,
    );

    textDivs.forEach((d, idx) => {
      const list = d.querySelector('ul, ol');
      if (list) {
        // Preserve the bullet list as-is (semantics matter for the farm section).
        contentCell.push(list);
      } else if (idx === 0) {
        // First text div is the lead line -> heading.
        const lead = document.createElement('h2');
        lead.textContent = d.textContent.trim();
        contentCell.push(lead);
      } else {
        const p = document.createElement('p');
        p.textContent = d.textContent.trim();
        contentCell.push(p);
      }
    });

    // CTA (homepage only): use the desktop label "LEARN MORE ABOUT ENSEMBLE",
    // not the mobile "WHO WE ARE" twin. The homepage-cleanup transformer may
    // have already reconstructed the desktop button into an <a>, so accept an
    // existing link too; otherwise choose the button whose label isn't the
    // mobile variant.
    const existingLink = [...element.querySelectorAll('a[href]')]
      .find((a) => /learn more about ensemble/i.test(a.textContent));
    const button = [...element.querySelectorAll('button')]
      .find((b) => /learn more about ensemble/i.test(b.textContent))
      || [...element.querySelectorAll('button')].find((b) => !/^who we are$/i.test(b.textContent.trim()));
    const label = (existingLink || button)?.textContent.trim();
    if (label) {
      const link = document.createElement('a');
      link.setAttribute('href', '/about/');
      link.textContent = label;
      contentCell.push(link);
    }
  }

  // One row, two columns: image | content.
  const cells = [[image || '', contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-about', cells });
  element.replaceWith(block);
}
