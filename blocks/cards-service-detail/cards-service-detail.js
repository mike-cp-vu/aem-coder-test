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

      /* Tag logo-strip paragraphs (paragraphs that only contain images).
         A strip before the description is a small "platform" strip; a strip
         after it is a large "client" logo strip. Client strips lay out in
         equal cells: 5+ logos three per row, 2-4 logos four per row, a lone
         logo full width — matching the source. */
      const kids = [...body.children];
      const descIdx = kids.findIndex(
        (p) => p.tagName === 'P' && p.textContent.trim() && !p.querySelector('a'),
      );
      kids.forEach((p, idx) => {
        if (p.tagName !== 'P') return;
        const onlyImages = p.querySelector('picture, img') && !p.textContent.trim();
        if (!onlyImages) return;
        p.classList.add('cards-service-detail-logos');
        if (descIdx !== -1 && idx < descIdx) {
          p.classList.add('cards-service-detail-logos-platform');
        } else {
          p.classList.add('cards-service-detail-logos-client');
          const n = p.querySelectorAll('picture').length || p.querySelectorAll('img').length;
          let cols = '4';
          if (n === 1) cols = 'full';
          else if (n >= 5) cols = '3';
          p.classList.add(`cards-service-detail-logos-cols-${cols}`);
        }
      });
    }

    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
