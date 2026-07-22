/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import formContactParser from './parsers/form-contact.js';
import cardsOfficeParser from './parsers/cards-office.js';
import cardsTeamParser from './parsers/cards-team.js';

// TRANSFORMER IMPORTS
import ensembleCleanupTransformer from './transformers/ensemble-cleanup.js';
import ensembleSectionsTransformer from './transformers/ensemble-sections.js';

// PARSER REGISTRY
const parsers = {
  'form-contact': formContactParser,
  'cards-office': cardsOfficeParser,
  'cards-team': cardsTeamParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'contact-page',
  description: 'Contact page with intro heading, contact form, office locations grid, leadership contacts, and email CTA',
  urls: [
    'https://www.ensemble.com/contact/',
  ],
  blocks: [
    {
      name: 'form-contact',
      instances: ['main form'],
    },
    {
      name: 'cards-office',
      instances: ['main > div > div.flex.flex-col.gap-\\[60px\\] > div.pl-4:nth-of-type(3) .grid.grid-cols-1'],
    },
    {
      name: 'cards-team',
      instances: ['main .bg-background .grid-cols-2'],
    },
    {
      name: 'section-leadership',
      instances: ['main > div > div.flex.flex-col.gap-\\[60px\\] > div.bg-background'],
      section: 'light-grey-blue',
    },
  ],
  sections: [
    {
      id: 'rc3c1',
      name: 'Intro heading',
      selector: 'main > div > div.flex.flex-col.gap-\\[60px\\] > div.pt-4.sm\\:pt-8.md\\:pt-10.pl-4',
      style: null,
      blocks: [],
      defaultContent: ['main > div > div.flex.flex-col.gap-\\[60px\\] > div.pt-4.sm\\:pt-8.md\\:pt-10.pl-4 .max-w-2xl'],
    },
    {
      id: 'rc3c2',
      name: 'Contact form',
      selector: 'main > div > div.flex.flex-col.gap-\\[60px\\] > div.pl-4:nth-of-type(2)',
      style: null,
      blocks: ['form-contact'],
      defaultContent: [
        'main > div > div.flex.flex-col.gap-\\[60px\\] > div.pl-4:nth-of-type(2) h2',
        'main > div > div.flex.flex-col.gap-\\[60px\\] > div.pl-4:nth-of-type(2) > div > div > p',
      ],
    },
    {
      id: 'rc3c3',
      name: 'Office locations grid',
      selector: 'main > div > div.flex.flex-col.gap-\\[60px\\] > div.pl-4:nth-of-type(3)',
      style: null,
      blocks: ['cards-office'],
      defaultContent: [],
    },
    {
      id: 'rc3c4',
      name: 'Leadership contacts',
      selector: 'main > div > div.flex.flex-col.gap-\\[60px\\] > div.bg-background',
      style: 'light-grey-blue',
      blocks: ['cards-team'],
      defaultContent: [],
    },
    {
      id: 'rc3c5',
      name: 'Email CTA',
      selector: 'main > div > div.flex.flex-col.gap-\\[60px\\] > div.pb-4.pl-4',
      style: 'center',
      blocks: [],
      defaultContent: ['main > div > div.flex.flex-col.gap-\\[60px\\] > div.pb-4.pl-4 .flex.flex-col'],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup runs first, sections after (only when 2+ sections)
const transformers = [
  ensembleCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [ensembleSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    // Skip section-metadata entries - handled by the sections transformer
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
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
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
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
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
