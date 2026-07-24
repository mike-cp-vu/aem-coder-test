/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroAdParser from './parsers/hero-ad.js';
import heroAdCtaParser from './parsers/hero-ad-cta.js';
import columnsAdParser from './parsers/columns-ad.js';
import cardsAdFeatureParser from './parsers/cards-ad-feature.js';
import cardsAdPointsParser from './parsers/cards-ad-points.js';
import cardsAdProcessParser from './parsers/cards-ad-process.js';
import carouselCasesParser from './parsers/carousel-cases.js';

// TRANSFORMER IMPORTS
// ad-cleanup: removes the minimal landing header/footer chrome, reconstructs
// leftover CTA buttons as links, strips lazy data:/blob: imagery + script/style.
import adCleanupTransformer from './transformers/ad-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'hero-ad': heroAdParser,
  'hero-ad-cta': heroAdCtaParser,
  'columns-ad': columnsAdParser,
  'cards-ad-feature': cardsAdFeatureParser,
  'cards-ad-points': cardsAdPointsParser,
  'cards-ad-process': cardsAdProcessParser,
  'carousel-cases': carouselCasesParser,
};

// Content wrapper shared by every ad landing page.
const W = 'main .flex.flex-col.place-self-center';

const PAGE_TEMPLATE = {
  name: 'ad-landing',
  description: 'Adobe ad landing page: minimal chrome, hero with lead-capture form, alternating image+text info bands, icon feature grids on brand bands, why-choose proof points + Adobe product tiles, a process band, a case-study carousel, and a closing quote CTA. Reused across all 20 ads* pages.',
  urls: ['https://www.ensemble.com/adsGenStudio/'],
  blocks: [
    // Hero with lead-capture form: the top <section> of the content wrapper.
    { name: 'hero-ad', instances: [`${W} > section`] },
    // Alternating image + text info bands, anchored by their stable image alts.
    {
      name: 'columns-ad',
      instances: [
        `${W} > div.relative:has(img[alt="adobe-partner-image"])`,
        `${W} > div:has(> div img[alt="right-image"])`,
        `${W} > div:has(> div img[alt="left-image"])`,
        `${W} > div:has(> div img[alt="meeting-photo"])`,
      ],
    },
    // Icon feature grids on the brand-blue bands: the inner item grids.
    {
      name: 'cards-ad-feature',
      instances: [
        `${W} > div.bg-\\[\\#2886BB\\]:has(img[alt="Row one"]) .flex.flex-col.lg\\:flex-row:has(img[alt="Row one"])`,
        `${W} > div.bg-\\[\\#2886BB\\]:has(img[alt="First service"]) div:has(> div img[alt="First service"])`,
      ],
    },
    // "Why Choose" proof points: the 4-item icon+text row.
    {
      name: 'cards-ad-points',
      instances: [`${W} > div:has(img[alt="Expertise first photo"]) div:has(> div img[alt="Expertise first photo"])`],
    },
    // NOTE: the Adobe product tiles ("Benefits *" photos) were considered for
    // cards-tech-stack, but every tile icon on these pages is an inline
    // data:/blob: image (no fetchable URL) and the tiles carry only short
    // labels. An icon grid with no icons degrades poorly, so the tiles are left
    // as default content (the product labels are preserved as paragraphs).
    // "Our Process:" step flow. Step graphics are inline data: images; the
    // parser leaves the section as default content when no fetchable step
    // imagery exists.
    {
      name: 'cards-ad-process',
      instances: [`${W} > div:has(img[alt="First process"])`],
    },
    // Case-study carousel.
    { name: 'carousel-cases', instances: [`${W} > div:has(img[alt="Slide 1"])`] },
    // Closing "Do right by people." quote CTA: the only image-less relative div.
    { name: 'hero-ad-cta', instances: [`${W} > div.relative:not(:has(img))`] },
  ],
  // Section boundaries are not modeled: the ad pages are a single flowing column
  // of blocks + default content.
  sections: [],
};

// TRANSFORMER REGISTRY
const transformers = [
  adCleanupTransformer,
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

    // 4. afterTransform - final cleanup
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5b. Normalize committed-icon references to root-relative /icons/ paths.
    // adjustImageUrls (step 5) re-absolutizes the transformer's /icons/ad-*.png
    // references to the source origin, so strip everything before /icons/ here
    // to restore the project-served path for the shared ad icons.
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
