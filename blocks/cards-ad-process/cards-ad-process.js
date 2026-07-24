export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      // The image cell holds the step graphic (picture/img) and no heading text.
      // Everything else is the step label/body.
      const hasImage = div.querySelector('picture, img');
      if (hasImage && !div.querySelector('h1, h2, h3, h4, h5, h6')) {
        div.className = 'cards-ad-process-card-image';
      } else {
        div.className = 'cards-ad-process-card-body';
      }
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
