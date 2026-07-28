import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
} from './aem.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Applies section-metadata blocks as section classes/dataset, then removes them
 * so they are not treated as loadable blocks. Mirrors the standard boilerplate
 * behavior which this project's aem.js decorateSections omits.
 * @param {Element} main The main element
 */
function decorateSectionMetadata(main) {
  main.querySelectorAll('.section-metadata').forEach((sectionMeta) => {
    const section = sectionMeta.closest('.section');
    if (section) {
      [...sectionMeta.children].forEach((row) => {
        const [keyCell, valueCell] = row.children;
        if (!keyCell || !valueCell) return;
        const key = keyCell.textContent.trim().toLowerCase();
        const value = valueCell.textContent.trim();
        if (key === 'style') {
          value.split(',').forEach((style) => {
            const className = style.trim().toLowerCase().replace(/[^0-9a-z]+/g, '-').replace(/^-+|-+$/g, '');
            if (className) section.classList.add(className);
          });
        } else if (key) {
          section.dataset[key.replace(/[^0-9a-z]+([a-z0-9])/g, (m, c) => c.toUpperCase())] = value;
        }
      });
    }
    const wrapper = sectionMeta.parentElement;
    sectionMeta.remove();
    if (wrapper && wrapper !== section && wrapper.children.length === 0) wrapper.remove();
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
/**
 * Normalizes internal links by removing the trailing slash from the pathname.
 * The migrated content (from a Gatsby source) links to routes like
 * `/services/`, but Edge Delivery serves those pages without a trailing slash
 * (`/services`), so the slashed form 404s. Strip the trailing slash from
 * same-site links, preserving the site root, any query string, and hash.
 * @param {HTMLElement} el The container element to process
 */
export function normalizeInternalLinks(el) {
  el.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    // Only touch internal links: root-relative paths or same-origin absolute.
    let path = href;
    let isAbsolute = false;
    if (/^https?:\/\//i.test(href)) {
      try {
        const u = new URL(href);
        if (u.origin !== window.location.origin) return; // external — leave alone
        path = u.pathname + u.search + u.hash;
        isAbsolute = true;
      } catch { return; }
    } else if (!href.startsWith('/')) {
      return; // relative, mailto:, tel:, #hash, etc. — leave alone
    }
    // Split off query/hash, trim a single trailing slash from the pathname only.
    const m = path.match(/^([^?#]*)([?#].*)?$/);
    let pathname = m[1];
    const rest = m[2] || '';
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.replace(/\/+$/, '');
      const next = pathname + rest;
      a.setAttribute('href', isAbsolute ? `${window.location.origin}${next}` : next);
    }
  });
}

/**
 * Highlights the lowercase brand word "ensemble" inside grey CTA bands, matching
 * the source where it is rendered in the link/brand blue. Scoped to grey-section
 * default content so ordinary prose is untouched.
 * @param {HTMLElement} main The main container element
 */
function decorateBrandWord(main) {
  main.querySelectorAll('.section.grey .default-content-wrapper p').forEach((p) => {
    if (p.querySelector('a, .brand-word')) return;
    if (!/\bensemble\b/.test(p.textContent)) return;
    p.innerHTML = p.innerHTML.replace(/\bensemble\b/g, '<span class="brand-word">ensemble</span>');
  });
}

/**
 * Classifies grey default-content bands into two named variants so the CSS keys
 * on an explicit class rather than a fragile :has()/:not(:has()) heading probe.
 *  - grey-statement: paragraph-only band (homepage "Let ensemble handle..." CTA)
 *    rendered as a large bold statement.
 *  - grey-prose: band that carries a heading (About "Do right by people")
 *    rendered as a small bold heading + regular-weight prose.
 * @param {HTMLElement} main The main container element
 */
function decorateGreyStatements(main) {
  main.querySelectorAll('.section.grey .default-content-wrapper').forEach((wrapper) => {
    if (wrapper.querySelector('h1, h2, h3')) wrapper.classList.add('grey-prose');
    else wrapper.classList.add('grey-statement');
  });
}

/**
 * Portfolio and product detail pages open with a breadcrumb paragraph whose
 * first link points back to the listing (/portfolio or /products). Stamp a
 * `detail-page` class on main for those pages so the CSS can restore the
 * source's larger section headings (32px/800) without affecting other pages.
 * @param {HTMLElement} main The main container element
 */
function decorateDetailPage(main) {
  const firstWrapper = main.querySelector('.section > .default-content-wrapper');
  const crumbLink = firstWrapper?.querySelector(':scope > p:first-child > a[href]');
  const href = crumbLink ? crumbLink.getAttribute('href') : '';
  if (!/^\/(portfolio|products)(\/|$)/.test(href)) return;
  main.classList.add('detail-page');

  // The detail pages close with a "Back to portfolio/products" link and a
  // "Contact us" CTA. The source renders both as buttons on one centered row:
  // the back link as an outlined (secondary) button, contact us as the filled
  // (primary) button (decorateButtons already promoted the strong-wrapped
  // "Contact us"). Promote the plain back link, then wrap the two adjacent CTA
  // paragraphs in their own flex row. Wrapping just the two <p>s (not their
  // parent, which on some pages holds all the page content) keeps the rest of
  // the layout untouched.
  const backLink = [...main.querySelectorAll('.default-content-wrapper > p > a[href]')]
    .find((a) => /^back to\b/i.test(a.textContent.trim()));
  if (backLink) {
    const backP = backLink.closest('p');
    backP.className = 'button-wrapper';
    backLink.className = 'button secondary';
    // Group the back + trailing "Contact us" button paragraph into one row.
    const contactP = backP.nextElementSibling;
    if (contactP && contactP.tagName === 'P' && contactP.querySelector('a.button')) {
      const row = document.createElement('div');
      row.className = 'detail-cta-row';
      backP.replaceWith(row);
      row.append(backP, contactP);
    }
  }
}

// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateSectionMetadata(main);
  decorateBlocks(main);
  decorateButtons(main);
  decorateBrandWord(main);
  decorateGreyStatements(main);
  decorateDetailPage(main);
  normalizeInternalLinks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
