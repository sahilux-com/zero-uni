// Slow 4G phone check for the size grid.
//
// Loads the page in real Chrome with the phone, network and CPU settings from
// "Web Platform Slow 4G Mobile Check Profile.yaml", then checks speed-budget.json:
//   - the budget file has exactly the three keys, none looser than required
//   - all five watched elements are on the page
//   - the size grid's top edge does not move from first paint to fully loaded
//   - every size button, sold-out ones included, is at least the minimum size
//
// Usage: node scripts/check-size-grid.mjs [url]   (default http://localhost:3211/)

import { readFileSync } from "node:fs";
import { launch } from "chrome-launcher";
import puppeteer from "puppeteer-core";

const url = process.argv[2] ?? "http://localhost:3211/";
const budget = JSON.parse(
  readFileSync(new URL("../speed-budget.json", import.meta.url), "utf8"),
);

// Required values from the check profile. A budget may be stricter, never looser.
const REQUIRED = {
  performance_score_min: { value: 90, ok: (v) => v >= 90 && v <= 100 },
  size_grid_shift_px_max: { value: 0, ok: (v) => v === 0 },
  size_button_min_px: { value: 44, ok: (v) => v >= 44 },
};
const WATCHED = [
  "size-grid",
  "size-button",
  "size-button-sold-out",
  "main-photo",
  "price",
];

const failures = [];
const fail = (msg) => failures.push(msg);

// 1. Budget file shape
for (const key of Object.keys(REQUIRED)) {
  if (!(key in budget)) fail(`speed-budget.json is missing "${key}"`);
  else if (!Number.isInteger(budget[key]) || !REQUIRED[key].ok(budget[key]))
    fail(`"${key}" is ${budget[key]}, looser than the required ${REQUIRED[key].value}`);
}
for (const key of Object.keys(budget)) {
  if (!(key in REQUIRED)) fail(`speed-budget.json has an extra key "${key}"`);
}

// 2. Load the page as a slow phone
const chrome = await launch({ chromeFlags: ["--headless=new"] });
const browser = await puppeteer.connect({
  browserURL: `http://localhost:${chrome.port}`,
  defaultViewport: null,
});
let result;
try {
  const page = await browser.newPage();
  await page.setViewport({
    width: 375,
    height: 812,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const cdp = await page.createCDPSession();
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 562.5,
    downloadThroughput: (1474.56 * 1024) / 8,
    uploadThroughput: (675 * 1024) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  // Watch the grid's top edge on every frame, starting before anything is drawn.
  await page.evaluateOnNewDocument(() => {
    const track = { tops: [], cls: 0 };
    window.__gridTrack = track;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) track.cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
    const tick = () => {
      const grid = document.querySelector('[data-testid="size-grid"]');
      if (grid) {
        const top = Math.round((grid.getBoundingClientRect().top + window.scrollY) * 100) / 100;
        if (track.tops[track.tops.length - 1] !== top) track.tops.push(top);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 2000));

  result = await page.evaluate((watched) => {
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 };
    };
    const all = (id) => [...document.querySelectorAll(`[data-testid="${id}"]`)];
    return {
      found: Object.fromEntries(watched.map((id) => [id, all(id).length])),
      tops: window.__gridTrack.tops,
      cls: window.__gridTrack.cls,
      buttons: all("size-button").map(box),
      soldOut: all("size-button-sold-out").map(box),
    };
  }, WATCHED);
} finally {
  await browser.disconnect();
  await chrome.kill();
}

// 3. Compare with the budget
for (const id of WATCHED) {
  if (!result.found[id]) fail(`watched element "${id}" was not found on the page`);
}
const shift = result.tops.length
  ? Math.max(...result.tops) - Math.min(...result.tops)
  : NaN;
if (!(shift <= budget.size_grid_shift_px_max))
  fail(`size grid moved ${shift}px (tops seen: ${result.tops.join(", ")})`);

const boxes = [...result.buttons, ...result.soldOut];
const smallest = Math.min(...boxes.map((b) => Math.min(b.w, b.h)));
if (!(smallest >= budget.size_button_min_px))
  fail(`smallest size button side is ${smallest}px, under ${budget.size_button_min_px}px`);

console.log(`Page: ${url}`);
console.log("Phone: 375 x 812 at 3x, Slow 4G (562.5 ms latency, 1474.56 Kbps down), 4x CPU slowdown");
console.log(`Watched elements found: ${JSON.stringify(result.found)}`);
console.log(`Size grid top edge: ${result.tops.join(" -> ")}px, moved ${shift}px (budget ${budget.size_grid_shift_px_max})`);
console.log(`Layout shift score for the whole page: ${result.cls}`);
console.log(`Size buttons: ${result.buttons.length} in or low stock, ${result.soldOut.length} sold out`);
console.log(`Smallest button side: ${smallest}px (budget ${budget.size_button_min_px})`);

if (failures.length) {
  console.error("\nFAILED");
  for (const f of failures) console.error(` - ${f}`);
  process.exit(1);
}
console.log("\nPASSED");
