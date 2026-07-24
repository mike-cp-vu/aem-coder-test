/* eslint-disable */
/* global WebImporter */

import heroAboutParser from './parsers/hero-about.js';
import cardsPortfolioListingParser from './parsers/cards-portfolio-listing.js';

import portfolioCleanupTransformer from './transformers/portfolio-cleanup.js';
import homepageSectionsTransformer from './transformers/homepage-sections.js';

const parsers = {
  'hero-about': heroAboutParser,
  'cards-portfolio-listing': cardsPortfolioListingParser,
};

const PAGE_TEMPLATE = {
  name: 'portfolio-listing',
  description: 'Portfolio listing: intro hero + grid of 12 project tiles + Contact CTA',
  urls: ['https://www.ensemble.com/portfolio/'],
  blocks: [
    { name: 'hero-about', instances: ['main > div > *:nth-child(1)'] },
    { name: 'cards-portfolio-listing', instances: ['main > div > *:nth-child(2) div.grid'] },
  ],
  sections: [
    { id: 'pl-hero', name: 'Intro hero', selector: 'main > div > *:nth-child(1)', style: null, blocks: ['hero-about'], defaultContent: [] },
    { id: 'pl-grid', name: 'Project grid', selector: 'main > div > *:nth-child(2)', style: null, blocks: ['cards-portfolio-listing'], defaultContent: ['main > div > *:nth-child(2) button'] },
  ],
};

const transformers = [
  portfolioCleanupTransformer,
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
      }
    });
    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
