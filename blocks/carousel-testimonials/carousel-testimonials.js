/**
 * Employee Testimonials carousel.
 * Authored structure: first row is the lead photo (+ eyebrow/author),
 * remaining rows are quote slides (each with quote text + author).
 *
 * Decorated structure:
 *   .carousel-testimonials > ul
 *     > li.carousel-testimonials-photo   -> lead photo (left column)
 *     > li.carousel-testimonials-panel   -> quote panel (right column)
 *
 * Shows one quote slide at a time; prev/next arrows cycle with wrap-around.
 */

function showSlide(block, index) {
  const slides = [...block.querySelectorAll('.carousel-testimonials-slide')];
  if (!slides.length) return;
  let next = index;
  if (next < 0) next = slides.length - 1;
  if (next >= slides.length) next = 0;

  slides.forEach((slide, idx) => {
    const active = idx === next;
    slide.classList.toggle('active', active);
    slide.setAttribute('aria-hidden', String(!active));
  });
  block.dataset.activeSlide = String(next);
}

export default function decorate(block) {
  const rows = [...block.children];

  // Extract the lead photo from the first row.
  const photo = document.createElement('li');
  photo.className = 'carousel-testimonials-photo';
  const firstPicture = rows[0] && rows[0].querySelector('picture');
  if (firstPicture) photo.append(firstPicture);

  // Build quote slides from the remaining rows.
  const slidesWrapper = document.createElement('div');
  slidesWrapper.className = 'carousel-testimonials-slides';
  const slides = [];
  let authorText = 'Herman, Manager, Solutions Consulting';

  rows.slice(1).forEach((row) => {
    const p = [...row.querySelectorAll(':scope > div p')];
    if (!p.length) return;
    const slide = document.createElement('div');
    slide.className = 'carousel-testimonials-slide';

    p.forEach((para) => {
      if (para.querySelector('em')) {
        authorText = para.textContent.trim();
        return;
      }
      slide.append(para);
    });
    slidesWrapper.append(slide);
    slides.push(slide);
  });

  const panel = document.createElement('li');
  panel.className = 'carousel-testimonials-panel';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'carousel-testimonials-eyebrow';
  eyebrow.textContent = 'Employee Testimonials';

  const author = document.createElement('p');
  author.className = 'carousel-testimonials-author';
  author.textContent = authorText;

  const controls = document.createElement('div');
  controls.className = 'carousel-testimonials-controls';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'carousel-testimonials-nav prev';
  prev.setAttribute('aria-label', 'Previous testimonial');

  const controlAuthor = document.createElement('span');
  controlAuthor.className = 'carousel-testimonials-control-author';
  controlAuthor.textContent = authorText;

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'carousel-testimonials-nav next';
  next.setAttribute('aria-label', 'Next testimonial');

  controls.append(prev, controlAuthor, next);
  panel.append(eyebrow, author, slidesWrapper, controls);

  const ul = document.createElement('ul');
  ul.append(photo, panel);

  block.textContent = '';
  block.append(ul);

  if (!slides.length) return;

  prev.addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) - 1);
  });
  next.addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) + 1);
  });

  showSlide(block, 0);
}
