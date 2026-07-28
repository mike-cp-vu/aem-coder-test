import { getMetadata } from '../../scripts/aem.js';
import { normalizeInternalLinks } from '../../scripts/scripts.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  // The nav fragment ships a white logo asset (fill="white") that is only
  // visible over the dark hero; on light headers it renders white-on-white and
  // disappears. Swap in the repo's brand-blue logo SVG (served directly, not
  // through the media pipeline so it stays crisp) so the logo shows in brand
  // blue on light headers; the hero-state CSS filter turns it white over the
  // dark hero, matching the source's color-adaptive inline SVG.
  const brandPicture = navBrand.querySelector('picture');
  if (brandPicture) {
    const brandImg = document.createElement('img');
    brandImg.src = `${window.hlx.codeBasePath}/icons/ensemble-logo.svg`;
    brandImg.alt = navBrand.querySelector('img')?.alt || 'Ensemble';
    brandImg.width = 240;
    brandImg.height = 36;
    brandImg.loading = 'eager';
    brandPicture.replaceWith(brandImg);
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });

    // Mark the nav link for the current page so it gets the active underline
    // (source shows the current section with an orange bottom border).
    const here = window.location.pathname.replace(/\/$/, '') || '/';
    navSections.querySelectorAll('a[href]').forEach((a) => {
      let linkPath;
      try {
        linkPath = new URL(a.href, window.location).pathname.replace(/\/$/, '') || '/';
      } catch {
        return;
      }
      if (linkPath !== '/' && here.startsWith(linkPath)) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  // Region selector: the source renders the "Global" tools item as a dropdown
  // with Global and EMEA options. Build that dropdown from the single tools
  // link so authors only maintain one entry.
  const navTools = nav.querySelector('.nav-tools');
  const regionLink = navTools?.querySelector('a');
  if (regionLink && /global/i.test(regionLink.textContent)) {
    const regions = [
      { label: 'Global', href: '/' },
      { label: 'EMEA', href: '/emea/' },
    ];
    const dropdown = document.createElement('div');
    dropdown.className = 'nav-region';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-region-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-haspopup', 'true');
    // The source shows only the globe icon + caret (no text). Keep the label
    // as an accessible name for screen readers, not visible text.
    toggle.setAttribute('aria-label', regionLink.textContent.trim());
    toggle.innerHTML = '<span class="nav-region-icon" aria-hidden="true"></span><span class="nav-region-caret" aria-hidden="true"></span>';
    const menu = document.createElement('ul');
    menu.className = 'nav-region-menu';
    regions.forEach((r) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = r.href;
      a.textContent = r.label;
      li.append(a);
      menu.append(li);
    });
    dropdown.append(toggle, menu);
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
    document.addEventListener('click', () => toggle.setAttribute('aria-expanded', 'false'));
    regionLink.closest('p')?.replaceWith(dropdown);
  }

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // Migrated nav links carry trailing slashes (/services/) that 404 on EDS;
  // normalize them to the slash-less routes the site actually serves.
  normalizeInternalLinks(nav);

  // Transparent-over-hero header: when the page opens with a dark hero as its
  // first section, the source overlaps a transparent white-text header on it.
  // Scope this with a body class so light content pages keep the solid header.
  const firstSection = document.querySelector('main > .section');
  const hero = firstSection && firstSection.querySelector('.hero-home');
  if (hero) {
    document.body.classList.add('nav-over-hero');
    // The header stays fixed on scroll. Over the hero it is transparent with
    // white text; once the user scrolls past the hero it switches to a solid
    // white bar with dark text so the links stay legible over page content.
    const onScroll = () => {
      const past = window.scrollY > hero.offsetHeight - 64;
      document.body.classList.toggle('nav-scrolled', past);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}
