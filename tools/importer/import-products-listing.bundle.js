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

  // tools/importer/import-products-listing.js
  var import_products_listing_exports = {};
  __export(import_products_listing_exports, {
    default: () => import_products_listing_default
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

  // tools/importer/parsers/cards-products.js
  function parse2(element, { document }) {
    const cards = Array.from(element.children);
    const cells = [];
    const realSrc = (im) => {
      const s = im.getAttribute("src") || "";
      return s && !s.startsWith("data:") && !s.startsWith("blob:");
    };
    const abs = (s) => s && s.startsWith("//") ? `https:${s}` : s;
    cards.forEach((card) => {
      const link = card.querySelector('a[href^="/products/"]');
      const allImgs = Array.from(card.querySelectorAll("img"));
      const iconImgs = link ? new Set(Array.from(link.querySelectorAll("img"))) : /* @__PURE__ */ new Set();
      const bannerImgs = allImgs.filter((im) => !iconImgs.has(im));
      const banner = bannerImgs.find((im) => realSrc(im) && (im.getAttribute("alt") || "").trim()) || bannerImgs.slice().reverse().find(realSrc) || bannerImgs[bannerImgs.length - 1];
      if (!banner) return;
      const labels = Array.from(card.querySelectorAll("div")).filter((d) => d.children.length === 0 && d.textContent.trim()).map((d) => d.textContent.trim());
      const category = labels[0] || "";
      const title = labels[1] || "";
      let description = "";
      if (link) {
        const texts = Array.from(link.querySelectorAll("div, p")).filter((d) => d.children.length === 0 && d.textContent.trim()).map((d) => d.textContent.trim()).filter((t) => t !== category && t !== title && !/^read more$/i.test(t));
        description = texts.sort((a, b) => b.length - a.length)[0] || "";
      }
      const icons = link ? Array.from(link.querySelectorAll("img")).map((im) => {
        const clean = document.createElement("img");
        clean.setAttribute("src", abs(im.getAttribute("src") || ""));
        clean.setAttribute("alt", im.getAttribute("alt") || "");
        return clean;
      }) : [];
      const href = link ? link.getAttribute("href") : "";
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
      if (description) {
        const p = document.createElement("p");
        p.textContent = description;
        body.push(p);
      }
      if (icons.length) {
        const iconP = document.createElement("p");
        icons.forEach((ic) => iconP.append(ic));
        body.push(iconP);
      }
      if (href) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", href);
        a.textContent = "Read more";
        p.append(a);
        body.push(p);
      }
      const cleanImg = document.createElement("img");
      cleanImg.setAttribute("src", abs(banner.getAttribute("src") || ""));
      cleanImg.setAttribute("alt", banner.getAttribute("alt") || title);
      cells.push([cleanImg, body]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-products", cells });
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

  // tools/importer/import-products-listing.js
  var parsers = {
    "hero-about": parse,
    "cards-products": parse2
  };
  var PAGE_TEMPLATE = {
    name: "products-listing",
    description: "Products listing: intro hero + grid of 5 product showcase cards + Contact CTA",
    urls: ["https://www.ensemble.com/products/"],
    blocks: [
      { name: "hero-about", instances: ["main > div > *:nth-child(1)"] },
      { name: "cards-products", instances: ["main > div > *:nth-child(2) div.grid"] }
    ],
    sections: [
      { id: "prl-hero", name: "Intro hero", selector: "main > div > *:nth-child(1)", style: null, blocks: ["hero-about"], defaultContent: [] },
      { id: "prl-grid", name: "Product grid", selector: "main > div > *:nth-child(2)", style: null, blocks: ["cards-products"], defaultContent: ["main > div > *:nth-child(2) button"] }
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
  var import_products_listing_default = {
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
  return __toCommonJS(import_products_listing_exports);
})();