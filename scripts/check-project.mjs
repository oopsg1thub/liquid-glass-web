import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = path.join(root, "skills", "liquid-glass-web");
const referencesRoot = path.join(skillRoot, "references");
const expected = {
  "assets/glass.css": "98e07bd1b012bb0b020e50fb423c0e2d65190a9b6263f8e851ccbfafd0a7bdb4",
  "assets/refraction-snippet.html": "7c33def72b231ecb1d009fdf4ef937fa7d637abf0a6e72dcf284260ee46c0351",
};
const exampleNames = [
  "example-quick-start.html",
  "example-components.html",
  "example-music-player.html",
  "example-resume.html",
];
const errors = [];

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const fail = (message) => errors.push(message);

async function required(relativePath) {
  return readFile(path.join(root, relativePath), "utf8").catch(() => {
    fail(`Missing ${relativePath}`);
    return "";
  });
}

async function requiredPath(relativePath) {
  await access(path.join(root, relativePath)).catch(() => fail(`Missing ${relativePath}`));
}

const css = await required("skills/liquid-glass-web/assets/glass.css");
const snippet = await required("skills/liquid-glass-web/assets/refraction-snippet.html");

for (const [relativePath, hash] of Object.entries(expected)) {
  const value = relativePath.endsWith("glass.css") ? css : snippet;
  if (value && sha256(value) !== hash) fail(`${relativePath} does not match its pinned SHA-256.`);
}

for (const relativePath of [
  "README.md",
  "README.zh-CN.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "skills/liquid-glass-web/SKILL.md",
  "skills/liquid-glass-web/agents/openai.yaml",
  "skills/liquid-glass-web/references/components.md",
]) {
  await required(relativePath);
}
await requiredPath("docs/preview.png");

for (const documentPath of ["README.md", "README.zh-CN.md"]) {
  const markdown = await required(documentPath);
  for (const match of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].trim().split(/\s+/)[0];
    if (/^(?:https?:|mailto:|#)/.test(target)) continue;
    const fileTarget = decodeURIComponent(target.split("#")[0]);
    await access(path.resolve(root, path.dirname(documentPath), fileTarget)).catch(() => {
      fail(`${documentPath} has a broken local link: ${target}`);
    });
  }
}

const packageJson = JSON.parse(await required("package.json"));
if (packageJson.private !== true) fail("package.json must remain private:true.");
if (packageJson.dependencies && Object.keys(packageJson.dependencies).length) {
  fail("The standalone skill repository must not have runtime dependencies.");
}
if (packageJson.publishConfig) fail("package.json must not define npm publishConfig.");

const openaiYaml = await required("skills/liquid-glass-web/agents/openai.yaml");
for (const line of [
  'display_name: "Liquid Glass Web"',
  'short_description: "Build faithful, accessible Liquid Glass interfaces"',
  'default_prompt: "Use $liquid-glass-web to apply the canonical Liquid Glass material to this web interface."',
]) {
  if (!openaiYaml.includes(line)) fail(`agents/openai.yaml is missing: ${line}`);
}

const skill = await required("skills/liquid-glass-web/SKILL.md");
if (!/^---\nname: liquid-glass-web\ndescription: .+\n---/s.test(skill)) {
  fail("SKILL.md must have valid name and description frontmatter.");
}

for (const name of exampleNames) {
  const html = await required(`skills/liquid-glass-web/references/${name}`);
  if (!html.includes(css)) fail(`${name} does not embed canonical glass.css verbatim.`);
  if (!html.includes(snippet)) fail(`${name} does not embed the canonical snippet verbatim.`);

  const markup = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  const ids = [...markup.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicates.length) fail(`${name} has duplicate IDs: ${duplicates.join(", ")}`);

  const paneCount = [...markup.matchAll(/\bclass=["']([^"']*)["']/g)]
    .filter((match) => match[1].split(/\s+/).includes("lg")).length;
  if (paneCount > 5) fail(`${name} has ${paneCount} glass panes; maximum is 5.`);
  if (paneCount === 0) fail(`${name} has no glass pane.`);

  const remoteResources = [...markup.matchAll(/\b(?:src|href)=["'](https?:)?\/\/[^"']+/gi)];
  if (remoteResources.length) fail(`${name} depends on a remote resource.`);

  for (const [index, match] of [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].entries()) {
    try {
      new Script(match[1], { filename: `${name}:inline-script-${index + 1}` });
    } catch (error) {
      fail(`${name} has invalid JavaScript: ${error.message}`);
    }
  }

  if (name === "example-music-player.html") {
    const snippetEnd = html.indexOf(snippet) + snippet.length;
    const demoStart = html.indexOf("Demo player logic intentionally lives after the canonical snippet.");
    if (snippetEnd < snippet.length || demoStart < snippetEnd) {
      fail("Music Player demo logic must remain in a separate script after the canonical snippet.");
    }
  }
}

const siteTemplate = await required("site/index.template.html");
const siteMarkup = siteTemplate
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
  .replace(/<!--[\s\S]*?-->/g, "");
const liveSitePanes = [...siteMarkup.matchAll(/\bclass=["']([^"']*)["']/g)]
  .filter((match) => match[1].split(/\s+/).includes("lg")).length;
if (liveSitePanes !== 1) fail(`GitHub Pages landing must render exactly one live glass pane; found ${liveSitePanes}.`);

const repoEntries = await readdir(root);
if (repoEntries.includes(".codex-plugin")) fail("Standalone skill repository must not contain .codex-plugin.");

const allTextPaths = [
  "README.md",
  "README.zh-CN.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "skills/liquid-glass-web/SKILL.md",
  "site/index.template.html",
];
for (const relativePath of allTextPaths) {
  const value = await required(relativePath);
  const releaseValue = relativePath === "site/index.template.html"
    ? value.replace("{{REFRACTION_SNIPPET}}", "")
    : value;
  if (/YOUR_GITHUB_USERNAME|COPYRIGHT_HOLDER|\{\{[^}]+\}\}/.test(releaseValue)) {
    fail(`${relativePath} still contains a release placeholder.`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Project invariants passed.");
}
