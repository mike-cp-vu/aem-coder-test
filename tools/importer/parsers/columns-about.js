/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-about. Base: columns.
 * Source: https://www.ensemble.com/ (about section)
 * Generated: 2026-07-22
 *
 * Columns convention: side-by-side cells, one row after the block-name row.
 *  - Cell 1: Vancouver scenic image
 *  - Cell 2: bold lead line + paragraph + "LEARN MORE ABOUT ENSEMBLE" CTA
 *
 * The CTA is a <button> in the source (no href); it is converted to a link.
 * The source also has a mobile-only "WHO WE ARE" button variant which is
 * deliberately excluded in favour of the primary desktop CTA.
 */
export default function parse(element, { document }) {
  // Left column: the scenic image.
  const image = element.querySelector('img');

  // Right column: the text block wrapper (lead line + paragraph + CTA).
  const textWrapper = element.querySelector('.flex.flex-col, div[class*="w-267px"], div[class*="w-320px"]');

  // Empty-block guard.
  if (!image && !textWrapper) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];

  if (textWrapper) {
    // Text divs: first = bold lead line, following = paragraph(s).
    const inner = textWrapper.querySelector('div[class*="w-267px"], div[class*="w-320px"]') || textWrapper;
    const textDivs = Array.from(inner.children).filter(
      (c) => c.tagName === 'DIV' && !c.querySelector('button') && c.textContent.trim().length > 0,
    );

    if (textDivs.length > 0) {
      // Lead line as a heading, remaining divs as paragraphs.
      const lead = document.createElement('h2');
      lead.textContent = textDivs[0].textContent.trim();
      contentCell.push(lead);
      textDivs.slice(1).forEach((d) => {
        const p = document.createElement('p');
        p.textContent = d.textContent.trim();
        contentCell.push(p);
      });
    }

    // CTA: use the desktop label "LEARN MORE ABOUT ENSEMBLE", not the mobile
    // "WHO WE ARE" twin. The homepage-cleanup transformer may have already
    // reconstructed the desktop button into an <a>, so accept an existing link
    // too; otherwise choose the button whose label isn't the mobile variant.
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
