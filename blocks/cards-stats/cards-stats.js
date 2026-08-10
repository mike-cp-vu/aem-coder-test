import { createOptimizedPicture } from '../../scripts/aem.js';

const COUNT_UP_MS = 2200;

/**
 * Counts a stat number up from 0 to its authored value when the block
 * scrolls into view (matches source). A bare year like "1995 established"
 * isn't a quantity, so it's excluded via its label rather than a magnitude
 * heuristic (the "2000+ projects" stat is larger and still counts up).
 */
function animateCount(numberEl, labelText) {
  const raw = numberEl.textContent.trim();
  const match = raw.match(/^(\D*)(\d[\d,]*)(\D*)$/);
  if (!match || /established/i.test(labelText)) return;

  const [, prefix, digits, suffix] = match;
  const target = parseInt(digits.replace(/,/g, ''), 10);
  if (Number.isNaN(target)) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - start) / COUNT_UP_MS, 1);
    const eased = 1 - (1 - progress) ** 3;
    const value = Math.round(target * eased);
    numberEl.textContent = `${prefix}${value.toLocaleString()}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  numberEl.textContent = `${prefix}0${suffix}`;
  requestAnimationFrame(tick);
}

function observeCounts(block) {
  const cards = [...block.querySelectorAll('.cards-stats-card-body')];
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const numberEl = entry.target.firstElementChild;
      const labelText = entry.target.lastElementChild?.textContent || '';
      if (numberEl) animateCount(numberEl, labelText);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  cards.forEach((card) => observer.observe(card));
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-stats-card-image';
      else div.className = 'cards-stats-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
  observeCounts(block);
}
