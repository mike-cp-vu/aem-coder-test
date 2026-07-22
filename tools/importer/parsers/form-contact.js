/* eslint-disable */
/* global WebImporter */
/**
 * Parser for form-contact.
 * Base: form (no vanilla block in library — custom variant created in migration).
 * Source: https://www.ensemble.com/contact/
 * Structure: table rows of `type | label | name | required/options`.
 *   - Row 1: block name.
 *   - One row per form field: input type, visible label, field name/id,
 *     and either "required" (for required fields) or the option list (select).
 *   - Final row: the submit button (type=submit, label=button text).
 */
export default function parse(element, { document }) {
  const form = element.matches('form') ? element : element.querySelector('form');
  const scope = form || element;

  const cells = [];

  // Each field is a <label>+<input>/<select>/<textarea> pair inside a wrapper div.
  const controls = Array.from(
    scope.querySelectorAll('input, select, textarea'),
  );

  controls.forEach((control) => {
    // Locate the associated label: prefer the label within the same field wrapper.
    const wrapper = control.closest('div');
    let label = wrapper ? wrapper.querySelector('label') : null;
    if (!label) {
      // Fallback: label immediately preceding the control.
      label = control.previousElementSibling && control.previousElementSibling.tagName === 'LABEL'
        ? control.previousElementSibling
        : null;
    }

    // Determine field type.
    const tag = control.tagName.toLowerCase();
    let type = tag;
    if (tag === 'input') {
      type = control.getAttribute('type') || 'text';
    }

    // Label text (strip required marker asterisk which lives in a nested span).
    const requiredMarker = label ? label.querySelector('.text-errors, span') : null;
    const isRequired = !!(requiredMarker && requiredMarker.textContent.trim());
    let labelText = '';
    if (label) {
      labelText = Array.from(label.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent)
        .join('')
        .trim();
      if (!labelText) labelText = label.textContent.replace(/\*/g, '').trim();
    }

    // Field name/id.
    const name = control.getAttribute('name') || control.getAttribute('id') || '';

    // Fourth column: required marker or, for selects, the available options.
    // Options are emitted as a <ul> so each survives the markdown pipeline as a
    // distinct node (inline comma/newline separators get collapsed to spaces).
    let extra = '';
    if (tag === 'select') {
      const options = Array.from(control.querySelectorAll('option'))
        .map((opt) => opt.textContent.trim())
        .filter(Boolean);
      if (options.length) {
        const ul = document.createElement('ul');
        options.forEach((opt) => {
          const li = document.createElement('li');
          li.textContent = opt;
          ul.append(li);
        });
        extra = ul;
      }
    } else if (isRequired) {
      extra = 'required';
    }

    cells.push([type, labelText, name, extra]);
  });

  // Submit button row.
  const submit = scope.querySelector('button[type="submit"], button:not([type]), input[type="submit"]');
  if (submit) {
    const submitLabel = submit.textContent.trim() || submit.getAttribute('value') || 'Submit';
    cells.push(['submit', submitLabel, '', '']);
  }

  // Empty-block guard: no fields found.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'form-contact', cells });
  element.replaceWith(block);
}
