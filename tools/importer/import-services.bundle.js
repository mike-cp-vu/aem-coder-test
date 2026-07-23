/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-services.js
  var import_services_exports = {};
  __export(import_services_exports, {
    default: () => import_services_default
  });

  // tools/importer/parsers/cards-service-nav.js
  function parse(element, { document }) {
    const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const grid = element.querySelector(":scope > div, :scope") || element;
    let items = Array.from(grid.querySelectorAll(":scope > div"));
    if (items.length === 0) items = Array.from(element.querySelectorAll(":scope > div"));
    const cells = [];
    items.forEach((item) => {
      const labelEl = item.querySelector('.font-semibold, [class*="font-semibold"]') || item.querySelector("div:last-child");
      const label = labelEl ? labelEl.textContent.trim() : "";
      if (!label) return;
      const icon = document.createElement("img");
      icon.setAttribute("src", `https://LOCAL.ICONS/icons/service-${slugify(label)}.svg`);
      icon.setAttribute("alt", label);
      const p = document.createElement("p");
      p.textContent = label;
      cells.push([icon, p]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-service-nav", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-service-detail.js
  var CTA_HREFS = {
    "view our portfolio": "/portfolio/",
    "contact us": "/contact/"
  };
  function parse2(element, { document }) {
    const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const committedLogo = (img) => {
      const alt = (img.getAttribute("alt") || "").trim();
      const slug = slugify(alt.replace(/\blogo\b/i, ""));
      const out = document.createElement("img");
      out.setAttribute("src", `https://LOCAL.ICONS/icons/logo-${slug}.svg`);
      out.setAttribute("alt", alt);
      return out;
    };
    const heading = element.querySelector("h2, h1, h3");
    const title = heading ? heading.textContent.trim() : "";
    if (!title) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const icon = document.createElement("img");
    icon.setAttribute("src", `https://LOCAL.ICONS/icons/service-${slugify(title)}.svg`);
    icon.setAttribute("alt", `${title} icon`);
    const contentCell = [];
    const h = document.createElement("h2");
    h.textContent = title;
    contentCell.push(h);
    const productLogos = element.querySelector('[data-testid="product-logos-container"]');
    if (productLogos) {
      const logos = Array.from(productLogos.querySelectorAll("img"));
      if (logos.length) {
        const strip = document.createElement("p");
        logos.forEach((logo) => strip.appendChild(committedLogo(logo)));
        contentCell.push(strip);
      }
    }
    const paragraphs = Array.from(element.querySelectorAll("p")).filter(
      (p) => !p.closest('[data-testid="product-logos-container"]') && !p.closest('[data-testid="client-logos-container"]')
    );
    paragraphs.forEach((p) => contentCell.push(p));
    const clientLogos = element.querySelector('[data-testid="client-logos-container"]');
    if (clientLogos) {
      const logos = Array.from(clientLogos.querySelectorAll("img"));
      if (logos.length) {
        const strip = document.createElement("p");
        logos.forEach((logo) => strip.appendChild(committedLogo(logo)));
        contentCell.push(strip);
      }
    }
    const ctaEls = Array.from(element.querySelectorAll("a[href], button"));
    ctaEls.forEach((cta) => {
      const label = cta.textContent.trim();
      if (!label) return;
      const key = label.toLowerCase();
      const href = cta.getAttribute && cta.getAttribute("href") ? cta.getAttribute("href") : CTA_HREFS[key];
      if (!href) return;
      const link = document.createElement("a");
      link.setAttribute("href", href);
      link.textContent = label;
      contentCell.push(link);
    });
    const cells = [[icon, contentCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-service-detail", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/services-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      const cookieBtn = element.querySelector("#rcc-confirm-button");
      if (cookieBtn) {
        const banner = cookieBtn.closest('div[class*="fixed"][class*="bottom-0"]') || cookieBtn.closest('div[class*="z-50"]');
        if (banner) banner.remove();
        else cookieBtn.remove();
      }
    }
    if (hookName === TransformHook.afterTransform) {
      element.querySelectorAll('div[class*="sticky"][class*="z-[100]"]').forEach((el) => el.remove());
      WebImporter.DOMUtils.remove(element, [
        "footer",
        "#gatsby-announcer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "script",
        "style",
        "noscript",
        "link",
        "source",
        "iframe"
      ]);
      element.querySelectorAll('img[src*="LOCAL.ICONS"]').forEach((img) => {
        const src = img.getAttribute("src") || "";
        const idx = src.indexOf("/icons/");
        if (idx > 0) img.setAttribute("src", src.slice(idx));
      });
    }
  }

  // tools/importer/transformers/homepage-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const template = payload && payload.template;
      const sections = template && Array.isArray(template.sections) ? template.sections : [];
      if (sections.length < 2) return;
      const doc = element.ownerDocument;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const sectionEl = section.selector ? element.querySelector(section.selector) : null;
        if (!sectionEl) continue;
        if (section.style) {
          const metadataBlock = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(metadataBlock);
        }
        if (i > 0) {
          sectionEl.before(doc.createElement("hr"));
        }
      }
    }
  }

  // tools/importer/import-services.js
  var parsers = {
    "cards-service-nav": parse,
    "cards-service-detail": parse2
  };
  var PAGE_TEMPLATE = {
    name: "services",
    description: "Services page: intro heading, service quick-nav pills, 8 repeating media-rich service detail blocks, and a closing team-augmentation CTA",
    urls: [
      "https://www.ensemble.com/services/"
    ],
    blocks: [
      { name: "cards-service-nav", instances: ['div[data-testid="services-list-container"]'] },
      {
        name: "cards-service-detail",
        // Match by stable data-testid (each service item is
        // <div data-testid="<slug>-service-container">). Excludes the CTA, whose
        // testid is "contact-container" (not "*-service-container"). Robust to the
        // nth-child index shifts caused by block replacement + section breaks.
        instances: ['div[data-testid$="-service-container"]']
      }
    ],
    sections: [
      { id: "svc-intro", name: "Intro heading", selector: 'div[data-testid="hero-container"]', style: null, blocks: [], defaultContent: ['div[data-testid="hero-container"]'] },
      { id: "svc-nav", name: "Service quick-nav pills", selector: 'div[data-testid="services-list-container"]', style: null, blocks: ["cards-service-nav"], defaultContent: [] },
      { id: "svc-details", name: "Service detail blocks", selector: 'div[data-testid$="-service-container"]', style: null, blocks: ["cards-service-detail"], defaultContent: [] },
      { id: "svc-cta", name: "Closing team-augmentation CTA", selector: 'div[data-testid="contact-container"]', style: "center", blocks: [], defaultContent: ['div[data-testid="contact-container"]'] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
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
      if (blockDef.name.startsWith("section-")) return;
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_services_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      main.querySelectorAll('img[src*="/icons/"]').forEach((img) => {
        const src = img.getAttribute("src") || "";
        const idx = src.indexOf("/icons/");
        if (idx > 0) img.setAttribute("src", src.slice(idx));
      });
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_services_exports);
})();