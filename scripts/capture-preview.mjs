import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "docs", "preview.png");
const pageUrl = pathToFileURL(path.join(root, ".site-dist", "index.html")).href;

await mkdir(path.dirname(output), { recursive: true });

const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
  headless: true,
});

try {
  const page = await browser.newPage({
    colorScheme: "light",
    reducedMotion: "reduce",
    viewport: { width: 1440, height: 1080 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(pageUrl, { waitUntil: "load" });
  await page.evaluate(() => { document.documentElement.dataset.theme = "light"; });
  const state = await page.evaluate(() => ({
    refract: document.documentElement.classList.contains("refract"),
  }));
  if (!state.refract) {
    throw new Error(`System Chrome did not enable refraction: ${JSON.stringify(state)}`);
  }
  if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
  await page.screenshot({ path: output, fullPage: false });
  console.log(`Wrote ${path.relative(root, output)} with Chrome refraction enabled.`);
} finally {
  await browser.close();
}
