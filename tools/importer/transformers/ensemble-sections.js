/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: ensemble section boundaries.
 *
 * Establishes AEM section breaks (<hr>) and Section Metadata blocks from the
 * template's `sections` definition (page-templates.json → contact-page).
 *
 * Sections (in document order), selectors verified against migration-work/cleaned.html:
 *   1. Intro heading          style: null          (first section — no leading <hr>)
 *   2. Contact form           style: null
 *   3. Office locations grid  style: null
 *   4. Leadership contacts    style: "light-grey-blue"  (→ Section Metadata block)
 *   5. Email CTA              style: null
 *
 * Expected result: 4 <hr> (sections - 1) and 1 Section Metadata block.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;

    const doc = element.ownerDocument;

    // Process in reverse order so inserted <hr>/metadata don't shift the
    // positions of sections not yet handled.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = section.selector ? element.querySelector(section.selector) : null;
      if (!sectionEl) continue;

      // Section Metadata block for sections that declare a style.
      if (section.style) {
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(metadataBlock);
      }

      // Section break before every section except the first.
      if (i > 0) {
        sectionEl.before(doc.createElement('hr'));
      }
    }
  }
}
