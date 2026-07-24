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

  // tools/importer/import-product-detail.js
  var import_product_detail_exports = {};
  __export(import_product_detail_exports, {
    default: () => import_product_detail_default
  });

  // tools/importer/parsers/cards-tech-stack.js
  function parse(element, { document }) {
    const items = Array.from(element.querySelectorAll(":scope > li"));
    const cells = [];
    items.forEach((li) => {
      const srcImg = li.querySelector("img");
      if (!srcImg) return;
      let src = srcImg.getAttribute("src") || "";
      if (src.startsWith("//")) src = `https:${src}`;
      if (!src || src.startsWith("data:") || src.startsWith("blob:")) return;
      const label = Array.from(li.querySelectorAll("div, span, p")).map((d) => d.textContent.trim()).find((t) => t) || (srcImg.getAttribute("alt") || "").replace(/\s*icon$/i, "").trim();
      const icon = document.createElement("img");
      icon.setAttribute("src", src);
      icon.setAttribute("alt", srcImg.getAttribute("alt") || label);
      const p = document.createElement("p");
      p.textContent = label;
      cells.push([icon, p]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-tech-stack", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-key-points.js
  function parse2(element, { document }) {
    const items = Array.from(element.children).filter((c) => c.textContent.trim());
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector("h1, h2, h3, h4, h5, h6, strong, b");
      const title = titleEl ? titleEl.textContent.trim() : "";
      const para = Array.from(item.querySelectorAll("p")).map((p) => p.textContent.trim()).find((t) => t) || Array.from(item.querySelectorAll("div")).map((d) => d.children.length === 0 ? d.textContent.trim() : "").filter((t) => t && t !== title)[0] || "";
      if (!title && !para) return;
      const cell = [];
      if (title) {
        const h = document.createElement("h3");
        h.textContent = title;
        cell.push(h);
      }
      if (para) {
        const p = document.createElement("p");
        p.textContent = para;
        cell.push(p);
      }
      cells.push([cell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-key-points", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/portfolio-detail-cleanup.js
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
        const doc = btn.ownerDocument;
        const makeLink = (href, text, strongWrap) => {
          const p = doc.createElement("p");
          const a = doc.createElement("a");
          a.setAttribute("href", href);
          a.textContent = text;
          if (strongWrap) {
            const strong = doc.createElement("strong");
            strong.append(a);
            p.append(strong);
          } else {
            p.append(a);
          }
          btn.replaceWith(p);
        };
        if (/^back to portfolio$/i.test(label)) {
          makeLink("/portfolio/", "Back to portfolio", false);
        } else if (/^back to products$/i.test(label)) {
          makeLink("/products/", "Back to products", false);
        } else if (/^contact us$/i.test(label)) {
          makeLink("/contact/", "Contact us", true);
        } else if (/^download report$/i.test(label)) {
          btn.remove();
        }
      });
    }
    if (hookName === TransformHook.afterTransform) {
      element.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (src.startsWith("blob:") || src.startsWith("data:")) img.remove();
      });
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

  // tools/importer/import-product-detail.js
  var parsers = {
    "cards-tech-stack": parse,
    "cards-key-points": parse2
  };
  var PAGE_TEMPLATE = {
    name: "product-detail",
    description: "Product detail: breadcrumb + title + hero + narrative prose + Services list + Device Support icon grid + Key Features/Transforming key-point grids + footer buttons",
    urls: ["https://www.ensemble.com/products/ensemble-qai/"],
    blocks: [
      // "Comprehensive Device Support" icon grid: the only <ul> carrying <img>s.
      { name: "cards-tech-stack", instances: ["main .flex.flex-col.gap-8 ul:has(img)"] },
      // "Key Features & Capabilities" + "Transforming ..." text grids: inner grid
      // containers whose item divs carry <h1> headings.
      { name: "cards-key-points", instances: ["main .flex.flex-col.gap-8 div.grid:has(> div h1)"] }
    ],
    sections: []
  };
  var transformers = [
    transform
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
  var import_product_detail_default = {
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
  return __toCommonJS(import_product_detail_exports);
})();