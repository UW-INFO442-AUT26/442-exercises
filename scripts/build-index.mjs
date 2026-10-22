#!/usr/bin/env node
// Build the exercises home page from exercises.json.
//
//   node scripts/build-index.mjs [--check]
//
// Writes index.html at the repo root. --check exits non-zero when index.html
// is out of date instead of writing, so a stale page can be caught.
//
// No dependencies, no network. Run it after adding or editing an exercise.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "exercises.json");
const outPath = join(root, "index.html");
const checkOnly = process.argv.includes("--check");

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESCAPES[c]);

const die = (msg) => {
  process.stderr.write("build-index: " + msg + "\n");
  process.exit(1);
};

if (!existsSync(manifestPath)) die("exercises.json is missing");
let data;
try {
  data = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (e) {
  die("exercises.json is not valid JSON: " + e.message);
}

const site = data.site || {};
if (!Array.isArray(data.exercises)) die("exercises.json needs an exercises array");

const problems = [];
const KINDS = { quiz: "Quiz", interactive: "Interactive" };

const exercises = data.exercises.map((ex, i) => {
  const where = "exercises[" + i + "]";
  for (const key of ["slug", "title", "goal"]) {
    if (typeof ex[key] !== "string" || !ex[key].trim()) problems.push(where + "." + key + " is required");
  }
  for (const key of ["minutes", "questions", "activities", "number"]) {
    if (!Number.isInteger(ex[key]) || ex[key] < 0) problems.push(where + "." + key + " must be a whole number");
  }
  if (!ex.number) problems.push(where + ".number must be 1 or more");
  if (!KINDS[ex.kind]) problems.push(where + ".kind must be one of " + Object.keys(KINDS).join(", "));
  if (ex.tags !== undefined && !Array.isArray(ex.tags)) problems.push(where + ".tags must be an array");
  if (typeof ex.slug === "string" && !existsSync(join(root, "exercises", ex.slug, "index.html"))) {
    problems.push(where + ": exercises/" + ex.slug + "/index.html does not exist");
  }
  // An interactive problem is a project the student clones, so the manifest
  // has to point at one that is really there.
  if (ex.kind === "interactive") {
    if (typeof ex.practice !== "string" || !ex.practice.trim()) {
      problems.push(where + ".practice is required for an interactive problem");
    } else if (!existsSync(join(root, ex.practice, "package.json"))) {
      problems.push(where + ": " + ex.practice + "/package.json does not exist");
    }
  }
  return ex;
});
if (problems.length) die(problems.join("\n  "));

const seen = new Map();
for (const ex of exercises) {
  if (seen.has(ex.number)) die("two exercises share number " + ex.number + ": " + seen.get(ex.number) + " and " + ex.slug);
  seen.set(ex.number, ex.slug);
}

// Highest number first, so the newest problem sits at the top and the page
// reads as a history.
const shown = [...exercises].sort((a, b) => {
  return b.number - a.number || String(a.title).localeCompare(String(b.title));
});

const card = (ex) => {
  const tags = (ex.tags || []).map((t) => "<span>" + esc(t) + "</span>").join("");
  const meta = [
    "Problem " + ex.number,
    KINDS[ex.kind],
    ex.minutes + " min",
    ex.questions > 0 ? ex.questions + (ex.questions === 1 ? " question" : " questions") : "",
    ex.activities > 0 ? ex.activities + (ex.activities === 1 ? " activity" : " activities") : ""
  ].filter((m) => m).join(" · ");
  return `      <li class="card">
        <a class="card-a" href="exercises/${esc(ex.slug)}/">
          <h2 class="card-t">${esc(ex.title)}</h2>
          <p class="card-g">${esc(ex.goal)}</p>
          <p class="card-m">${meta}</p>
          <p class="card-tags">${tags}</p>
          <p class="card-p">/exercises/${esc(ex.slug)}/</p>
        </a>
      </li>`;
};

const list = shown.length
  ? shown.map(card).join("\n")
  : '      <li class="empty">No exercises yet.</li>';

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.title || "Practice exercises")}</title>
<style>
  :root {
    --uw-purple: #4B2E83;
    --uw-gold-deep: #85754D;
    --bg: #F7F7FB;
    --surface: #FFFFFF;
    --surface-2: #EDEDF4;
    --ink: #16151D;
    --ink-2: #3C3B4A;
    --muted: #6B6A7B;
    --border: #DADAE4;
    --border-strong: #C6C6D4;
    --accent: #6C4AB6;
    --accent-soft: #EDE7FB;
    --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --font-mono: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.375rem;
    --text-2xl: 1.75rem;
    --leading: 1.55;
    --leading-tight: 1.2;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --radius: 10px;
    --radius-sm: 6px;
    --shadow-1: 0 1px 2px rgba(22, 21, 29, 0.06), 0 1px 3px rgba(22, 21, 29, 0.08);
    --shadow-2: 0 6px 16px rgba(22, 21, 29, 0.10);
    --motion: 160ms;
    --ease: cubic-bezier(0.2, 0, 0, 1);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0F0E15;
      --surface: #1A1822;
      --surface-2: #242230;
      --ink: #F2F1F7;
      --ink-2: #C9C7D6;
      --muted: #9A98AC;
      --border: #302E3C;
      --border-strong: #43414F;
      --accent: #9B7BE0;
      --accent-soft: #2A2340;
      --uw-purple: #8A6FC7;
      --uw-gold-deep: #D2C49B;
    }
  }
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--ink);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    line-height: var(--leading);
    -webkit-text-size-adjust: 100%;
  }
  .wrap { max-width: 44rem; margin: 0 auto; padding: var(--space-6) var(--space-4) var(--space-8); }
  h1 { margin: 0; font-size: var(--text-2xl); line-height: var(--leading-tight); }
  .rule {
    width: 3.5rem;
    height: 4px;
    margin: var(--space-3) 0 var(--space-4);
    background: var(--accent);
    border-radius: 999px;
  }
  .lede { margin: 0 0 var(--space-6); color: var(--ink-2); }
  .list { list-style: none; display: grid; gap: var(--space-3); margin: 0; padding: 0; }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-1);
  }
  .card-a {
    display: block;
    padding: var(--space-4);
    color: inherit;
    text-decoration: none;
    border-radius: var(--radius);
  }
  .card-a:hover, .card-a:focus-visible { background: var(--surface-2); }
  .card-a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .card-t { margin: 0; font-size: var(--text-lg); line-height: var(--leading-tight); }
  .card-g { margin: var(--space-2) 0 0; color: var(--ink-2); }
  .card-m { margin: var(--space-3) 0 0; color: var(--muted); font-size: var(--text-sm); }
  .card-tags { margin: var(--space-2) 0 0; color: var(--muted); font-size: var(--text-sm); }
  .card-tags span + span::before { content: " · "; }
  .card-p { margin: var(--space-3) 0 0; color: var(--muted); font-family: var(--font-mono); font-size: var(--text-sm); }
  .empty { padding: var(--space-6); color: var(--muted); text-align: center; }
  footer { margin-top: var(--space-8); color: var(--muted); font-size: var(--text-sm); }
  footer a { color: var(--accent); }
</style>
</head>
<body>
<main class="wrap">
  <header>
    <h1>${esc(site.title || "Practice exercises")}</h1>
    <div class="rule" aria-hidden="true"></div>
    <p class="lede">${esc(site.lede || "Short practice for the ideas we cover in lab. Each one takes about ten minutes and fits on a phone.")}</p>
  </header>
  <ul class="list">
${list}
  </ul>
  <footer>
    <p>Every exercise is one self contained page that works offline once it is open. Direct links keep working: open any card and bookmark what is in the address bar.</p>
  </footer>
</main>
</body>
</html>
`;

if (checkOnly) {
  const current = existsSync(outPath) ? readFileSync(outPath, "utf8") : "";
  if (current !== html) die("index.html is out of date; run node scripts/build-index.mjs");
  process.stdout.write("index.html is up to date, " + shown.length + " exercise(s)\n");
} else {
  writeFileSync(outPath, html);
  process.stdout.write("wrote index.html with " + shown.length + " exercise(s)\n");
}
