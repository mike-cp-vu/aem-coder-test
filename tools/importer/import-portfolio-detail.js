/* eslint-disable */
/* global WebImporter */

import cardsTechStackParser from './parsers/cards-tech-stack.js';
import cardsKeyPointsParser from './parsers/cards-key-points.js';

import portfolioDetailCleanupTransformer from './transformers/portfolio-detail-cleanup.js';

const parsers = {
  'cards-tech-stack': cardsTechStackParser,
  'cards-key-points': cardsKeyPointsParser,
};

const PAGE_TEMPLATE = {
  name: 'portfolio-detail',
  description: 'Portfolio case-study detail: breadcrumb + title + hero + narrative prose + Technologies icon grid + two key-point grids + footer buttons',
  urls: ['https://www.ensemble.com/portfolio/identity-data-management-platform-idmp-ui-development-global/'],
  blocks: [
    // Technologies icon grid: the only <ul> in the article carrying <img>s.
    { name: 'cards-tech-stack', instances: ['main .flex.flex-col.gap-8 ul:has(img)'] },
    // "Initiative Key Considerations" + "Results and Deliverables" text grids:
    // the inner grid container whose item divs carry <h1> headings.
    { name: 'cards-key-points', instances: ['main .flex.flex-col.gap-8 div.grid:has(> div h1)'] },
  ],
  // Single flowing article — no section breaks.
  sections: [],
};

const transformers = [
  portfolioDetailCleanupTransformer,
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
