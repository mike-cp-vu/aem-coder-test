/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-stats. Base: cards (no-images variant).
 * Source: https://www.ensemble.com/ (hero + stats banner section)
 * Generated: 2026-07-22
 *
 * Stats have no image/icon — only a big number and a label — so this maps to
 * the "cards (no images)" convention: 1 column, one row per card.
 *  - Row 1: block name (handled by createBlock)
 *  - Each subsequent row: single cell with number + label.
 *
 * The stat items are the ".group" cells inside the 3x3 grid; the empty grid
 * filler divs are skipped because they contain no number.
 */
export default function parse(element, { document }) {
  // Each stat is a ".group" cell; fall back to any cell that has a bold number.
  let statCells = Array.from(element.querySelectorAll(':scope > div.group, :scope > div > div.group, div.group'));

  // Fallback: if the ".group" class is absent, use direct grid children that
  // actually contain text (skip empty filler divs).
  if (statCells.length === 0) {
    statCells = Array.from(element.querySelectorAll(':scope > div')).filter(
      (d) => d.textContent.trim().length > 0,
    );
  }

  const cells = [];

  statCells.forEach((stat) => {
    // The inner divs: first bold div = number, second = label.
    const inner = stat.querySelector('div') || stat;
    const parts = Array.from(inner.querySelectorAll(':scope > div'));

    const contentCell = [];
    if (parts.length >= 2) {
      contentCell.push(...parts);
    } else if (stat.textContent.trim().length > 0) {
      contentCell.push(stat);
    }

    if (contentCell.length > 0) {
      cells.push([contentCell]);
    }
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-stats', cells });
  element.replaceWith(block);
}
