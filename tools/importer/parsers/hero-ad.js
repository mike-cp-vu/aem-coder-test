/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-ad. Base: hero.
 * Source: ad landing pages (https://www.ensemble.com/adsGenStudio/ et al.) —
 * the top hero `<section>` with a full-bleed background image, a white H1 +
 * intro paragraph, and a "Request a Consultation" lead-capture form.
 *
 * Hero convention (1 column, 3 rows):
 *   row 1: block name (added by createBlock)
 *   row 2: background image cell (optional)
 *   row 3: content cell — title (heading) + subheading + call-to-action.
 *
 * The background image is an inline `background-image:url(/static/...)` on the
 * hero section, so we extract that URL and emit it as an <img> in row 2. The
 * lead-capture form is rendered as a STATIC visual form (no backend): the form
 * heading, the field labels as a bulleted list, and a non-functional "Submit
 * Form" link to /contact/.
 */
export default function parse(element, { document }) {
  // ----- row 2: background image -----
  const imageCell = [];
  const style = element.getAttribute('style') || '';
  const bgMatch = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
  if (bgMatch && bgMatch[1]) {
    let src = bgMatch[1].trim();
    if (src.startsWith('//')) src = `https:${src}`;
    if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
      const img = document.createElement('img');
      img.setAttribute('src', src);
      img.setAttribute('alt', (element.querySelector('h1') || {}).textContent || 'hero background');
      imageCell.push(img);
    }
  }

  // ----- row 3: content -----
  const contentCell = [];

  const h1 = element.querySelector('h1');
  if (h1 && h1.textContent.trim()) {
    const h = document.createElement('h1');
    h.textContent = h1.textContent.trim();
    contentCell.push(h);
  }

  // Hero intro paragraph sits beside the H1 (not inside the form column).
  const introP = h1 && h1.parentElement ? h1.parentElement.querySelector('p') : null;
  if (introP && introP.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = introP.textContent.trim();
    contentCell.push(p);
  }

  // Static form representation.
  const formHeading = Array.from(element.querySelectorAll('h2, h3'))
    .find((h) => /request a consultation/i.test(h.textContent));
  const h3 = document.createElement('h3');
  h3.textContent = formHeading ? formHeading.textContent.trim() : 'Request a Consultation';
  contentCell.push(h3);

  const labels = Array.from(element.querySelectorAll('input, textarea'))
    .map((f) => (f.getAttribute('placeholder') || f.getAttribute('name') || '').trim())
    .filter(Boolean);
  if (labels.length) {
    const ul = document.createElement('ul');
    labels.forEach((label) => {
      const li = document.createElement('li');
      li.textContent = label;
      ul.append(li);
    });
    contentCell.push(ul);
  }

  // SUBMIT FORM button → static, non-wired link to /contact/.
  const submitP = document.createElement('p');
  const strong = document.createElement('strong');
  const a = document.createElement('a');
  a.setAttribute('href', '/contact/');
  a.textContent = 'Submit Form';
  strong.append(a);
  submitP.append(strong);
  contentCell.push(submitP);

  const cells = [];
  if (imageCell.length) cells.push([imageCell]);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-ad', cells });
  element.replaceWith(block);
}
