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

  // tools/importer/import-about.js
  var import_about_exports = {};
  __export(import_about_exports, {
    default: () => import_about_default
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

  // tools/importer/parsers/cards-services.js
  function parse2(element, { document }) {
    const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    let items = Array.from(element.querySelectorAll(':scope > div[class*="max-w-"]'));
    if (items.length === 0) {
      items = Array.from(element.querySelectorAll(":scope > div"));
    }
    const cells = [];
    items.forEach((item) => {
      const heading = item.querySelector("h3, h2, h4");
      const subtitle = item.querySelector("span");
      const description = item.querySelector("p");
      if (!heading) return;
      const title = heading.textContent.trim();
      const srcImg = item.querySelector("img");
      const alt = srcImg ? (srcImg.getAttribute("alt") || "").trim() : "";
      const icon = document.createElement("img");
      if (/\bicon\b/i.test(alt)) {
        const valueSlug = slugify(alt.replace(/\bicon\b/i, ""));
        icon.setAttribute("src", `https://LOCAL.ICONS/icons/value-${valueSlug}.png`);
        icon.setAttribute("alt", alt);
      } else {
        icon.setAttribute("src", `https://LOCAL.ICONS/icons/service-${slugify(title)}.svg`);
        icon.setAttribute("alt", title);
      }
      const linkEl = item.querySelector("a[href]");
      const href = linkEl ? linkEl.getAttribute("href") : null;
      const contentCell = [];
      const h = document.createElement("h3");
      if (href) {
        const titleLink = document.createElement("a");
        titleLink.setAttribute("href", href);
        titleLink.textContent = title;
        h.appendChild(titleLink);
      } else {
        h.textContent = title;
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

  // tools/importer/parsers/cards-departments.js
  var IMAGE_FALLBACKS = {
    "software development": "https://LOCAL.IMAGES/images/dept-software-development.webp"
  };
  function parse3(element, { document }) {
    const grid = element.matches('[class*="grid"]') ? element : element.querySelector('[class*="grid"]');
    const scope = grid || element;
    const cards = Array.from(scope.children).filter((child) => child.querySelector("img"));
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector("img");
      const labelWrapper = card.querySelector('[class*="uppercase"]') || card;
      const labelLines = Array.from(labelWrapper.querySelectorAll("h1, h2, h3, h4")).map((h) => h.textContent.trim()).filter(Boolean);
      const labelText = labelLines.length ? labelLines.join(" ") : labelWrapper.textContent.replace(/\s+/g, " ").trim();
      if (!labelText) return;
      if (img) {
        const src = img.getAttribute("src") || "";
        const fallback = IMAGE_FALLBACKS[labelText.toLowerCase()];
        if (fallback && (src.startsWith("blob:") || src.startsWith("data:") || !src)) {
          img.setAttribute("src", fallback);
        }
      }
      const heading = document.createElement("h3");
      heading.textContent = labelText;
      cells.push([img || "", heading]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-departments", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-office.js
  function parse4(element, { document }) {
    const grid = element.matches('[class*="grid"]') ? element : element.querySelector('[class*="grid"]');
    const scope = grid || element;
    const withHeading = Array.from(scope.querySelectorAll("div")).filter((div) => div.querySelector("h2"));
    const cards = withHeading.filter(
      (div) => !withHeading.some((other) => other !== div && div.contains(other))
    );
    const cells = [];
    cards.forEach((card) => {
      const imgCell = [];
      const seen = /* @__PURE__ */ new Set();
      Array.from(card.querySelectorAll("img")).forEach((img) => {
        if (img.closest('[class*="sm:hidden"]')) return;
        const src = img.getAttribute("src");
        if (src && !seen.has(src)) {
          seen.add(src);
          imgCell.push(img);
        }
      });
      const textCell = [];
      const heading = card.querySelector("h2");
      if (heading) textCell.push(heading);
      const telLink = card.querySelector('a[href^="tel:"]');
      if (telLink && telLink.textContent.trim() && telLink.getAttribute("href") !== "tel:null") {
        const p = document.createElement("p");
        p.append(telLink);
        textCell.push(p);
      }
      Array.from(card.querySelectorAll("p")).forEach((p) => {
        if (p.textContent.trim()) textCell.push(p);
      });
      cells.push([imgCell.length ? imgCell : "", textCell.length ? textCell : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-office", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-about.js
  function parse5(element, { document }) {
    const image = element.querySelector("img");
    const textWrapper = element.querySelector('.flex.flex-col, div[class*="w-267px"], div[class*="w-320px"], div[class*="w-400px"]');
    if (!image && !textWrapper) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (textWrapper) {
      const inner = textWrapper.querySelector('div[class*="w-267px"], div[class*="w-320px"], div[class*="w-400px"]') || textWrapper;
      const textDivs = Array.from(inner.children).filter(
        (c) => c.tagName === "DIV" && !c.querySelector("button") && c.textContent.trim().length > 0
      );
      textDivs.forEach((d, idx) => {
        const list = d.querySelector("ul, ol");
        if (list) {
          contentCell.push(list);
        } else if (idx === 0) {
          const lead = document.createElement("h2");
          lead.textContent = d.textContent.trim();
          contentCell.push(lead);
        } else {
          const p = document.createElement("p");
          p.textContent = d.textContent.trim();
          contentCell.push(p);
        }
      });
      const existingLink = [...element.querySelectorAll("a[href]")].find((a) => /learn more about ensemble/i.test(a.textContent));
      const button = [...element.querySelectorAll("button")].find((b) => /learn more about ensemble/i.test(b.textContent)) || [...element.querySelectorAll("button")].find((b) => !/^who we are$/i.test(b.textContent.trim()));
      const label = (existingLink || button)?.textContent.trim();
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

  // tools/importer/parsers/carousel-timeline.js
  var IMAGE_FALLBACKS2 = {
    "2002": "https://LOCAL.IMAGES/images/timeline-2002.webp",
    "2009": "https://LOCAL.IMAGES/images/timeline-2009.webp",
    "2010": "https://LOCAL.IMAGES/images/timeline-2010.webp"
  };
  function parse6(element, { document }) {
    const slides = Array.from(element.querySelectorAll(".slick-slide"));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    slides.forEach((slide) => {
      const img = slide.querySelector("img");
      const yearEl = slide.querySelector('[class*="font-bold"], [class*="font-extrabold"]');
      const descEl = slide.querySelector('[class*="text-sm"]');
      const year = yearEl ? yearEl.textContent.trim() : "";
      const desc = descEl ? descEl.textContent.trim() : "";
      if (!year && !desc) return;
      const key = `${year}|${desc}`;
      if (seen.has(key)) return;
      seen.add(key);
      if (img) {
        const src = img.getAttribute("src") || "";
        const fallback = IMAGE_FALLBACKS2[year];
        if (fallback && (src.startsWith("blob:") || src.startsWith("data:") || !src)) {
          img.setAttribute("src", fallback);
        }
      }
      const contentCell = [];
      if (year) {
        const h = document.createElement("h3");
        h.textContent = year;
        contentCell.push(h);
      }
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc;
        contentCell.push(p);
      }
      cells.push([img || "", contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-timeline", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-clients.js
  function parse7(element, { document }) {
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

  // tools/importer/transformers/about-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      const cookieBtn = element.querySelector("#rcc-confirm-button");
      if (cookieBtn) {
        const banner = cookieBtn.closest('div[class*="fixed"][class*="bottom-0"]') || cookieBtn.closest('div[class*="z-50"]');
        if (banner) banner.remove();
        else cookieBtn.remove();
      }
      const CTA = { "contact us": "/contact/", "join us": "/careers/" };
      element.querySelectorAll("button").forEach((btn) => {
        const label = btn.textContent.trim();
        const href = CTA[label.toLowerCase()];
        if (!href) return;
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
      element.querySelectorAll('div[class*="sticky"][class*="z-[100]"]').forEach((el) => el.remove());
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
      const BADGES = {
        "adobe partner image": "/images/badge-adobe-partner.webp",
        "iso first certification": "/images/badge-iso-9001.webp",
        "iso second certification": "/images/badge-iso-27001.webp"
      };
      element.querySelectorAll("img[alt]").forEach((img) => {
        const key = (img.getAttribute("alt") || "").trim().toLowerCase();
        if (BADGES[key]) img.setAttribute("src", `https://LOCAL.IMAGES${BADGES[key]}`);
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

  // tools/importer/import-about.js
  var parsers = {
    "hero-about": parse,
    "cards-services": parse2,
    "cards-departments": parse3,
    "cards-office": parse4,
    "columns-about": parse5,
    "carousel-timeline": parse6,
    "cards-clients": parse7
  };
  var PAGE_TEMPLATE = {
    name: "about",
    description: "About page: hero, values, statement, team, offices, farm, story carousel, clients, partners, certifications, join CTA",
    urls: ["https://www.ensemble.com/about/"],
    blocks: [
      { name: "hero-about", instances: ["main > div > *:nth-child(2)"] },
      { name: "cards-services", instances: ["main > div > *:nth-child(3) div.flex.flex-col.space-y-10"] },
      { name: "cards-departments", instances: ["main > div > *:nth-child(5) div.grid"] },
      { name: "cards-office", instances: ["main > div > *:nth-child(6)"] },
      { name: "columns-about", instances: ["main > div > *:nth-child(7)"] },
      { name: "carousel-timeline", instances: ["main > div > *:nth-child(8)"] },
      { name: "cards-clients", instances: ["main > div > *:nth-child(9) div.flex.flex-wrap"] }
    ],
    sections: [
      { id: "ab-hero", name: "Hero intro", selector: "main > div > *:nth-child(2)", style: null, blocks: ["hero-about"], defaultContent: [] },
      { id: "ab-values", name: "Company values", selector: "main > div > *:nth-child(3)", style: null, blocks: ["cards-services"], defaultContent: [] },
      { id: "ab-value-statement", name: "Do right by people", selector: "main > div > *:nth-child(4)", style: "grey", blocks: [], defaultContent: ["main > div > *:nth-child(4)"] },
      { id: "ab-team", name: "Our Team", selector: "main > div > *:nth-child(5)", style: null, blocks: ["cards-departments"], defaultContent: ["main > div > *:nth-child(5) h1"] },
      { id: "ab-offices", name: "Our Offices", selector: "main > div > *:nth-child(6)", style: "grey", blocks: ["cards-office"], defaultContent: [] },
      { id: "ab-farm", name: "Our Farm", selector: "main > div > *:nth-child(7)", style: null, blocks: ["columns-about"], defaultContent: [] },
      { id: "ab-story", name: "Our story", selector: "main > div > *:nth-child(8)", style: null, blocks: ["carousel-timeline"], defaultContent: ["main > div > *:nth-child(8) h1"] },
      { id: "ab-clients", name: "Some of our clients", selector: "main > div > *:nth-child(9)", style: null, blocks: ["cards-clients"], defaultContent: ["main > div > *:nth-child(9) h2"] },
      { id: "ab-partners", name: "Partner with the best", selector: "main > div > *:nth-child(10)", style: null, blocks: [], defaultContent: ["main > div > *:nth-child(10)"] },
      { id: "ab-certs", name: "Our Certifications", selector: "main > div > *:nth-child(11)", style: null, blocks: [], defaultContent: ["main > div > *:nth-child(11)"] },
      { id: "ab-join", name: "Join us CTA", selector: "main > div > *:nth-child(12)", style: "center", blocks: [], defaultContent: ["main > div > *:nth-child(12)"] }
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
  var import_about_default = {
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
      main.querySelectorAll('img[src*="/images/"]').forEach((img) => {
        const src = img.getAttribute("src") || "";
        const idx = src.indexOf("/images/");
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
  return __toCommonJS(import_about_exports);
})();