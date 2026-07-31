import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = path.join(root, "skills", "liquid-glass-web");
const referencesRoot = path.join(skillRoot, "references");
const templatesRoot = path.join(root, "templates", "examples");
const siteSourceRoot = path.join(root, "site");
const siteDistRoot = path.join(root, ".site-dist");
const checkOnly = process.argv.includes("--check");

const canonical = {
  css: {
    path: path.join(skillRoot, "assets", "glass.css"),
    hash: "98e07bd1b012bb0b020e50fb423c0e2d65190a9b6263f8e851ccbfafd0a7bdb4",
  },
  snippet: {
    path: path.join(skillRoot, "assets", "refraction-snippet.html"),
    hash: "7c33def72b231ecb1d009fdf4ef937fa7d637abf0a6e72dcf284260ee46c0351",
  },
};

const examples = [
  ["quick-start.template.html", "example-quick-start.html"],
  ["components.template.html", "example-components.html"],
  ["music-player.template.html", "example-music-player.html"],
  ["resume.template.html", "example-resume.html"],
];

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

async function readCanonical(key) {
  const item = canonical[key];
  const value = await readFile(item.path, "utf8");
  const actual = sha256(value);
  if (actual !== item.hash) {
    throw new Error(`${path.relative(root, item.path)} hash changed: ${actual}`);
  }
  return value;
}

function render(template, css, snippet) {
  const cssMarkerCount = template.split("{{GLASS_CSS}}").length - 1;
  const snippetMarkerCount = template.split("{{REFRACTION_SNIPPET}}").length - 1;
  if (cssMarkerCount !== 1 || snippetMarkerCount !== 1) {
    throw new Error("Each example template must contain exactly one canonical CSS marker and one snippet marker.");
  }
  return template
    .replace("{{GLASS_CSS}}", css)
    .replace("{{REFRACTION_SNIPPET}}", snippet);
}

async function buildExamples(css, snippet) {
  await mkdir(referencesRoot, { recursive: true });
  const rendered = new Map();

  for (const [templateName, outputName] of examples) {
    const templatePath = path.join(templatesRoot, templateName);
    const outputPath = path.join(referencesRoot, outputName);
    const template = await readFile(templatePath, "utf8");
    const output = render(template, css, snippet);
    rendered.set(outputName, output);

    if (checkOnly) {
      const tracked = await readFile(outputPath, "utf8").catch(() => "");
      if (tracked !== output) {
        throw new Error(`${path.relative(root, outputPath)} is stale; run npm run build.`);
      }
    } else {
      await writeFile(outputPath, output, "utf8");
    }
  }

  return rendered;
}

async function buildSite(css, snippet, renderedExamples) {
  if (checkOnly) return;

  await rm(siteDistRoot, { recursive: true, force: true });
  await mkdir(path.join(siteDistRoot, "assets"), { recursive: true });
  await mkdir(path.join(siteDistRoot, "examples"), { recursive: true });

  const siteTemplate = await readFile(path.join(siteSourceRoot, "index.template.html"), "utf8");
  const snippetMarkerCount = siteTemplate.split("{{REFRACTION_SNIPPET}}").length - 1;
  if (snippetMarkerCount !== 1) {
    throw new Error("The Pages template must contain exactly one snippet marker.");
  }

  await writeFile(
    path.join(siteDistRoot, "index.html"),
    siteTemplate.replace("{{REFRACTION_SNIPPET}}", snippet),
    "utf8",
  );
  await writeFile(path.join(siteDistRoot, "assets", "glass.css"), css, "utf8");
  await cp(path.join(siteSourceRoot, "site.css"), path.join(siteDistRoot, "assets", "site.css"));

  for (const [name, output] of renderedExamples) {
    await writeFile(path.join(siteDistRoot, "examples", name), output, "utf8");
  }
}

try {
  const [css, snippet] = await Promise.all([readCanonical("css"), readCanonical("snippet")]);
  const renderedExamples = await buildExamples(css, snippet);
  await buildSite(css, snippet, renderedExamples);
  console.log(checkOnly ? "Generated examples are current." : "Built examples and .site-dist.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
