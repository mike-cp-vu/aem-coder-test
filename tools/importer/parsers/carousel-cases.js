/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-cases. Base: carousel.
 * Source: ad landing pages — the "Case Study" carousel: rotating slides, each
 * with client logos + a "Case Study" label, a headline, a description
 * paragraph, a bulleted results list, and a slide image (Wiley/Porsche/Royal
 * College).
 *
 * Carousel convention: one row per slide. carousel-cases.js makes the first
 * cell the image column (when it contains a picture/img) and the remaining
 * cell(s) the content column. We emit per slide:
 *   cell 1: the slide image (/static/ photo — "Slide N")
 *   cell 2: content — "Case Study" label, headline (h2), description, results
 *           list.
 *
 * IMAGE HANDLING: slide photos are /static/ (rehosted). The small client-logo
 * images inside the content are inline data:/blob: placeholders and are skipped.
 */
export default function parse(element, { document }) {
  const abs = (s) => (s && s.startsWith('//') ? `https:${s}` : s);
  const realSrc = (im) => {
    const s = im.getAttribute('src') || '';
    return s && !s.startsWith('data:') && !s.startsWith('blob:');
  };

  // Each slide carries a case-study headline. Use the headings as slide anchors.
  const headings = Array.from(element.querySelectorAll('h1, h2, h3'));
  const cells = [];

  headings.forEach((headingEl) => {
    // The slide root: nearest ancestor that also contains a real "Slide N" image.
    let slide = headingEl.parentElement;
    while (slide && slide !== element
      && !Array.from(slide.querySelectorAll('img')).some((im) => realSrc(im) && /slide/i.test(im.getAttribute('alt') || ''))) {
      slide = slide.parentElement;
    }
    if (!slide || slide === element) slide = headingEl.closest('div') || headingEl.parentElement;
    if (!slide) return;

    const content = [];
    const headline = headingEl.textContent.trim();

    // "Case Study" label.
    const label = Array.from(slide.querySelectorAll('p, div, span'))
      .map((el) => (el.children.length === 0 ? el.textContent.trim() : ''))
      .find((t) => /case study/i.test(t));
    if (label) {
      const p = document.createElement('p');
      p.textContent = label;
      content.push(p);
    }

    // Headline.
    const h = document.createElement('h2');
    h.textContent = headline;
    content.push(h);

    // Description paragraph (longest leaf text that isn't the label/headline/list).
    const desc = Array.from(slide.querySelectorAll('p, div'))
      .filter((el) => el.children.length === 0 && el.textContent.trim() && !el.closest('li'))
      .map((el) => el.textContent.trim())
      .filter((t) => t !== label && t !== headline && !/case study/i.test(t))
      .sort((a, b) => b.length - a.length)[0];
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      content.push(p);
    }

    // Results list.
    const items = Array.from(slide.querySelectorAll('li'))
      .map((li) => li.textContent.trim())
      .filter(Boolean);
    if (items.length) {
      const ul = document.createElement('ul');
      items.forEach((t) => {
        const li = document.createElement('li');
        li.textContent = t;
        ul.append(li);
      });
      content.push(ul);
    }

    // Slide image.
    const slideImg = Array.from(slide.querySelectorAll('img'))
      .find((im) => realSrc(im) && /slide/i.test(im.getAttribute('alt') || ''))
      || Array.from(slide.querySelectorAll('img')).find(realSrc);

    if (slideImg) {
      const img = document.createElement('img');
      img.setAttribute('src', abs(slideImg.getAttribute('src') || ''));
      img.setAttribute('alt', slideImg.getAttribute('alt') || headline);
      cells.push([[img], content]);
    } else {
      cells.push([content]);
    }
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-cases', cells });
  element.replaceWith(block);
}
