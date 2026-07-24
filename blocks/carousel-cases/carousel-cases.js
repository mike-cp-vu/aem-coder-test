/**
 * Case Studies carousel.
 * Authored structure: each row is one case-study slide. A slide's first cell is
 * the image column; the remaining cell(s) are the content column (logos, label,
 * headline, description, results list).
 *
 * Decorated structure:
 *   .carousel-cases > .carousel-cases-slides-container
 *     > ul.carousel-cases-slides > li.carousel-cases-slide
 *   plus prev/next navigation and slide indicators.
 *
 * Shows one slide at a time; prev/next arrows and indicators cycle with wrap.
 */

function showSlide(block, index) {
  const slides = [...block.querySelectorAll('.carousel-cases-slide')];
  if (!slides.length) return;
  let next = index;
  if (next < 0) next = slides.length - 1;
  if (next >= slides.length) next = 0;

  const activeSlide = slides[next];
  block.dataset.activeSlide = String(next);

  slides.forEach((slide, idx) => {
    slide.setAttribute('aria-hidden', String(idx !== next));
    slide.querySelectorAll('a').forEach((link) => {
      if (idx !== next) link.setAttribute('tabindex', '-1');
      else link.removeAttribute('tabindex');
    });
  });

  block.querySelectorAll('.carousel-cases-slide-indicator button').forEach((button, idx) => {
    if (idx === next) button.setAttribute('disabled', 'true');
    else button.removeAttribute('disabled');
  });

  block.querySelector('.carousel-cases-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function createSlide(row, slideIndex) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.classList.add('carousel-cases-slide');

  [...row.children].forEach((column, colIdx) => {
    const isImage = colIdx === 0 && column.querySelector('picture, img');
    column.classList.add(`carousel-cases-slide-${isImage ? 'image' : 'content'}`);
    slide.append(column);
  });

  return slide;
}

export default function decorate(block) {
  const rows = [...block.children];
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-cases-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-cases-slides');

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-cases-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-cases-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="Previous Slide"></button>
      <button type="button" class="slide-next" aria-label="Next Slide"></button>
    `;
    container.append(slideNavButtons);
    block.append(slideIndicatorsNav);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-cases-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="Show Slide ${idx + 1} of ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (isSingleSlide) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const indicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(indicator.dataset.targetSlide, 10));
    });
  });
  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) + 1);
  });

  showSlide(block, 0);
}
