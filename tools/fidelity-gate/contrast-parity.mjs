#!/usr/bin/env node
/**
 * tools/fidelity-gate/contrast-parity.mjs
 *
 * Answers one question precisely: when a Lighthouse/PSI `color-contrast`
 * finding shows up on a migrated page, is the color a real defect, or a
 * faithful (WCAG-failing) reproduction of the live source's own color choice?
 *
 * This project's migration rule is 1:1 visual fidelity to source, not WCAG
 * compliance for its own sake — so an accessibility audit failure is only
 * actionable if OUR contrast ratio differs from SOURCE's. If they match,
 * the fix (if any) belongs upstream on ensemble.com, not in this migration.
 *
 * For each target, computes the WCAG contrast ratio on both the live source
 * page and the migrated page (walking up the DOM for the first non-transparent
 * background, the same way Lighthouse does), and reports MATCH/DRIFT.
 *
 * Usage:
 *   node contrast-parity.mjs --live <url> --proto <url> --targets <file.json>
 *
 * targets file: JSON array of { label, text } or { label, selector }.
 *   { "label": "eyebrow", "text": "Contact" }
 *   { "label": "submit-button", "selector": "button[type=submit]" }
 *
 * Exit codes: 0 all targets matched within tolerance, 2 one or more drifted,
 * 1 error.
 */

import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const TOLERANCE = 0.15; // absolute contrast-ratio tolerance for "match"

function parseArgs(argv) {
  const rest = argv.slice(2);
  const opts = {};
  for (let i = 0; i < rest.length; i += 1) {
    const a = rest[i];
    if (a === '--live') opts.live = rest[i += 1];
    else if (a === '--proto') opts.proto = rest[i += 1];
    else if (a === '--targets') opts.targets = rest[i += 1];
    else if (a === '--dismiss') opts.dismiss = rest[i += 1];
  }
  if (!opts.live || !opts.proto || !opts.targets) {
    process.stderr.write('Usage: node contrast-parity.mjs --live <url> --proto <url> --targets <file.json> [--dismiss <selector>]\n');
    process.exit(1);
  }
  return opts;
}

function luminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(rgb1, rgb2) {
  const l1 = luminance(...rgb1);
  const l2 = luminance(...rgb2);
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgb(s) {
  const m = s.match(/\d+/g).map(Number);
  return [m[0], m[1], m[2]];
}

async function measure(page, target) {
  return page.evaluate((t) => {
    function findByText(text) {
      const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) { if (n.textContent.trim() === text) return n.parentElement; }
      return null;
    }
    function effBg(el) {
      let node = el;
      while (node) {
        const bg = getComputedStyle(node).backgroundColor;
        const m = bg.match(/rgba?\(([^)]+)\)/);
        if (m) {
          const parts = m[1].split(',').map((s) => parseFloat(s));
          if (parts.length < 4 || parts[3] > 0) return bg;
        }
        node = node.parentElement;
      }
      return 'rgb(255, 255, 255)';
    }
    const el = t.text ? findByText(t.text) : document.querySelector(t.selector);
    if (!el) return null;
    return { color: getComputedStyle(el).color, bg: effBg(el) };
  }, target);
}

async function main() {
  const opts = parseArgs(process.argv);
  const targets = JSON.parse(readFileSync(opts.targets, 'utf8'));
  const browser = await chromium.launch();

  const results = [];
  for (const [label, url] of [['live', opts.live], ['proto', opts.proto]]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(url, { waitUntil: 'networkidle' });
    if (opts.dismiss) { try { await page.locator(opts.dismiss).first().click({ timeout: 3000 }); } catch { /* absent */ } }
    for (const t of targets) {
      const m = await measure(page, t);
      results.push({ side: label, target: t.label, ...m });
    }
    await page.close();
  }
  await browser.close();

  let drifted = 0;
  process.stdout.write('target | live ratio | proto ratio | verdict\n');
  for (const t of targets) {
    const live = results.find((r) => r.side === 'live' && r.target === t.label);
    const proto = results.find((r) => r.side === 'proto' && r.target === t.label);
    if (!live?.color || !proto?.color) {
      process.stdout.write(`${t.label} | MISSING on one side (live: ${live ? 'found' : 'not found'}, proto: ${proto ? 'found' : 'not found'})\n`);
      drifted += 1;
      continue;
    }
    const liveRatio = contrast(parseRgb(live.color), parseRgb(live.bg));
    const protoRatio = contrast(parseRgb(proto.color), parseRgb(proto.bg));
    const diff = Math.abs(liveRatio - protoRatio);
    const verdict = diff <= TOLERANCE
      ? 'MATCH (faithful reproduction of source, not a defect)'
      : 'DRIFT (differs from source — investigate)';
    if (diff > TOLERANCE) drifted += 1;
    process.stdout.write(`${t.label} | ${liveRatio.toFixed(2)}:1 | ${protoRatio.toFixed(2)}:1 | ${verdict}\n`);
  }

  process.exit(drifted > 0 ? 2 : 0);
}

main().catch((e) => { process.stderr.write(`contrast-parity error: ${e.message}\n`); process.exit(1); });
