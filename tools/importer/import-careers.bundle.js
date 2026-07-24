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

  // tools/importer/import-careers.js
  var import_careers_exports = {};
  __export(import_careers_exports, {
    default: () => import_careers_default
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

  // tools/importer/parsers/cards-culture.js
  var SRC_ORIGIN = "https://www.ensemble.com";
  function absolutizeSrc(src) {
    if (!src) return src;
    if (/^https?:\/\//i.test(src)) return src;
    const idx = src.indexOf("/join/");
    if (idx !== -1) return SRC_ORIGIN + src.slice(idx);
    const clean = src.replace(/^(\.\.\/)+/, "");
    return `${SRC_ORIGIN}/${clean.replace(/^\//, "")}`;
  }
  function parse2(element, { document }) {
    let cards = Array.from(element.querySelectorAll('[data-testid="cultureCard"]'));
    if (cards.length === 0) {
      cards = Array.from(element.querySelectorAll("div.flex.gap-4")).filter(
        (c) => c.querySelector("img") && c.querySelector("h2")
      );
    }
    const cells = [];
    cards.forEach((card) => {
      const srcImg = card.querySelector("img");
      let imgCell = "";
      if (srcImg) {
        const img = document.createElement("img");
        img.setAttribute("src", absolutizeSrc(srcImg.getAttribute("src") || ""));
        img.setAttribute("alt", srcImg.getAttribute("alt") || "");
        imgCell = img;
      }
      const contentCell = [];
      const heading = card.querySelector("h1, h2, h3, h4");
      if (heading) {
        const h = document.createElement("h3");
        h.textContent = heading.textContent.trim();
        contentCell.push(h);
      }
      card.querySelectorAll("p").forEach((p) => contentCell.push(p));
      if (contentCell.length === 0) return;
      cells.push([imgCell, contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-culture", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-benefits.js
  var slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  function parse3(element, { document }) {
    let cards = Array.from(element.querySelectorAll('[data-testid="benefitCard"]'));
    if (cards.length === 0) {
      cards = Array.from(element.querySelectorAll("div")).filter(
        (c) => c.querySelector(":scope img") && c.querySelector(":scope h2") && !c.querySelector('[data-testid="benefitCard"]')
      );
    }
    const cells = [];
    cards.forEach((card) => {
      const contentCell = [];
      const heading = card.querySelector("h1, h2, h3, h4");
      if (heading) {
        const h = document.createElement("h3");
        h.textContent = heading.textContent.trim();
        contentCell.push(h);
      }
      card.querySelectorAll("p").forEach((p) => contentCell.push(p));
      if (!heading) return;
      const srcImg = card.querySelector("img");
      const alt = srcImg ? (srcImg.getAttribute("alt") || "").trim() : "";
      const slug = slugify(alt.replace(/\bicon\b/i, ""));
      const icon = document.createElement("img");
      icon.setAttribute("src", `https://LOCAL.ICONS/icons/benefit-${slug}.svg`);
      icon.setAttribute("alt", alt || `${heading.textContent.trim()} icon`);
      cells.push([icon, contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-benefits", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-team-detail.js
  var SRC_ORIGIN2 = "https://www.ensemble.com";
  function absolutizeSrc2(src) {
    if (!src) return src;
    if (/^https?:\/\//i.test(src)) return src;
    const idx = src.indexOf("/join/");
    if (idx !== -1) return SRC_ORIGIN2 + src.slice(idx);
    const clean = src.replace(/^(\.\.\/)+/, "");
    return `${SRC_ORIGIN2}/${clean.replace(/^\//, "")}`;
  }
  function parse4(element, { document }) {
    let cards = Array.from(element.querySelectorAll('[data-testid="team-card-container"]'));
    if (cards.length === 0) {
      cards = Array.from(element.querySelectorAll("div")).filter(
        (c) => c.querySelector(":scope img, :scope > div img") && c.querySelector(":scope ul")
      );
    }
    const cells = [];
    cards.forEach((card) => {
      const srcImg = card.querySelector("img");
      let imgCell = "";
      if (srcImg) {
        const img = document.createElement("img");
        img.setAttribute("src", absolutizeSrc2(srcImg.getAttribute("src") || ""));
        img.setAttribute("alt", srcImg.getAttribute("alt") || "");
        imgCell = img;
      }
      const contentCell = [];
      const titleEl = card.querySelector('[class*="uppercase"], h1, h2, h3, h4');
      const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      if (titleText) {
        const h = document.createElement("h3");
        h.textContent = titleText;
        contentCell.push(h);
      }
      const descEls = Array.from(card.children).filter((c) => {
        if (c === titleEl) return false;
        if (c.querySelector("img") || c.tagName === "UL" || c.tagName === "IMG") return false;
        return c.textContent.trim().length > 0;
      });
      descEls.forEach((d) => {
        const p = document.createElement("p");
        p.textContent = d.textContent.replace(/\s+/g, " ").trim();
        contentCell.push(p);
      });
      const srcList = card.querySelector("ul");
      if (srcList) {
        const ul = document.createElement("ul");
        srcList.querySelectorAll("li").forEach((li) => {
          const label = li.textContent.replace(/\s+/g, " ").trim();
          if (!label) return;
          const item = document.createElement("li");
          item.textContent = label;
          ul.appendChild(item);
        });
        if (ul.children.length) contentCell.push(ul);
      }
      if (!titleText) return;
      cells.push([imgCell, contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-team-detail", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-testimonials.js
  var SRC_ORIGIN3 = "https://www.ensemble.com";
  function absolutizeSrc3(src) {
    if (!src) return src;
    if (/^https?:\/\//i.test(src)) return src;
    const idx = src.indexOf("/join/");
    if (idx !== -1) return SRC_ORIGIN3 + src.slice(idx);
    const clean = src.replace(/^(\.\.\/)+/, "");
    return `${SRC_ORIGIN3}/${clean.replace(/^\//, "")}`;
  }
  function parse5(element, { document }) {
    const container = element.querySelector('[data-testid="testimonials-container"]') || element;
    const srcImg = container.querySelector("img");
    let imgCell = "";
    if (srcImg) {
      const img = document.createElement("img");
      img.setAttribute("src", absolutizeSrc3(srcImg.getAttribute("src") || ""));
      img.setAttribute("alt", srcImg.getAttribute("alt") || "");
      imgCell = img;
    }
    const headingText = "Employee Testimonials";
    let attribution = "";
    const attrCandidates = Array.from(container.querySelectorAll("div")).filter(
      (d) => d.children.length === 0 && /,/.test(d.textContent) && /manager|consult|director|lead|developer/i.test(d.textContent)
    );
    if (attrCandidates.length) attribution = attrCandidates[0].textContent.replace(/\s+/g, " ").trim();
    const quotes = Array.from(container.querySelectorAll('[data-testid="quote-text"]')).map((q) => q.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
    if (quotes.length === 0 && !imgCell) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const leadCell = [];
    const h = document.createElement("h3");
    h.textContent = headingText;
    leadCell.push(h);
    if (attribution) {
      const p = document.createElement("p");
      p.textContent = attribution;
      leadCell.push(p);
    }
    cells.push([imgCell, leadCell]);
    quotes.forEach((quote) => {
      const quoteCell = [];
      const qp = document.createElement("p");
      qp.textContent = quote;
      quoteCell.push(qp);
      if (attribution) {
        const ap = document.createElement("p");
        const em = document.createElement("em");
        em.textContent = attribution;
        ap.appendChild(em);
        quoteCell.push(ap);
      }
      cells.push(["", quoteCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-testimonials", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/careers-cleanup.js
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
        if (!/send us a message/i.test(label)) return;
        const mail = element.querySelector('a[href^="mailto:"]');
        const href = mail ? mail.getAttribute("href") : "mailto:employment@ensemble.com";
        const doc = btn.ownerDocument;
        const p = doc.createElement("p");
        const strong = doc.createElement("strong");
        const a = doc.createElement("a");
        a.setAttribute("href", href);
        a.textContent = label;
        strong.append(a);
        p.append(strong);
        btn.replaceWith(p);
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

  // tools/importer/import-careers.js
  var parsers = {
    "hero-home": parse,
    "cards-culture": parse2,
    "cards-benefits": parse3,
    "cards-team-detail": parse4,
    "carousel-testimonials": parse5
  };
  var PAGE_TEMPLATE = {
    name: "careers",
    description: "Careers page: dark hero, culture grid, benefits grid, team cards, testimonials carousel, apply CTA",
    urls: ["https://www.ensemble.com/careers/"],
    blocks: [
      { name: "hero-home", instances: ["main > div > *:nth-child(2)"] },
      { name: "cards-culture", instances: ['main > div > *:nth-child(3) [data-testid="cultureContainer"]'] },
      { name: "cards-benefits", instances: ['main > div > *:nth-child(4) [data-testid="benefitsContainer"]'] },
      { name: "cards-team-detail", instances: ['main > div > *:nth-child(5) [data-testid="teams-container"]'] },
      { name: "carousel-testimonials", instances: ["main > div > *:nth-child(6)"] }
    ],
    sections: [
      { id: "ca-hero", name: "Hero", selector: "main > div > *:nth-child(2)", style: null, blocks: ["hero-home"], defaultContent: [] },
      { id: "ca-culture", name: "Culture", selector: "main > div > *:nth-child(3)", style: null, blocks: ["cards-culture"], defaultContent: ["main > div > *:nth-child(3) h1"] },
      { id: "ca-benefits", name: "Benefits", selector: "main > div > *:nth-child(4)", style: null, blocks: ["cards-benefits"], defaultContent: ["main > div > *:nth-child(4) h1"] },
      { id: "ca-team", name: "Our Team", selector: "main > div > *:nth-child(5)", style: null, blocks: ["cards-team-detail"], defaultContent: ["main > div > *:nth-child(5) h1"] },
      { id: "ca-testimonials", name: "Testimonials", selector: "main > div > *:nth-child(6)", style: null, blocks: ["carousel-testimonials"], defaultContent: [] },
      { id: "ca-apply", name: "Apply CTA", selector: "main > div > *:nth-child(7)", style: "grey", blocks: [], defaultContent: ["main > div > *:nth-child(7)"] }
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
  var import_careers_default = {
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
  return __toCommonJS(import_careers_exports);
})();