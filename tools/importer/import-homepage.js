/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroHomeParser from './parsers/hero-home.js';
import cardsStatsParser from './parsers/cards-stats.js';
import cardsPortfolioParser from './parsers/cards-portfolio.js';
import cardsServicesParser from './parsers/cards-services.js';
import columnsAboutParser from './parsers/columns-about.js';
import cardsClientsParser from './parsers/cards-clients.js';

// TRANSFORMER IMPORTS
import homepageCleanupTransformer from './transformers/homepage-cleanup.js';
import homepageSectionsTransformer from './transformers/homepage-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-home': heroHomeParser,
  'cards-stats': cardsStatsParser,
  'cards-portfolio': cardsPortfolioParser,
  'cards-services': cardsServicesParser,
  'columns-about': columnsAboutParser,
  'cards-clients': cardsClientsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (homepage)
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Homepage with hero + stats banner, portfolio project grid, services grid, about section, CTA band, and client logos',
  urls: [
    'https://www.ensemble.com/',
  ],
  blocks: [
    { name: 'hero-home', instances: ['main div > div.relative.pt-36 > div.relative.w-full'] },
    { name: 'cards-stats', instances: ['main div > div.relative.pt-36 div.grid.grid-cols-3'] },
    { name: 'cards-portfolio', instances: ['main div > div.pt-4.pb-4 > div.container.mx-auto > div.relative > div.hidden.grid-cols-2'] },
    { name: 'cards-services', instances: ['main div > div.pt-4.pb-4 > div.container.mx-auto > div > div.grid.hidden'] },
    { name: 'columns-about', instances: ['main div > div.pb-4.pl-4:nth-of-type(4) div.items-stretch.grid-cols-2'] },
    { name: 'cards-clients', instances: ['main div > div.pb-4.pl-4:nth-of-type(6) div.flex.justify-center'] },
    { name: 'section-cta', instances: ['main div > div.bg-background.py-16'], section: 'grey' },
  ],
  sections: [
    { id: 'hp-hero', name: 'Hero + stats banner', selector: 'main div > div.relative.pt-36', style: 'dark', blocks: ['hero-home', 'cards-stats'], defaultContent: [] },
    { id: 'hp-portfolio', name: 'Portfolio project grid', selector: 'main div > div.pt-4.pb-4.pl-4:nth-of-type(2)', style: null, blocks: ['cards-portfolio'], defaultContent: ['main div > div.pt-4.pb-4.pl-4:nth-of-type(2) button'] },
    { id: 'hp-services', name: 'Services grid', selector: 'main div > div.pt-4.pb-4.pl-4:nth-of-type(3)', style: null, blocks: ['cards-services'], defaultContent: ['main div > div.pt-4.pb-4.pl-4:nth-of-type(3) h2'] },
    { id: 'hp-about', name: 'About section', selector: 'main div > div.pb-4.pl-4:nth-of-type(4)', style: null, blocks: ['columns-about'], defaultContent: [] },
    { id: 'hp-cta', name: 'CTA band', selector: 'main div > div.bg-background.py-16', style: 'grey', blocks: [], defaultContent: ['main div > div.bg-background.py-16'] },
    { id: 'hp-clients', name: 'Client logos', selector: 'main div > div.pb-4.pl-4:nth-of-type(6)', style: null, blocks: ['cards-clients'], defaultContent: ['main div > div.pb-4.pl-4:nth-of-type(6) h2'] },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, sections after (only when 2+ sections)
const transformers = [
  homepageCleanupTransformer,
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
