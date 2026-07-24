/**
 * cards-key-points
 * Text-only two-column grid. Each block row is one item made of a bold
 * heading followed by a descriptive paragraph. No images, icons or buttons.
 * Used for the "Initiative Key Considerations" and "Results and Deliverables"
 * grids on portfolio detail pages.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      div.className = 'cards-key-points-card-body';
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
