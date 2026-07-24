export default function decorate(block) {
  const rows = [...block.children];
  // row 1 = background image, row 2 = content
  const contentRow = rows[rows.length - 1];
  const cell = contentRow?.querySelector(':scope > div');

  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }

  if (!cell) return;

  // Split the content cell into a copy group (headline + intro) and a
  // form card group (form heading through the submit button).
  const heading = cell.querySelector('h3, h2');

  const copy = document.createElement('div');
  copy.className = 'hero-ad-copy';
  const card = document.createElement('div');
  card.className = 'hero-ad-form';

  let inCard = false;
  [...cell.children].forEach((el) => {
    if (el === heading) inCard = true;
    (inCard ? card : copy).append(el);
  });

  cell.append(copy);
  if (card.children.length) cell.append(card);

  // Turn each list item into a labeled faux input by exposing its text as a
  // placeholder attribute the CSS renders inside a faux field.
  card.querySelectorAll('ul > li').forEach((li) => {
    li.dataset.placeholder = li.textContent.trim();
  });
}
