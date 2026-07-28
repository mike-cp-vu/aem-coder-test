/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

  // tools/importer/import-portfolio-listing.js
  var import_portfolio_listing_exports = {};
  __export(import_portfolio_listing_exports, {
    default: () => import_portfolio_listing_default
  });

  // tools/importer/parsers/hero-about.js
  function parse(element, { document }) {
    const cells = [];
    const bgImage = element.querySelector("img");
    if (bgImage) cells.push([bgImage]);
    const contentCell = [];
    const eyebrowEl = element.querySelector('.uppercase, [class*="uppercase"]');
    const eyebrowText = eyebrowEl ? eyebrowEl.textContent.trim() : "";
    if (eyebrowText) {
      const eyebrow = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = eyebrowText;
      eyebrow.appendChild(strong);
      contentCell.push(eyebrow);
    }
    const headlineWrapper = element.querySelector('.font-extrabold, [class*="font-extrabold"]');
    let headlineSource = null;
    if (headlineWrapper) {
      headlineSource = headlineWrapper.querySelector('[class*="lg:block"]') || headlineWrapper.querySelector('[class*="lg:hidden"]') || headlineWrapper;
    }
    if (headlineSource) {
      const lineDivs = Array.from(headlineSource.querySelectorAll(":scope > div"));
      const headlineText = lineDivs.length ? lineDivs.map((d) => d.textContent.trim()).filter(Boolean).join(" ") : headlineSource.textContent.replace(/\s+/g, " ").trim();
      if (headlineText) {
        const h1 = document.createElement("h1");
        h1.textContent = headlineText;
        contentCell.push(h1);
      }
    }
    Array.from(element.querySelectorAll("p")).forEach((p) => {
      if (p.textContent.trim()) contentCell.push(p);
    });
    if (contentCell.length === 0 && cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    if (contentCell.length) cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-about", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-portfolio-listing.js
  function parse2(element, { document }) {
    const tiles = Array.from(element.children);
    const cells = [];
    const isRealSrc = (im) => {
      const s = im.getAttribute("src") || "";
      return s && !s.startsWith("data:") && !s.startsWith("blob:");
    };
    const absSrc = (im) => {
      let s = im.getAttribute("src") || "";
      if (s.startsWith("//")) s = `https:${s}`;
      return s;
    };
    const isTechIcon = (im) => /\bicon\b/i.test(im.getAttribute("alt") || "");
    tiles.forEach((tile) => {
      const linkEl = tile.querySelector("a[href]");
      let href = linkEl ? linkEl.getAttribute("href") || "" : "";
      if (href.length > 1) href = href.replace(/\/+$/, "");
      const imgs = Array.from(tile.querySelectorAll("img"));
      const photoImgs = imgs.filter((im) => isRealSrc(im) && !isTechIcon(im));
      const photo = photoImgs.find((im) => (im.getAttribute("alt") || "").trim()) || photoImgs[photoImgs.length - 1] || imgs.slice().reverse().find(isRealSrc) || imgs[imgs.length - 1];
      if (!photo) return;
      const techIcons = imgs.filter((im) => isRealSrc(im) && isTechIcon(im));
      const lines = Array.from(tile.querySelectorAll("div")).filter((d) => d.children.length === 0 && d.textContent.trim()).map((d) => d.textContent.trim());
      const seen = /* @__PURE__ */ new Set();
      const uniqueLines = lines.filter((t) => {
        if (seen.has(t)) return false;
        seen.add(t);
        return true;
      });
      const category = uniqueLines[0] || "";
      const title = uniqueLines[1] || "";
      const description = uniqueLines.find((t) => t.length > 80) || "";
      const body = [];
      if (category) {
        const cat = document.createElement("p");
        cat.textContent = category;
        body.push(cat);
      }
      if (title) {
        const h = document.createElement("h3");
        h.textContent = title;
        body.push(h);
      }
      if (description && description !== category && description !== title) {
        const p = document.createElement("p");
        p.textContent = description;
        body.push(p);
      }
      if (techIcons.length) {
        const techP = document.createElement("p");
        techIcons.forEach((im) => {
          const icon = document.createElement("img");
          icon.setAttribute("src", absSrc(im));
          icon.setAttribute("alt", im.getAttribute("alt") || "");
          techP.append(icon);
        });
        body.push(techP);
      }
      if (href) {
        const cta = document.createElement("a");
        cta.setAttribute("href", href);
        cta.textContent = "Read more";
        const ctaP = document.createElement("p");
        ctaP.append(cta);
        body.push(ctaP);
      }
      const cleanImg = document.createElement("img");
      cleanImg.setAttribute("src", absSrc(photo));
      cleanImg.setAttribute("alt", photo.getAttribute("alt") || title || "");
      cells.push([cleanImg, body]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-portfolio-listing", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/portfolio-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      const cookieBtn = element.querySelector("#rcc-confirm-button");
      if (cookieBtn) {
        const banner = cookieBtn.closest('div[class*="fixed"][class*="bottom-0"]') || cookieBtn.closest('div[class*="z-50"]');
        if (banner) banner.remove();
        else cookieBtn.remove();
      }
      element.querySelectorAll("button").forEach((btn) => {
        const label = btn.textContent.trim();
        if (/^load more$/i.test(label)) {
          btn.remove();
          return;
        }
        if (/^contact us$/i.test(label)) {
          const doc = btn.ownerDocument;
          const p = doc.createElement("p");
          const strong = doc.createElement("strong");
          const a = doc.createElement("a");
          a.setAttribute("href", "/contact/");
          a.textContent = label;
          strong.append(a);
          p.append(strong);
          btn.replaceWith(p);
        }
      });
    }
    if (hookName === TransformHook.afterTransform) {
      element.querySelectorAll('div[class*="sticky"][class*="z-[100]"], div[class*="top-0"][class*="z-[100]"]').forEach((el) => el.remove());
      WebImporter.DOMUtils.remove(element, ["footer", "#gatsby-announcer"]);
      WebImporter.DOMUtils.remove(element, [
        "script",
        "style",
        "noscript",
        "link",
        "source",
        "iframe"
      ]);
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

  // tools/importer/import-portfolio-listing.js
  var parsers = {
    "hero-about": parse,
    "cards-portfolio-listing": parse2
  };
  var PAGE_TEMPLATE = {
    name: "portfolio-listing",
    description: "Portfolio listing: intro hero + grid of 12 project tiles + Contact CTA",
    urls: ["https://www.ensemble.com/portfolio/"],
    blocks: [
      { name: "hero-about", instances: ["main > div > *:nth-child(1)"] },
      { name: "cards-portfolio-listing", instances: ["main > div > *:nth-child(2) div.grid"] }
    ],
    sections: [
      { id: "pl-hero", name: "Intro hero", selector: "main > div > *:nth-child(1)", style: null, blocks: ["hero-about"], defaultContent: [] },
      { id: "pl-grid", name: "Project grid", selector: "main > div > *:nth-child(2)", style: null, blocks: ["cards-portfolio-listing"], defaultContent: ["main > div > *:nth-child(2) button"] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
  var import_portfolio_listing_default = {
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
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
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
  return __toCommonJS(import_portfolio_listing_exports);
})();
