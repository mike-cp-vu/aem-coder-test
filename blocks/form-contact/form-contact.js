/**
 * form-contact block
 *
 * Renders an accessible contact form from an authored table.
 * Each block row defines one field (or the submit button):
 *   | Type     | Label                      | Name      | Required / Options                    |
 *   | text     | First Name                 | firstName | required                              |
 *   | email    | Email                      | email     | required                              |
 *   | select   | What are you interested in?| interest  | Placeholder, Option A, Option B, ...  |
 *   | textarea | What can we help you with? | message   |                                       |
 *   | submit   | SUBMIT                     |           |                                       |
 *
 * Fields are visually grouped under section headings ("Personal Information",
 * "Inquiry") when a `heading` row is present. Select options may be separated
 * by commas, pipes, or newlines; the first option becomes the placeholder.
 *
 * NOTE: Self-contained variant created during migration because no vanilla
 * `form` block exists in the project and no forms plugin is configured.
 * Wire up an action/endpoint as needed.
 */

function splitOptions(raw) {
  if (!raw) return [];
  // support comma, pipe, or newline separated option lists
  let parts;
  if (raw.includes('|')) parts = raw.split('|');
  else if (raw.includes(',')) parts = raw.split(',');
  else parts = raw.split(/\n/);
  return parts.map((o) => o.trim()).filter(Boolean);
}

function createField(type, label, name, extraCell) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-contact-field';
  const extraText = typeof extraCell === 'string' ? extraCell : (extraCell?.textContent || '');
  const required = /required/i.test(extraText);

  let control;
  if (type === 'textarea') {
    control = document.createElement('textarea');
    control.rows = 4;
    if (label) control.placeholder = label;
  } else if (type === 'select') {
    control = document.createElement('select');
    // Options come from a <ul><li> list (survives markdown) or fall back to
    // a delimited string.
    const listItems = extraCell && extraCell.querySelectorAll
      ? [...extraCell.querySelectorAll('li')].map((li) => li.textContent.trim()).filter(Boolean)
      : [];
    const options = listItems.length ? listItems : splitOptions(extraText);
    // first option is the placeholder (disabled, selected, empty value)
    const [placeholderText, ...rest] = options;
    if (placeholderText) {
      const placeholder = document.createElement('option');
      placeholder.textContent = placeholderText;
      placeholder.value = '';
      placeholder.disabled = true;
      placeholder.selected = true;
      control.append(placeholder);
    }
    rest.forEach((opt) => {
      const option = document.createElement('option');
      option.textContent = opt;
      option.value = opt;
      control.append(option);
    });
  } else if (type === 'submit') {
    control = document.createElement('button');
    control.type = 'submit';
    control.textContent = label || 'Submit';
    wrapper.classList.add('form-contact-submit');
    wrapper.append(control);
    return wrapper;
  } else {
    control = document.createElement('input');
    control.type = type || 'text';
    if (label) control.placeholder = label;
  }

  if (name) {
    control.name = name;
    control.id = name;
  }
  if (required) {
    control.required = true;
    control.setAttribute('aria-required', 'true');
  }

  // label with associated control + required marker
  const lbl = document.createElement('label');
  if (name) lbl.setAttribute('for', name);
  lbl.append(document.createTextNode(label || ''));
  if (required) {
    const star = document.createElement('span');
    star.className = 'form-contact-required';
    star.setAttribute('aria-hidden', 'true');
    star.textContent = ' *';
    lbl.append(star);
  }
  wrapper.append(lbl, control);
  return wrapper;
}

export default function decorate(block) {
  const form = document.createElement('form');
  form.className = 'form-contact-form';

  // group fields under section headings for visual structure matching source
  const groups = {
    firstName: 'Personal Information',
    interest: 'Inquiry',
  };

  [...block.children].forEach((row) => {
    const cellEls = [...row.children];
    const type = cellEls[0]?.textContent.trim();
    const label = cellEls[1]?.textContent.trim() || '';
    const name = cellEls[2]?.textContent.trim() || '';
    const extraCell = cellEls[3] || null; // pass element so <ul> options survive
    if (!type) return;
    const lowerType = type.toLowerCase();

    // insert a section heading before the field that starts a new group
    if (groups[name]) {
      const heading = document.createElement('h4');
      heading.className = 'form-contact-heading';
      heading.textContent = groups[name];
      form.append(heading);
    }

    form.append(createField(lowerType, label, name, extraCell));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Placeholder submit handler — connect to a form endpoint during integration.
  });

  block.textContent = '';
  block.append(form);
}
