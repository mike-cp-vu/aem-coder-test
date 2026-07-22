/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: ensemble HOMEPAGE section boundaries.
 *
 * Establishes AEM section breaks (<hr>) and Section Metadata blocks from the
 * template's `sections` definition (page-templates.json → homepage).
 *
 * Homepage-specific file: the contact page ships its own ensemble-sections.js.
 * This transformer is template-driven (reads payload.template.sections), so the
 * logic is generic; the file is kept separate only to preserve the contact
 * page's existing transformer per the migration naming convention.
 *
 * Sections (in document order), selectors verified against page-templates.json
 * and migration-work/homepage/cleaned.html:
 *   1. hp-hero       Hero + stats banner    style: "dark"  (first — no leading <hr>) → Section Metadata
 *   2. hp-portfolio  Portfolio project grid style: null
 *   3. hp-services   Services grid          style: null
 *   4. hp-about      About section          style: null
 *   5. hp-cta        CTA band               style: "grey"                            → Section Metadata
 *   6. hp-clients    Client logos           style: null
 *
 * Expected result: 5 <hr> (sections - 1) and 2 Section Metadata blocks.
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

      // Section Metadata block for sections that declare a style
      // (hp-hero → "dark", hp-cta → "grey").
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
