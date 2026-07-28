export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      // The icon cell holds the service icon (a span.icon rendered from an EDS
      // icon token, or a picture/img) and no heading text. Everything else is
      // the text body.
      const hasIcon = div.querySelector('span.icon, picture, img');
      if (hasIcon && !div.querySelector('h1, h2, h3, h4, h5, h6')) {
        div.className = 'cards-services-card-image';
      } else {
        div.className = 'cards-services-card-body';
      }
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);

  // Variant detection: the homepage "What we provide" services cards link each
  // heading to a service anchor; the About "company values" cards do not. When
  // no card heading is a link, mark the block as the values variant so the CSS
  // can style it (centered, icon-on-top, dark text) via an explicit class
  // rather than a fragile structural selector.
  if (!ul.querySelector('h2 a, h3 a, h4 a, h5 a, h6 a')) {
    block.classList.add('cards-services-values');
  }
}
