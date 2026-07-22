/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-team.
 * Base: cards (no images variant). Source: https://www.ensemble.com/contact/
 * Structure (Cards no-images, 1 column):
 *   - Row 1: block name.
 *   - One row per leadership contact. Single cell holds the name (heading),
 *     uppercase title, and mailto email link.
 */
export default function parse(element, { document }) {
  // Each contact card is the smallest wrapper that contains a mailto link.
  // Find every mailto link in scope, then walk up to the card container that
  // holds the name + title + email (the div wrapping the text-center block).
  const emailLinks = Array.from(element.querySelectorAll('a[href^="mailto:"]'));
  const cards = [];
  const seen = new Set();
  emailLinks.forEach((link) => {
    // The text block wrapping name/title/email.
    const textBlock = link.parentElement;
    if (textBlock && !seen.has(textBlock)) {
      seen.add(textBlock);
      cards.push(textBlock);
    }
  });

  const cells = [];

  cards.forEach((card) => {
    const contentCell = [];

    // The name and title are the direct child <div>s of the text block
    // (the same block that directly holds the mailto link).
    const divs = Array.from(card.querySelectorAll(':scope > div'));

    // First inner div = name (render as heading). Second = uppercase title.
    const nameDiv = divs[0];
    const titleDiv = divs[1];

    if (nameDiv && nameDiv.textContent.trim()) {
      const h = document.createElement('h3');
      h.textContent = nameDiv.textContent.trim();
      contentCell.push(h);
    }
    if (titleDiv && titleDiv.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = titleDiv.textContent.trim();
      contentCell.push(p);
    }

    // Email link.
    const email = card.querySelector('a[href^="mailto:"]');
    if (email && email.textContent.trim()) {
      const p = document.createElement('p');
      p.append(email);
      contentCell.push(p);
    }

    if (contentCell.length) cells.push([contentCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-team', cells });
  element.replaceWith(block);
}
