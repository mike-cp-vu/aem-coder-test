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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-home.js
  function parse(element, { document }) {
    const bgImage = element.querySelector(
      'img.object-cover, img[class*="object-cover"], img'
    );
    const heading = element.querySelector('h1, h2, [class*="max-w-"] h1');
    if (heading) {
      const lineDivs = heading.querySelectorAll(":scope > div");
      let lines;
      if (lineDivs.length > 0) {
        lines = [...lineDivs].map((d) => d.textContent.trim()).filter(Boolean);
      } else {
        lines = [heading.textContent.trim()];
      }
      if (lines[0] && /^WE\b/i.test(lines[0])) lines[0] = "WE DEVELOP";
      heading.textContent = "";
      lines.forEach((line, i) => {
        if (i > 0) heading.appendChild(document.createElement("br"));
        heading.appendChild(document.createTextNode(line));
      });
    }
    if (!bgImage && !heading) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-home", cells });
    const statsGrid = element.querySelector('div.grid.grid-cols-3, [class*="grid-cols-3"]');
    if (statsGrid) {
      element.replaceWith(block, statsGrid);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/cards-stats.js
  function parse2(element, { document }) {
    let statCells = Array.from(element.querySelectorAll(":scope > div.group, :scope > div > div.group, div.group"));
    if (statCells.length === 0) {
      statCells = Array.from(element.querySelectorAll(":scope > div")).filter(
        (d) => d.textContent.trim().length > 0
      );
    }
    const cells = [];
    statCells.forEach((stat) => {
      const inner = stat.querySelector("div") || stat;
      const parts = Array.from(inner.querySelectorAll(":scope > div"));
      const contentCell = [];
      if (parts.length >= 2) {
        contentCell.push(...parts);
      } else if (stat.textContent.trim().length > 0) {
        contentCell.push(stat);
      }
      if (contentCell.length > 0) {
        cells.push([contentCell]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-stats", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-portfolio.js
  function parse3(element, { document }) {
    const anchors = Array.from(
      element.querySelectorAll('a[href*="/portfolio/"], a[href*="/products/"], a.group[href]')
    );
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    anchors.forEach((anchor) => {
      const href = anchor.getAttribute("href");
      if (!href || seen.has(href)) return;
      const img = anchor.querySelector("img");
      const label = anchor.querySelector("p");
      if (!img || !label) return;
      seen.add(href);
      const link = document.createElement("a");
      link.setAttribute("href", href);
      link.textContent = label.textContent.trim();
      cells.push([img, link]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-portfolio", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-services.js
  function parse4(element, { document }) {
    let items = Array.from(element.querySelectorAll(':scope > div[class*="max-w-"]'));
    if (items.length === 0) {
      items = Array.from(element.querySelectorAll(":scope > div"));
    }
    const cells = [];
    const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    items.forEach((item) => {
      const heading = item.querySelector("h3, h2, h4");
      const subtitle = item.querySelector("span");
      const description = item.querySelector("p");
      if (!heading) return;
      const title = heading.textContent.trim();
      const icon = document.createElement("img");
      icon.setAttribute("src", `https://LOCAL.ICONS/icons/service-${slugify(title)}.svg`);
      icon.setAttribute("alt", title);
      const linkEl = item.querySelector("a[href]");
      const href = linkEl ? linkEl.getAttribute("href") : null;
      const contentCell = [];
      const h = document.createElement("h3");
      if (href) {
        const titleLink = document.createElement("a");
        titleLink.setAttribute("href", href);
        titleLink.textContent = heading.textContent.trim();
        h.appendChild(titleLink);
      } else {
        h.textContent = heading.textContent.trim();
      }
      contentCell.push(h);
      if (subtitle) contentCell.push(subtitle);
      if (description) contentCell.push(description);
      cells.push([icon || "", contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-services", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-about.js
  function parse5(element, { document }) {
    var _a;
    const image = element.querySelector("img");
    const textWrapper = element.querySelector('.flex.flex-col, div[class*="w-267px"], div[class*="w-320px"]');
    if (!image && !textWrapper) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (textWrapper) {
      const inner = textWrapper.querySelector('div[class*="w-267px"], div[class*="w-320px"]') || textWrapper;
      const textDivs = Array.from(inner.children).filter(
        (c) => c.tagName === "DIV" && !c.querySelector("button") && c.textContent.trim().length > 0
      );
      if (textDivs.length > 0) {
        const lead = document.createElement("h2");
        lead.textContent = textDivs[0].textContent.trim();
        contentCell.push(lead);
        textDivs.slice(1).forEach((d) => {
          const p = document.createElement("p");
          p.textContent = d.textContent.trim();
          contentCell.push(p);
        });
      }
      const existingLink = [...element.querySelectorAll("a[href]")].find((a) => /learn more about ensemble/i.test(a.textContent));
      const button = [...element.querySelectorAll("button")].find((b) => /learn more about ensemble/i.test(b.textContent)) || [...element.querySelectorAll("button")].find((b) => !/^who we are$/i.test(b.textContent.trim()));
      const label = (_a = existingLink || button) == null ? void 0 : _a.textContent.trim();
      if (label) {
        const link = document.createElement("a");
        link.setAttribute("href", "/about/");
        link.textContent = label;
        contentCell.push(link);
      }
    }
    const cells = [[image || "", contentCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-about", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-clients.js
  function parse6(element, { document }) {
    const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const logos = Array.from(element.querySelectorAll("img"));
    if (logos.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    logos.forEach((logo) => {
      const alt = (logo.getAttribute("alt") || "").trim();
      const icon = document.createElement("img");
      icon.setAttribute("src", `https://LOCAL.ICONS/icons/client-${slugify(alt)}.svg`);
      icon.setAttribute("alt", alt);
      cells.push([icon]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-clients", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/homepage-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      const cookieBtn = element.querySelector("#rcc-confirm-button");
      if (cookieBtn) {
        const banner = cookieBtn.closest('div[class*="fixed"][class*="bottom-0"]') || cookieBtn.closest('div[class*="z-50"]');
        if (banner) {
          banner.remove();
        } else {
          cookieBtn.remove();
        }
      }
      const CTA_MAP = [
        { re: /^view our portfolio$/i, href: "/portfolio/", variant: "em" },
        { re: /^learn more about what we do$/i, href: "/services/", variant: "em" },
        { re: /^learn more about ensemble$/i, href: "/about/", variant: "em" },
        { re: /^contact us$/i, href: "/contact/", variant: "strong" }
      ];
      element.querySelectorAll("button").forEach((btn) => {
        const label = btn.textContent.trim();
        if (/^learn more$/i.test(label)) {
          btn.remove();
          return;
        }
        const match = CTA_MAP.find((c) => c.re.test(label));
        if (!match) return;
        const doc = btn.ownerDocument;
        const p = doc.createElement("p");
        const wrap = doc.createElement(match.variant);
        const a = doc.createElement("a");
        a.setAttribute("href", match.href);
        a.textContent = label;
        wrap.append(a);
        p.append(wrap);
        btn.replaceWith(p);
      });
      element.querySelectorAll('.slick-slider, div[class*="sm:hidden"]').forEach((el) => {
        if (!el.isConnected) return;
        const isSlick = el.classList.contains("slick-slider") || el.querySelector(".slick-track");
        const hasImg = !!el.querySelector("img");
        const linkCount = el.querySelectorAll("a").length;
        if (isSlick || hasImg || linkCount >= 3) {
          el.remove();
        }
      });
    }
    if (hookName === TransformHook.afterTransform) {
      element.querySelectorAll('div[class*="z-[100]"][class*="fixed"]').forEach((el) => el.remove());
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
        if (idx !== -1) img.setAttribute("src", src.slice(idx));
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

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-home": parse,
    "cards-stats": parse2,
    "cards-portfolio": parse3,
    "cards-services": parse4,
    "columns-about": parse5,
    "cards-clients": parse6
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Homepage with hero + stats banner, portfolio project grid, services grid, about section, CTA band, and client logos",
    urls: [
      "https://www.ensemble.com/"
    ],
    blocks: [
      { name: "hero-home", instances: ["main div > div.relative.pt-36 > div.relative.w-full"] },
      { name: "cards-stats", instances: ["main div > div.relative.pt-36 div.grid.grid-cols-3"] },
      { name: "cards-portfolio", instances: ["main div > div.pt-4.pb-4 > div.container.mx-auto > div.relative > div.hidden.grid-cols-2"] },
      { name: "cards-services", instances: ["main div > div.pt-4.pb-4 > div.container.mx-auto > div > div.grid.hidden"] },
      { name: "columns-about", instances: ["main div > div.pb-4.pl-4:nth-of-type(4) div.items-stretch.grid-cols-2"] },
      { name: "cards-clients", instances: ["main div > div.pb-4.pl-4:nth-of-type(6) div.flex.justify-center"] },
      { name: "section-cta", instances: ["main div > div.bg-background.py-16"], section: "grey" }
    ],
    sections: [
      { id: "hp-hero", name: "Hero + stats banner", selector: "main div > div.relative.pt-36", style: null, blocks: ["hero-home", "cards-stats"], defaultContent: [] },
      { id: "hp-portfolio", name: "Portfolio project grid", selector: "main div > div.pt-4.pb-4.pl-4:nth-of-type(2)", style: null, blocks: ["cards-portfolio"], defaultContent: ["main div > div.pt-4.pb-4.pl-4:nth-of-type(2) button"] },
      { id: "hp-services", name: "Services grid", selector: "main div > div.pt-4.pb-4.pl-4:nth-of-type(3)", style: null, blocks: ["cards-services"], defaultContent: ["main div > div.pt-4.pb-4.pl-4:nth-of-type(3) h2"] },
      { id: "hp-about", name: "About section", selector: "main div > div.pb-4.pl-4:nth-of-type(4)", style: null, blocks: ["columns-about"], defaultContent: [] },
      { id: "hp-cta", name: "CTA band", selector: "main div > div.bg-background.py-16", style: "grey", blocks: [], defaultContent: ["main div > div.bg-background.py-16"] },
      { id: "hp-clients", name: "Client logos", selector: "main div > div.pb-4.pl-4:nth-of-type(6)", style: null, blocks: ["cards-clients"], defaultContent: ["main div > div.pb-4.pl-4:nth-of-type(6) h2"] }
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
  var import_homepage_default = {
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
      main.querySelectorAll('img[src*="/icons/service-"], img[src*="/icons/client-"]').forEach((img) => {
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
  return __toCommonJS(import_homepage_exports);
})();
