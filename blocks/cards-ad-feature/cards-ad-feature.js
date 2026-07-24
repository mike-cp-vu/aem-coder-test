export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      // The icon cell holds a leading icon (span.icon rendered from an EDS icon
      // token, or a picture/img) and no heading text. Everything else is body.
      const hasIcon = div.querySelector('span.icon, picture, img');
      if (hasIcon && !div.querySelector('h1, h2, h3, h4, h5, h6')) {
        div.className = 'cards-ad-feature-card-image';
      } else {
        div.className = 'cards-ad-feature-card-body';
      }
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
