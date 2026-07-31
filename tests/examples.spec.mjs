import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  ["Pages landing", "/"],
  ["Quick Start", "/examples/example-quick-start.html"],
  ["Component Gallery", "/examples/example-components.html"],
  ["Music Player", "/examples/example-music-player.html"],
  ["Résumé", "/examples/example-resume.html"],
];

function watchErrors(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  return errors;
}

async function blockingAxeViolations(page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  return result.violations
    .filter((violation) => ["serious", "critical"].includes(violation.impact))
    .map(({ id, impact, help, nodes }) => ({
      id,
      impact,
      help,
      nodes: nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
    }));
}

for (const [label, url] of pages) {
  test(`${label}: material, themes, accessibility, and console`, async ({ page, browserName }) => {
    const errors = watchErrors(page);
    const response = await page.goto(url);
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator("html")).toHaveClass(browserName === "chromium" ? /\brefract\b/ : /^(?!.*\brefract\b)/);

    expect(await blockingAxeViolations(page), "initial theme axe violations").toEqual([]);

    const themeToggle = page.locator("#themeToggle");
    await themeToggle.click();
    const firstTheme = await page.locator("html").getAttribute("data-theme");
    expect(["light", "dark"]).toContain(firstTheme);
    await page.waitForTimeout(1_000);
    expect(await blockingAxeViolations(page), "alternate theme axe violations").toEqual([]);
    await themeToggle.click();
    const secondTheme = await page.locator("html").getAttribute("data-theme");
    expect(secondTheme).not.toBe(firstTheme);

    await page.waitForTimeout(1_150);
    const material = await page.locator(".lg").first().evaluate((element) => {
      const pane = getComputedStyle(element);
      const frost = getComputedStyle(element, "::before");
      return {
        filter: pane.filter,
        backdrop: frost.backdropFilter || frost.webkitBackdropFilter,
      };
    });
    expect(material.filter).toBe("none");
    expect(material.backdrop).toBeTruthy();
    expect(material.backdrop).not.toBe("none");

    await page.setViewportSize({ width: 320, height: 720 });
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflows).toBeFalsy();
    expect(errors).toEqual([]);
  });
}

test("reduced motion removes movement but keeps frost", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/examples/example-quick-start.html");
  const state = await page.locator(".lg-materialize").first().evaluate((element) => {
    const pane = getComputedStyle(element);
    const frost = getComputedStyle(element, "::before");
    return {
      animation: pane.animationName,
      backdrop: frost.backdropFilter || frost.webkitBackdropFilter,
    };
  });
  expect(state.animation).toBe("none");
  expect(state.backdrop).toBeTruthy();
  expect(state.backdrop).not.toBe("none");
});

test("component dialog works from the keyboard", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/examples/example-components.html");
  const trigger = page.locator("#openDialog");
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.locator("#detailsDialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveJSProperty("open", true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  expect(errors).toEqual([]);
});

test("music controls expose state", async ({ page }) => {
  await page.goto("/examples/example-music-player.html");
  const play = page.locator("#play");
  await play.click();
  await expect(play).toHaveAttribute("aria-label", "Pause");
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await play.click();
  await expect(play).toHaveAttribute("aria-label", "Play");
  await expect(play).toHaveAttribute("aria-pressed", "false");
});

test("contrast and print preferences select solid surfaces", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "One engine is sufficient to exercise these CSS media branches.");

  await page.emulateMedia({ contrast: "more" });
  await page.goto("/examples/example-quick-start.html");
  let backdrop = await page.locator(".lg").first().evaluate((element) => {
    const style = getComputedStyle(element, "::before");
    return style.backdropFilter || style.webkitBackdropFilter;
  });
  expect(backdrop).toBe("none");

  await page.emulateMedia({ contrast: "no-preference", media: "print" });
  await page.reload();
  backdrop = await page.locator(".lg").first().evaluate((element) => {
    const style = getComputedStyle(element, "::before");
    return style.backdropFilter || style.webkitBackdropFilter;
  });
  expect(backdrop).toBe("none");
  await expect(page.locator(".lg-backdrop")).toBeHidden();
});

test("forced colors selects the system surface", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Playwright forced-colors emulation is asserted in Chromium.");
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/examples/example-quick-start.html");
  const backdrop = await page.locator(".lg").first().evaluate((element) => {
    const style = getComputedStyle(element, "::before");
    return style.backdropFilter || style.webkitBackdropFilter;
  });
  expect(backdrop).toBe("none");
  await expect(page.locator(".lg-backdrop")).toBeHidden();
});
