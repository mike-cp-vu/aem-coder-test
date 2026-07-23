/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsServiceNavParser from './parsers/cards-service-nav.js';
import cardsServiceDetailParser from './parsers/cards-service-detail.js';

// TRANSFORMER IMPORTS
// services-cleanup: neutral header/footer/cookie removal + LOCAL.ICONS → /icons/
// rewrite. Does NOT reconstruct portfolio/contact buttons (the parser emits
// those CTAs itself), avoiding the duplicate-CTA bug from homepage-cleanup.
// Sections transformer adds <hr> section breaks between sections.
import servicesCleanupTransformer from './transformers/services-cleanup.js';
import homepageSectionsTransformer from './transformers/homepage-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-service-nav': cardsServiceNavParser,
  'cards-service-detail': cardsServiceDetailParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (services)
const PAGE_TEMPLATE = {
  name: 'services',
  description: 'Services page: intro heading, service quick-nav pills, 8 repeating media-rich service detail blocks, and a closing team-augmentation CTA',
  urls: [
    'https://www.ensemble.com/services/',
  ],
  blocks: [
    { name: 'cards-service-nav', instances: ['div[data-testid="services-list-container"]'] },
    {
      name: 'cards-service-detail',
      // Match by stable data-testid (each service item is
      // <div data-testid="<slug>-service-container">). Excludes the CTA, whose
      // testid is "contact-container" (not "*-service-container"). Robust to the
      // nth-child index shifts caused by block replacement + section breaks.
      instances: ['div[data-testid$="-service-container"]'],
    },
  ],
  sections: [
    { id: 'svc-intro', name: 'Intro heading', selector: 'div[data-testid="hero-container"]', style: null, blocks: [], defaultContent: ['div[data-testid="hero-container"]'] },
    { id: 'svc-nav', name: 'Service quick-nav pills', selector: 'div[data-testid="services-list-container"]', style: null, blocks: ['cards-service-nav'], defaultContent: [] },
    { id: 'svc-details', name: 'Service detail blocks', selector: 'div[data-testid$="-service-container"]', style: null, blocks: ['cards-service-detail'], defaultContent: [] },
    { id: 'svc-cta', name: 'Closing team-augmentation CTA', selector: 'div[data-testid="contact-container"]', style: 'center', blocks: [], defaultContent: ['div[data-testid="contact-container"]'] },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, sections after (only when 2+ sections)
const transformers = [
  servicesCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [homepageSectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    if (blockDef.name.startsWith('section-')) return;
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Invalid selector for block "${blockDef.name}": ${selector}`);
        return;
      }
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform - initial cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform - final cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5b. Normalize committed-icon references to root-relative /icons/ paths.
    // adjustImageUrls (step 5) re-absolutizes the LOCAL.ICONS placeholder to the
    // source origin, so strip everything before /icons/ here — covers service
    // icons AND the committed logo assets (/icons/logo-*.svg).
    main.querySelectorAll('img[src*="/icons/"]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const idx = src.indexOf('/icons/');
      if (idx > 0) img.setAttribute('src', src.slice(idx));
    });

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
