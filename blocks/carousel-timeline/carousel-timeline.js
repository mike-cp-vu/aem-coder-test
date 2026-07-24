/*
 * carousel-timeline — horizontal "Our story" timeline.
 * Source: https://www.ensemble.com/about/ ("Our story")
 * Each row -> <li> with a card image + body (bold year heading + description).
 * Adds prev/next arrow buttons that scroll the track horizontally.
 * Vanilla, dependency-free (no slick.js / carousel lib).
 */

/**
 * Scrolls the track by roughly one card in the given direction.
 * @param {HTMLElement} track The scrollable <ul> track
 * @param {number} dir -1 for previous, 1 for next
 */
function scrollTrack(track, dir) {
  const firstCard = track.querySelector('li');
  // step = one card width incl. gap; fall back to ~80% of the viewport width
  let step = track.clientWidth * 0.8;
  if (firstCard) {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    step = firstCard.getBoundingClientRect().width + gap;
  }
  track.scrollBy({ left: dir * step, behavior: 'smooth' });
}

/**
 * Enables/disables arrow buttons based on current scroll position.
 * @param {HTMLElement} track
 * @param {HTMLButtonElement} prev
 * @param {HTMLButtonElement} next
 */
function updateArrows(track, prev, next) {
  const maxScroll = track.scrollWidth - track.clientWidth;
  const atStart = track.scrollLeft <= 1;
  const atEnd = track.scrollLeft >= maxScroll - 1;
  prev.disabled = atStart;
  next.disabled = atEnd;
}

export default function decorate(block) {
  // 1. Transform authored rows into a <ul>/<li> track.
  const ul = document.createElement('ul');
  ul.className = 'carousel-timeline-track';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'carousel-timeline-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'carousel-timeline-card-image';
      } else {
        div.className = 'carousel-timeline-card-body';
      }
    });
    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);

  // 2. Build the arrow navigation.
  const nav = document.createElement('div');
  nav.className = 'carousel-timeline-nav';
  nav.innerHTML = `
    <button type="button" class="carousel-timeline-arrow carousel-timeline-prev" aria-label="Previous slides"></button>
    <button type="button" class="carousel-timeline-arrow carousel-timeline-next" aria-label="Next slides"></button>
  `;
  block.append(nav);

  const prev = nav.querySelector('.carousel-timeline-prev');
  const next = nav.querySelector('.carousel-timeline-next');

  prev.addEventListener('click', () => scrollTrack(ul, -1));
  next.addEventListener('click', () => scrollTrack(ul, 1));

  // 3. Keep arrow state in sync with scroll position.
  const sync = () => updateArrows(ul, prev, next);
  ul.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  // initial state (also after images load, since scrollWidth may change)
  sync();
  window.requestAnimationFrame(sync);
}
