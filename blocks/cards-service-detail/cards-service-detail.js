export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-service-detail-card-image';
      else div.className = 'cards-service-detail-card-body';
    });

    /* group the trailing CTA link paragraphs so the buttons sit in a row */
    const body = li.querySelector('.cards-service-detail-card-body');
    if (body) {
      const ctaParagraphs = [...body.children].filter(
        (p) => p.tagName === 'P' && p.children.length === 1 && p.querySelector(':scope > a'),
      );
      if (ctaParagraphs.length) {
        const actions = document.createElement('div');
        actions.className = 'cards-service-detail-actions';
        ctaParagraphs.forEach((p) => {
          const link = p.querySelector('a');
          actions.append(link);
          p.remove();
        });
        body.append(actions);
      }

      /* tag logo-strip paragraphs (paragraphs that only contain images) */
      [...body.children].forEach((p) => {
        if (p.tagName !== 'P') return;
        const onlyImages = p.querySelector('picture, img')
          && !p.textContent.trim();
        if (onlyImages) p.classList.add('cards-service-detail-logos');
      });
    }

    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
