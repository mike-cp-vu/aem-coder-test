import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Portfolio listing: a grid of flip cards. Each card's FRONT shows the project
 * photo with a category + title overlay; on hover/focus it flips (rotateY) to a
 * white BACK panel with the description, tech-stack icons, and a "Read more"
 * link. The whole card is a link to the project detail page.
 *
 * Authored/imported structure per row: cell 1 = photo; cell 2 = category <p>,
 * title <h3>, description <p>, a <p> of tech-icon images, and a "Read more" <a>.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture'));
    const bodyCell = cells.find((c) => c !== imageCell) || cells[1] || cells[0];
    if (!imageCell || !bodyCell) return;

    // Pull the parts out of the body cell.
    const linkEl = bodyCell.querySelector('a[href]');
    const href = linkEl ? linkEl.getAttribute('href') : '';
    const heading = bodyCell.querySelector('h1, h2, h3, h4, h5, h6');
    const techPara = [...bodyCell.querySelectorAll('p')].find((p) => p.querySelector('picture'));
    const textParas = [...bodyCell.querySelectorAll('p')]
      .filter((p) => !p.querySelector('picture') && !p.querySelector('a'));
    const category = textParas[0] || null;
    const description = textParas[1] || null;

    const li = document.createElement('li');

    // The whole tile is a link; if no href was imported it stays a plain card.
    const card = document.createElement(href ? 'a' : 'div');
    card.className = 'cards-portfolio-listing-card';
    if (href) card.href = href;

    // FRONT: photo + category/title overlay.
    const front = document.createElement('div');
    front.className = 'cards-portfolio-listing-front';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'cards-portfolio-listing-card-image';
    while (imageCell.firstElementChild) imageWrap.append(imageCell.firstElementChild);

    const frontLabel = document.createElement('div');
    frontLabel.className = 'cards-portfolio-listing-front-label';
    if (category) {
      const cat = document.createElement('p');
      cat.className = 'cards-portfolio-listing-card-category';
      cat.textContent = category.textContent;
      frontLabel.append(cat);
    }
    if (heading) {
      const title = document.createElement('h3');
      title.className = 'cards-portfolio-listing-card-title';
      title.textContent = heading.textContent;
      frontLabel.append(title);
    }
    front.append(imageWrap, frontLabel);

    // BACK: white panel with category, title, description, tech icons, CTA.
    const back = document.createElement('div');
    back.className = 'cards-portfolio-listing-back';
    if (category) {
      const cat = document.createElement('p');
      cat.className = 'cards-portfolio-listing-card-category';
      cat.textContent = category.textContent;
      back.append(cat);
    }
    if (heading) {
      const title = document.createElement('h3');
      title.className = 'cards-portfolio-listing-back-title';
      title.textContent = heading.textContent;
      back.append(title);
    }
    if (description) {
      const desc = document.createElement('p');
      desc.className = 'cards-portfolio-listing-card-desc';
      desc.textContent = description.textContent;
      back.append(desc);
    }
    if (techPara) {
      const tech = document.createElement('p');
      tech.className = 'cards-portfolio-listing-card-tech';
      while (techPara.firstElementChild) tech.append(techPara.firstElementChild);
      back.append(tech);
    }
    if (href) {
      const cta = document.createElement('span');
      cta.className = 'cards-portfolio-listing-card-cta';
      cta.textContent = linkEl.textContent || 'Read more';
      back.append(cta);
    }

    card.append(front, back);
    li.append(card);
    ul.append(li);
  });

  // Optimize only same-origin / rehosted photos; leave external (ctfassets)
  // project photos and tech icons untouched (they reject EDS query params).
  ul.querySelectorAll('.cards-portfolio-listing-card-image picture > img').forEach((img) => {
    const { src } = img;
    const isExternal = /^https?:\/\//.test(src) && !src.startsWith(window.location.origin);
    if (isExternal) return;
    const optimized = createOptimizedPicture(src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimized);
  });

  block.textContent = '';
  block.append(ul);

  // "Load More" pagination — matches the source, which reveals the grid in
  // batches rather than showing every project at once. Show an initial page of
  // cards, then reveal another batch per click until all are visible.
  const items = [...ul.children];
  const INITIAL = 6;
  const INCREMENT = 6;

  if (items.length > INITIAL) {
    let shown = INITIAL;

    const applyVisibility = () => {
      items.forEach((li, i) => {
        li.hidden = i >= shown;
      });
    };

    const actions = document.createElement('div');
    actions.className = 'cards-portfolio-listing-actions';

    const loadMore = document.createElement('button');
    loadMore.type = 'button';
    loadMore.className = 'cards-portfolio-listing-load-more';
    loadMore.textContent = 'Load More';
    loadMore.addEventListener('click', () => {
      shown += INCREMENT;
      applyVisibility();
      if (shown >= items.length) loadMore.remove();
    });

    actions.append(loadMore);
    applyVisibility();
    block.append(actions);
  }
}
