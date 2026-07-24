/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroHomeParser from './parsers/hero-home.js';
import cardsCultureParser from './parsers/cards-culture.js';
import cardsBenefitsParser from './parsers/cards-benefits.js';
import cardsTeamDetailParser from './parsers/cards-team-detail.js';
import carouselTestimonialsParser from './parsers/carousel-testimonials.js';

// TRANSFORMER IMPORTS
import careersCleanupTransformer from './transformers/careers-cleanup.js';
import homepageSectionsTransformer from './transformers/homepage-sections.js';

const parsers = {
  'hero-home': heroHomeParser,
  'cards-culture': cardsCultureParser,
  'cards-benefits': cardsBenefitsParser,
  'cards-team-detail': cardsTeamDetailParser,
  'carousel-testimonials': carouselTestimonialsParser,
};

const PAGE_TEMPLATE = {
  name: 'careers',
  description: 'Careers page: dark hero, culture grid, benefits grid, team cards, testimonials carousel, apply CTA',
  urls: ['https://www.ensemble.com/careers/'],
  blocks: [
    { name: 'hero-home', instances: ['main > div > *:nth-child(2)'] },
    { name: 'cards-culture', instances: ['main > div > *:nth-child(3) [data-testid="cultureContainer"]'] },
    { name: 'cards-benefits', instances: ['main > div > *:nth-child(4) [data-testid="benefitsContainer"]'] },
    { name: 'cards-team-detail', instances: ['main > div > *:nth-child(5) [data-testid="teams-container"]'] },
    { name: 'carousel-testimonials', instances: ['main > div > *:nth-child(6)'] },
  ],
  sections: [
    { id: 'ca-hero', name: 'Hero', selector: 'main > div > *:nth-child(2)', style: null, blocks: ['hero-home'], defaultContent: [] },
    { id: 'ca-culture', name: 'Culture', selector: 'main > div > *:nth-child(3)', style: null, blocks: ['cards-culture'], defaultContent: ['main > div > *:nth-child(3) h1'] },
    { id: 'ca-benefits', name: 'Benefits', selector: 'main > div > *:nth-child(4)', style: null, blocks: ['cards-benefits'], defaultContent: ['main > div > *:nth-child(4) h1'] },
    { id: 'ca-team', name: 'Our Team', selector: 'main > div > *:nth-child(5)', style: null, blocks: ['cards-team-detail'], defaultContent: ['main > div > *:nth-child(5) h1'] },
    { id: 'ca-testimonials', name: 'Testimonials', selector: 'main > div > *:nth-child(6)', style: null, blocks: ['carousel-testimonials'], defaultContent: [] },
    { id: 'ca-apply', name: 'Apply CTA', selector: 'main > div > *:nth-child(7)', style: 'grey', blocks: [], defaultContent: ['main > div > *:nth-child(7)'] },
  ],
};

const transformers = [
  careersCleanupTransformer,
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

    main.querySelectorAll('img[src*="/icons/"]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const idx = src.indexOf('/icons/');
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
