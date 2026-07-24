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

  // tools/importer/import-ad-landing.js
  var import_ad_landing_exports = {};
  __export(import_ad_landing_exports, {
    default: () => import_ad_landing_default
  });

  // tools/importer/parsers/hero-ad.js
  function parse(element, { document }) {
    const imageCell = [];
    const style = element.getAttribute("style") || "";
    const bgMatch = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    if (bgMatch && bgMatch[1]) {
      let src = bgMatch[1].trim();
      if (src.startsWith("//")) src = `https:${src}`;
      if (src && !src.startsWith("data:") && !src.startsWith("blob:")) {
        const img = document.createElement("img");
        img.setAttribute("src", src);
        img.setAttribute("alt", (element.querySelector("h1") || {}).textContent || "hero background");
        imageCell.push(img);
      }
    }
    const contentCell = [];
    const h1 = element.querySelector("h1");
    if (h1 && h1.textContent.trim()) {
      const h = document.createElement("h1");
      h.textContent = h1.textContent.trim();
      contentCell.push(h);
    }
    const introP = h1 && h1.parentElement ? h1.parentElement.querySelector("p") : null;
    if (introP && introP.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = introP.textContent.trim();
      contentCell.push(p);
    }
    const formHeading = Array.from(element.querySelectorAll("h2, h3")).find((h) => /request a consultation/i.test(h.textContent));
    const h3 = document.createElement("h3");
    h3.textContent = formHeading ? formHeading.textContent.trim() : "Request a Consultation";
    contentCell.push(h3);
    const labels = Array.from(element.querySelectorAll("input, textarea")).map((f) => (f.getAttribute("placeholder") || f.getAttribute("name") || "").trim()).filter(Boolean);
    if (labels.length) {
      const ul = document.createElement("ul");
      labels.forEach((label) => {
        const li = document.createElement("li");
        li.textContent = label;
        ul.append(li);
      });
      contentCell.push(ul);
    }
    const submitP = document.createElement("p");
    const strong = document.createElement("strong");
    const a = document.createElement("a");
    a.setAttribute("href", "/contact/");
    a.textContent = "Submit Form";
    strong.append(a);
    submitP.append(strong);
    contentCell.push(submitP);
    const cells = [];
    if (imageCell.length) cells.push([imageCell]);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-ad", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-ad-cta.js
  function parse2(element, { document }) {
    const imageCell = [];
    const style = element.getAttribute("style") || "";
    const bgMatch = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    if (bgMatch && bgMatch[1]) {
      let src = bgMatch[1].trim();
      if (src.startsWith("//")) src = `https:${src}`;
      if (src && !src.startsWith("data:") && !src.startsWith("blob:")) {
        const img = document.createElement("img");
        img.setAttribute("src", src);
        img.setAttribute("alt", "background");
        imageCell.push(img);
      }
    }
    const contentCell = [];
    const leaves = Array.from(element.querySelectorAll("*")).filter((el) => el.children.length === 0 && el.textContent.trim());
    const headingText = leaves[0] ? leaves[0].textContent.trim() : "";
    if (headingText) {
      const h = document.createElement("h2");
      h.textContent = headingText;
      contentCell.push(h);
    }
    const paraText = leaves[1] ? leaves[1].textContent.trim() : "";
    if (paraText && paraText !== headingText) {
      const p = document.createElement("p");
      p.textContent = paraText;
      contentCell.push(p);
    }
    const btn = element.querySelector("button, a");
    const ctaLabel = (btn ? btn.textContent.trim() : "") || "Request a Consultation";
    const ctaP = document.createElement("p");
    const strong = document.createElement("strong");
    const a = document.createElement("a");
    a.setAttribute("href", "/contact/");
    a.textContent = ctaLabel;
    strong.append(a);
    ctaP.append(strong);
    contentCell.push(ctaP);
    const cells = [];
    if (imageCell.length) cells.push([imageCell]);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-ad-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-ad.js
  function parse3(element, { document }) {
    const abs = (s) => s && s.startsWith("//") ? `https:${s}` : s;
    const realSrc = (im) => {
      const s = im.getAttribute("src") || "";
      return s && !s.startsWith("data:") && !s.startsWith("blob:");
    };
    const imgs = Array.from(element.querySelectorAll("img"));
    const photo = imgs.find((im) => realSrc(im) && (im.getAttribute("alt") || "").trim()) || imgs.find(realSrc);
    if (!photo) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cleanImg = document.createElement("img");
    cleanImg.setAttribute("src", abs(photo.getAttribute("src") || ""));
    cleanImg.setAttribute("alt", photo.getAttribute("alt") || "");
    const lines = [];
    const seen = /* @__PURE__ */ new Set();
    const pushLine = (text) => {
      const t = (text || "").replace(/\s+/g, " ").trim();
      if (!t || seen.has(t)) return;
      seen.add(t);
      lines.push(t);
    };
    const headingEl = element.querySelector("h1, h2, h3, h4");
    const headingText = headingEl ? headingEl.textContent.trim() : "";
    const walk = (node) => {
      Array.from(node.children).forEach((child) => {
        if (child.tagName === "IMG" || child.querySelector("img") && child.children.length === 1 && !child.textContent.trim()) return;
        if (child.tagName === "BUTTON" || child.tagName === "A") return;
        const hasElementChildren = child.children.length > 0;
        const directText = Array.from(child.childNodes).filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim());
        if (!hasElementChildren) {
          pushLine(child.textContent);
        } else if (directText.length) {
          directText.forEach(pushLine);
          walk(child);
        } else {
          walk(child);
        }
      });
    };
    walk(element);
    const textCell = [];
    lines.forEach((t, idx) => {
      if (headingText && t === headingText) {
        const h = document.createElement("h2");
        h.textContent = t;
        textCell.push(h);
      } else if (!headingText && idx === 0) {
        const h = document.createElement("h2");
        h.textContent = t;
        textCell.push(h);
      } else {
        const p = document.createElement("p");
        p.textContent = t;
        textCell.push(p);
      }
    });
    const btn = element.querySelector("button");
    if (btn && btn.textContent.trim()) {
      const label = btn.textContent.trim();
      const href = /get in touch/i.test(label) ? "mailto:inquiries@ensemble.com" : "/contact/";
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      const a = document.createElement("a");
      a.setAttribute("href", href);
      a.textContent = label;
      strong.append(a);
      p.append(strong);
      textCell.push(p);
    }
    const firstTextEl = headingEl || Array.from(element.querySelectorAll("div, p, span")).find((el) => el.textContent.trim());
    let imageFirst = true;
    if (firstTextEl) {
      const pos = photo.compareDocumentPosition(firstTextEl);
      imageFirst = Boolean(pos & 4);
    }
    const cells = imageFirst ? [[cleanImg, textCell]] : [[textCell, cleanImg]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-ad", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-ad-feature.js
  var SERVICE_ICONS = {
    "First service": "ad-svc-ai",
    "Second service": "ad-svc-strategy",
    "Third service": "ad-svc-streaming",
    "Fourth service": "ad-svc-appweb",
    "Fifth service": "ad-svc-content",
    "Sixth service": ["ad-svc-adobe", "ad-svc-fde"]
  };
  function parse4(element, { document, url, params }) {
    let pageSlug = "";
    try {
      const u = params && params.originalURL || url || "";
      const seg = new URL(u).pathname.replace(/\/+$/, "").split("/").filter(Boolean).pop() || "";
      pageSlug = seg.toLowerCase();
    } catch (e) {
      pageSlug = "";
    }
    const items = Array.from(element.children).filter((c) => c.textContent.trim() || c.querySelector("img"));
    const isEcosystem = items.some((it) => {
      const img = it.querySelector("img");
      return img && (img.getAttribute("alt") || "").trim() === "Row one";
    });
    const occ = {};
    const serviceSlugFor = (item) => {
      const img = item.querySelector("img");
      const alt = img ? (img.getAttribute("alt") || "").trim() : "";
      const map = SERVICE_ICONS[alt];
      if (!map) return null;
      if (Array.isArray(map)) {
        occ[alt] = (occ[alt] || 0) + 1;
        return map[occ[alt] - 1] || map[map.length - 1];
      }
      return map;
    };
    const anyIcon = isEcosystem || items.some((it) => serviceSlugFor(it));
    Object.keys(occ).forEach((k) => delete occ[k]);
    let ecoIndex = 0;
    const cells = [];
    items.forEach((item) => {
      const body = [];
      const titleEl = item.querySelector("h1, h2, h3, h4, h5, h6");
      const title = titleEl ? titleEl.textContent.trim() : "";
      if (title) {
        const h = document.createElement("h3");
        h.textContent = title;
        body.push(h);
      }
      const paras = Array.from(item.querySelectorAll("p, div, span")).filter((el) => el.children.length === 0 && el.textContent.trim()).map((el) => el.textContent.trim()).filter((t) => t && t !== title);
      const seen = /* @__PURE__ */ new Set();
      paras.forEach((t) => {
        if (seen.has(t)) return;
        seen.add(t);
        const p = document.createElement("p");
        p.textContent = t;
        body.push(p);
      });
      if (!body.length) return;
      if (anyIcon) {
        let slug = null;
        if (isEcosystem) {
          ecoIndex += 1;
          slug = pageSlug ? `ad-eco-${pageSlug}-${ecoIndex}` : null;
        } else {
          slug = serviceSlugFor(item);
        }
        const iconCell = [];
        if (slug) {
          const icon = document.createElement("img");
          icon.setAttribute("src", `https://LOCAL.ICONS/icons/${slug}.png`);
          icon.setAttribute("alt", title);
          iconCell.push(icon);
        }
        cells.push([iconCell, body]);
      } else {
        cells.push([body]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-ad-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-ad-points.js
  var POINT_ICONS = {
    "Expertise first photo": "ad-why-partnership",
    "Expertise second photo": "ad-why-products",
    "Expertise third photo": "ad-why-supplychain",
    "Expertise fourth photo": "ad-why-crossplatform"
  };
  function parse5(element, { document }) {
    const items = Array.from(element.children).filter((c) => c.textContent.trim() || c.querySelector("img"));
    const slugFor = (item) => {
      const img = item.querySelector("img");
      const alt = img ? (img.getAttribute("alt") || "").trim() : "";
      return POINT_ICONS[alt] || null;
    };
    const anyIcon = items.some((it) => slugFor(it));
    const cells = [];
    items.forEach((item) => {
      const text = Array.from(item.querySelectorAll("p, div, span")).map((el) => el.children.length === 0 ? el.textContent.trim() : "").find((t) => t) || item.textContent.trim();
      if (!text) return;
      const p = document.createElement("p");
      p.textContent = text;
      if (anyIcon) {
        const slug = slugFor(item);
        const iconCell = [];
        if (slug) {
          const icon = document.createElement("img");
          icon.setAttribute("src", `https://LOCAL.ICONS/icons/${slug}.png`);
          icon.setAttribute("alt", text);
          iconCell.push(icon);
        }
        cells.push([iconCell, [p]]);
      } else {
        cells.push([[p]]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-ad-points", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-ad-process.js
  function parse6(element, { document }) {
    const abs = (s) => s && s.startsWith("//") ? `https:${s}` : s;
    const realSrc = (im) => {
      const s = im.getAttribute("src") || "";
      return s && !s.startsWith("data:") && !s.startsWith("blob:");
    };
    const stepImgs = Array.from(element.querySelectorAll("img")).filter((im) => {
      const alt = (im.getAttribute("alt") || "").toLowerCase();
      if (/arrow/.test(alt)) return false;
      if (/mobile/.test(alt)) return false;
      return realSrc(im);
    });
    const cells = [];
    stepImgs.forEach((im) => {
      const img = document.createElement("img");
      img.setAttribute("src", abs(im.getAttribute("src") || ""));
      img.setAttribute("alt", im.getAttribute("alt") || "");
      cells.push([[img]]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-ad-process", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-cases.js
  function parse7(element, { document }) {
    const abs = (s) => s && s.startsWith("//") ? `https:${s}` : s;
    const realSrc = (im) => {
      const s = im.getAttribute("src") || "";
      return s && !s.startsWith("data:") && !s.startsWith("blob:");
    };
    const headings = Array.from(element.querySelectorAll("h1, h2, h3"));
    const cells = [];
    headings.forEach((headingEl) => {
      let slide = headingEl.parentElement;
      while (slide && slide !== element && !Array.from(slide.querySelectorAll("img")).some((im) => realSrc(im) && /slide/i.test(im.getAttribute("alt") || ""))) {
        slide = slide.parentElement;
      }
      if (!slide || slide === element) slide = headingEl.closest("div") || headingEl.parentElement;
      if (!slide) return;
      const content = [];
      const headline = headingEl.textContent.trim();
      const label = Array.from(slide.querySelectorAll("p, div, span")).map((el) => el.children.length === 0 ? el.textContent.trim() : "").find((t) => /case study/i.test(t));
      if (label) {
        const p = document.createElement("p");
        p.textContent = label;
        content.push(p);
      }
      const h = document.createElement("h2");
      h.textContent = headline;
      content.push(h);
      const desc = Array.from(slide.querySelectorAll("p, div")).filter((el) => el.children.length === 0 && el.textContent.trim() && !el.closest("li")).map((el) => el.textContent.trim()).filter((t) => t !== label && t !== headline && !/case study/i.test(t)).sort((a, b) => b.length - a.length)[0];
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc;
        content.push(p);
      }
      const items = Array.from(slide.querySelectorAll("li")).map((li) => li.textContent.trim()).filter(Boolean);
      if (items.length) {
        const ul = document.createElement("ul");
        items.forEach((t) => {
          const li = document.createElement("li");
          li.textContent = t;
          ul.append(li);
        });
        content.push(ul);
      }
      const slideImg = Array.from(slide.querySelectorAll("img")).find((im) => realSrc(im) && /slide/i.test(im.getAttribute("alt") || "")) || Array.from(slide.querySelectorAll("img")).find(realSrc);
      if (slideImg) {
        const img = document.createElement("img");
        img.setAttribute("src", abs(slideImg.getAttribute("src") || ""));
        img.setAttribute("alt", slideImg.getAttribute("alt") || headline);
        cells.push([[img], content]);
      } else {
        cells.push([content]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-cases", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/ad-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var DEFAULT_CONTENT_ICONS = {
    "First process": "ad-process-1",
    "Second Process": "ad-process-2",
    "Third Process": "ad-process-3",
    "Fourth Process": "ad-process-4",
    "adobe-photo": "ad-client-adobe",
    "paramount-photo": "ad-client-paramount",
    "dreamworks-photo": "ad-client-dreamworks",
    "pgatour-photo": "ad-client-pgatour",
    "natgeo-photo": "ad-client-natgeo",
    "twitch-photo": "ad-client-twitch",
    "wondery-photo": "ad-client-wondery",
    "porsche-photo": "ad-client-porsche",
    "funimation-photo": "ad-client-funimation",
    "discovery-photo": "ad-client-discovery",
    "royalcollege-photo": "ad-client-royalcollege",
    "samsung-photo": "ad-client-samsung",
    "Benefits first photo": "ad-adobe-experience-platform",
    "Benefits second photo": "ad-adobe-experience-manager",
    "Benefits third photo": "ad-adobe-creative-cloud",
    "Benefits fourth photo": "ad-adobe-document-cloud"
  };
  function reconstructButton(btn) {
    const label = btn.textContent.trim();
    if (!label) {
      btn.remove();
      return;
    }
    const doc = btn.ownerDocument;
    let href = "/contact/";
    if (/get in touch/i.test(label)) href = "mailto:inquiries@ensemble.com";
    const p = doc.createElement("p");
    const strong = doc.createElement("strong");
    const a = doc.createElement("a");
    a.setAttribute("href", href);
    a.textContent = label;
    strong.append(a);
    p.append(strong);
    btn.replaceWith(p);
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      const wrapper = element.querySelector(".flex.flex-col.place-self-center") || element;
      const header = wrapper.querySelector(":scope > div.bg-\\[\\#fff\\]:first-child");
      if (header) header.remove();
      element.querySelectorAll("div.bg-\\[\\#4485B6\\]").forEach((el) => el.remove());
      element.querySelectorAll("img").forEach((img) => {
        const alt = (img.getAttribute("alt") || "").trim();
        const slug = DEFAULT_CONTENT_ICONS[alt];
        if (!slug) return;
        const src = img.getAttribute("src") || "";
        if (!src.startsWith("data:") && !src.startsWith("blob:")) return;
        img.setAttribute("src", `https://LOCAL.ICONS/icons/${slug}.png`);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      element.querySelectorAll("button").forEach((btn) => reconstructButton(btn));
      element.querySelectorAll('img[src*="LOCAL.ICONS"]').forEach((img) => {
        const src = img.getAttribute("src") || "";
        const idx = src.indexOf("/icons/");
        if (idx !== -1) img.setAttribute("src", src.slice(idx));
      });
      element.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (src.startsWith("blob:") || src.startsWith("data:")) img.remove();
      });
      const walker = element.ownerDocument.createTreeWalker(
        element,
        4
        /* SHOW_TEXT */
      );
      const strays = [];
      let node = walker.nextNode();
      while (node) {
        if (node.textContent.trim() === ";") strays.push(node);
        node = walker.nextNode();
      }
      strays.forEach((n) => n.remove());
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

  // tools/importer/import-ad-landing.js
  var parsers = {
    "hero-ad": parse,
    "hero-ad-cta": parse2,
    "columns-ad": parse3,
    "cards-ad-feature": parse4,
    "cards-ad-points": parse5,
    "cards-ad-process": parse6,
    "carousel-cases": parse7
  };
  var W = "main .flex.flex-col.place-self-center";
  var PAGE_TEMPLATE = {
    name: "ad-landing",
    description: "Adobe ad landing page: minimal chrome, hero with lead-capture form, alternating image+text info bands, icon feature grids on brand bands, why-choose proof points + Adobe product tiles, a process band, a case-study carousel, and a closing quote CTA. Reused across all 20 ads* pages.",
    urls: ["https://www.ensemble.com/adsGenStudio/"],
    blocks: [
      // Hero with lead-capture form: the top <section> of the content wrapper.
      { name: "hero-ad", instances: [`${W} > section`] },
      // Alternating image + text info bands, anchored by their stable image alts.
      {
        name: "columns-ad",
        instances: [
          `${W} > div.relative:has(img[alt="adobe-partner-image"])`,
          `${W} > div:has(> div img[alt="right-image"])`,
          `${W} > div:has(> div img[alt="left-image"])`,
          `${W} > div:has(> div img[alt="meeting-photo"])`
        ]
      },
      // Icon feature grids on the brand-blue bands: the inner item grids.
      {
        name: "cards-ad-feature",
        instances: [
          `${W} > div.bg-\\[\\#2886BB\\]:has(img[alt="Row one"]) .flex.flex-col.lg\\:flex-row:has(img[alt="Row one"])`,
          `${W} > div.bg-\\[\\#2886BB\\]:has(img[alt="First service"]) div:has(> div img[alt="First service"])`
        ]
      },
      // "Why Choose" proof points: the 4-item icon+text row.
      {
        name: "cards-ad-points",
        instances: [`${W} > div:has(img[alt="Expertise first photo"]) div:has(> div img[alt="Expertise first photo"])`]
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
        name: "cards-ad-process",
        instances: [`${W} > div:has(img[alt="First process"])`]
      },
      // Case-study carousel.
      { name: "carousel-cases", instances: [`${W} > div:has(img[alt="Slide 1"])`] },
      // Closing "Do right by people." quote CTA: the only image-less relative div.
      { name: "hero-ad-cta", instances: [`${W} > div.relative:not(:has(img))`] }
    ],
    // Section boundaries are not modeled: the ad pages are a single flowing column
    // of blocks + default content.
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
  var import_ad_landing_default = {
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
  return __toCommonJS(import_ad_landing_exports);
})();