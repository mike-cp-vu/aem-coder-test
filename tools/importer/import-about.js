/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroAboutParser from './parsers/hero-about.js';
import cardsServicesParser from './parsers/cards-services.js';
import cardsDepartmentsParser from './parsers/cards-departments.js';
import cardsOfficeParser from './parsers/cards-office.js';
import columnsAboutParser from './parsers/columns-about.js';
import carouselTimelineParser from './parsers/carousel-timeline.js';
import cardsClientsParser from './parsers/cards-clients.js';

// TRANSFORMER IMPORTS
import aboutCleanupTransformer from './transformers/about-cleanup.js';
import homepageSectionsTransformer from './transformers/homepage-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-about': heroAboutParser,
  'cards-services': cardsServicesParser,
  'cards-departments': cardsDepartmentsParser,
  'cards-office': cardsOfficeParser,
  'columns-about': columnsAboutParser,
  'carousel-timeline': carouselTimelineParser,
  'cards-clients': cardsClientsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (about)
const PAGE_TEMPLATE = {
  name: 'about',
  description: 'About page: hero, values, statement, team, offices, farm, story carousel, clients, partners, certifications, join CTA',
  urls: ['https://www.ensemble.com/about/'],
  blocks: [
    { name: 'hero-about', instances: ['main > div > *:nth-child(2)'] },
    { name: 'cards-services', instances: ['main > div > *:nth-child(3) div.flex.flex-col.space-y-10'] },
    { name: 'cards-departments', instances: ['main > div > *:nth-child(5) div.grid'] },
    { name: 'cards-office', instances: ['main > div > *:nth-child(6)'] },
    { name: 'columns-about', instances: ['main > div > *:nth-child(7)'] },
    { name: 'carousel-timeline', instances: ['main > div > *:nth-child(8)'] },
    { name: 'cards-clients', instances: ['main > div > *:nth-child(9) div.flex.flex-wrap'] },
  ],
  sections: [
    { id: 'ab-hero', name: 'Hero intro', selector: 'main > div > *:nth-child(2)', style: null, blocks: ['hero-about'], defaultContent: [] },
    { id: 'ab-values', name: 'Company values', selector: 'main > div > *:nth-child(3)', style: null, blocks: ['cards-services'], defaultContent: [] },
    { id: 'ab-value-statement', name: 'Do right by people', selector: 'main > div > *:nth-child(4)', style: 'grey', blocks: [], defaultContent: ['main > div > *:nth-child(4)'] },
    { id: 'ab-team', name: 'Our Team', selector: 'main > div > *:nth-child(5)', style: null, blocks: ['cards-departments'], defaultContent: ['main > div > *:nth-child(5) h1'] },
    { id: 'ab-offices', name: 'Our Offices', selector: 'main > div > *:nth-child(6)', style: 'grey', blocks: ['cards-office'], defaultContent: [] },
    { id: 'ab-farm', name: 'Our Farm', selector: 'main > div > *:nth-child(7)', style: null, blocks: ['columns-about'], defaultContent: [] },
    { id: 'ab-story', name: 'Our story', selector: 'main > div > *:nth-child(8)', style: null, blocks: ['carousel-timeline'], defaultContent: ['main > div > *:nth-child(8) h1'] },
    { id: 'ab-clients', name: 'Some of our clients', selector: 'main > div > *:nth-child(9)', style: null, blocks: ['cards-clients'], defaultContent: ['main > div > *:nth-child(9) h2'] },
    { id: 'ab-partners', name: 'Partner with the best', selector: 'main > div > *:nth-child(10)', style: null, blocks: [], defaultContent: ['main > div > *:nth-child(10)'] },
    { id: 'ab-certs', name: 'Our Certifications', selector: 'main > div > *:nth-child(11)', style: null, blocks: [], defaultContent: ['main > div > *:nth-child(11)'] },
    { id: 'ab-join', name: 'Join us CTA', selector: 'main > div > *:nth-child(12)', style: 'center', blocks: [], defaultContent: ['main > div > *:nth-child(12)'] },
  ],
};

const transformers = [
  aboutCleanupTransformer,
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

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
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

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5b. Normalize committed assets emitted via placeholder hosts to
    // root-relative paths (adjustImageUrls re-absolutizes them to the origin).
    main.querySelectorAll('img[src*="/icons/"]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const idx = src.indexOf('/icons/');
      if (idx > 0) img.setAttribute('src', src.slice(idx));
    });
    main.querySelectorAll('img[src*="/images/"]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const idx = src.indexOf('/images/');
      if (idx > 0) img.setAttribute('src', src.slice(idx));
    });

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
