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

  // tools/importer/import-contact-page.js
  var import_contact_page_exports = {};
  __export(import_contact_page_exports, {
    default: () => import_contact_page_default
  });

  // tools/importer/parsers/form-contact.js
  function parse(element, { document }) {
    const form = element.matches("form") ? element : element.querySelector("form");
    const scope = form || element;
    const cells = [];
    const controls = Array.from(
      scope.querySelectorAll("input, select, textarea")
    );
    controls.forEach((control) => {
      const wrapper = control.closest("div");
      let label = wrapper ? wrapper.querySelector("label") : null;
      if (!label) {
        label = control.previousElementSibling && control.previousElementSibling.tagName === "LABEL" ? control.previousElementSibling : null;
      }
      const tag = control.tagName.toLowerCase();
      let type = tag;
      if (tag === "input") {
        type = control.getAttribute("type") || "text";
      }
      const requiredMarker = label ? label.querySelector(".text-errors, span") : null;
      const isRequired = !!(requiredMarker && requiredMarker.textContent.trim());
      let labelText = "";
      if (label) {
        labelText = Array.from(label.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join("").trim();
        if (!labelText) labelText = label.textContent.replace(/\*/g, "").trim();
      }
      const name = control.getAttribute("name") || control.getAttribute("id") || "";
      let extra = "";
      if (tag === "select") {
        const options = Array.from(control.querySelectorAll("option")).map((opt) => opt.textContent.trim()).filter(Boolean);
        if (options.length) {
          const ul = document.createElement("ul");
          options.forEach((opt) => {
            const li = document.createElement("li");
            li.textContent = opt;
            ul.append(li);
          });
          extra = ul;
        }
      } else if (isRequired) {
        extra = "required";
      }
      cells.push([type, labelText, name, extra]);
    });
    const submit = scope.querySelector('button[type="submit"], button:not([type]), input[type="submit"]');
    if (submit) {
      const submitLabel = submit.textContent.trim() || submit.getAttribute("value") || "Submit";
      cells.push(["submit", submitLabel, "", ""]);
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "form-contact", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-office.js
  function parse2(element, { document }) {
    const grid = element.matches('[class*="grid"]') ? element : element.querySelector('[class*="grid"]');
    const scope = grid || element;
    const cards = Array.from(scope.children).filter((child) => child.querySelector("h2"));
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

  // tools/importer/parsers/cards-team.js
  function parse3(element, { document }) {
    const emailLinks = Array.from(element.querySelectorAll('a[href^="mailto:"]'));
    const cards = [];
    const seen = /* @__PURE__ */ new Set();
    emailLinks.forEach((link) => {
      const textBlock = link.parentElement;
      if (textBlock && !seen.has(textBlock)) {
        seen.add(textBlock);
        cards.push(textBlock);
      }
    });
    const cells = [];
    cards.forEach((card) => {
      const contentCell = [];
      const divs = Array.from(card.querySelectorAll(":scope > div"));
      const nameDiv = divs[0];
      const titleDiv = divs[1];
      if (nameDiv && nameDiv.textContent.trim()) {
        const h = document.createElement("h3");
        h.textContent = nameDiv.textContent.trim();
        contentCell.push(h);
      }
      if (titleDiv && titleDiv.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = titleDiv.textContent.trim();
        contentCell.push(p);
      }
      const email = card.querySelector('a[href^="mailto:"]');
      if (email && email.textContent.trim()) {
        const p = document.createElement("p");
        p.append(email);
        contentCell.push(p);
      }
      if (contentCell.length) cells.push([contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-team", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/ensemble-cleanup.js
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
    }
    if (hookName === TransformHook.beforeTransform) {
      element.querySelectorAll("button").forEach((btn) => {
        const text = btn.textContent.trim();
        const emailMatch = text.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        if (!emailMatch) return;
        const doc = btn.ownerDocument;
        const p = doc.createElement("p");
        const strong = doc.createElement("strong");
        const a = doc.createElement("a");
        a.setAttribute("href", `mailto:${text}`);
        a.textContent = text;
        strong.append(a);
        p.append(strong);
        btn.replaceWith(p);
      });
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
    }
  }

  // tools/importer/transformers/ensemble-sections.js
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

  // tools/importer/import-contact-page.js
  var parsers = {
    "form-contact": parse,
    "cards-office": parse2,
    "cards-team": parse3
  };
  var PAGE_TEMPLATE = {
    name: "contact-page",
    description: "Contact page with intro heading, contact form, office locations grid, leadership contacts, and email CTA",
    urls: [
      "https://www.ensemble.com/contact/"
    ],
    blocks: [
      {
        name: "form-contact",
        instances: ["main form"]
      },
      {
        name: "cards-office",
        instances: ["main > div > div.flex.flex-col.gap-\\[60px\\] > div.pl-4:nth-of-type(3) .grid.grid-cols-1"]
      },
      {
        name: "cards-team",
        instances: ["main .bg-background .grid-cols-2"]
      },
      {
        name: "section-leadership",
        instances: ["main > div > div.flex.flex-col.gap-\\[60px\\] > div.bg-background"],
        section: "light-grey-blue"
      }
    ],
    sections: [
      {
        id: "rc3c1",
        name: "Intro heading",
        selector: "main > div > div.flex.flex-col.gap-\\[60px\\] > div.pt-4.sm\\:pt-8.md\\:pt-10.pl-4",
        style: null,
        blocks: [],
        defaultContent: ["main > div > div.flex.flex-col.gap-\\[60px\\] > div.pt-4.sm\\:pt-8.md\\:pt-10.pl-4 .max-w-2xl"]
      },
      {
        id: "rc3c2",
        name: "Contact form",
        selector: "main > div > div.flex.flex-col.gap-\\[60px\\] > div.pl-4:nth-of-type(2)",
        style: null,
        blocks: ["form-contact"],
        defaultContent: [
          "main > div > div.flex.flex-col.gap-\\[60px\\] > div.pl-4:nth-of-type(2) h2",
          "main > div > div.flex.flex-col.gap-\\[60px\\] > div.pl-4:nth-of-type(2) > div > div > p"
        ]
      },
      {
        id: "rc3c3",
        name: "Office locations grid",
        selector: "main > div > div.flex.flex-col.gap-\\[60px\\] > div.pl-4:nth-of-type(3)",
        style: null,
        blocks: ["cards-office"],
        defaultContent: []
      },
      {
        id: "rc3c4",
        name: "Leadership contacts",
        selector: "main > div > div.flex.flex-col.gap-\\[60px\\] > div.bg-background",
        style: "light-grey-blue",
        blocks: ["cards-team"],
        defaultContent: []
      },
      {
        id: "rc3c5",
        name: "Email CTA",
        selector: "main > div > div.flex.flex-col.gap-\\[60px\\] > div.pb-4.pl-4",
        style: "center",
        blocks: [],
        defaultContent: ["main > div > div.flex.flex-col.gap-\\[60px\\] > div.pb-4.pl-4 .flex.flex-col"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
  var import_contact_page_default = {
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
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
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
  return __toCommonJS(import_contact_page_exports);
})();
