import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const dist = path.join(root, "dist");
const base = "/chi-sourcey-reference/";
const origin = "https://maheerid.github.io";
const sha = "167e1e3bd039d060696b99c8da4e876ae04f42c1";
const snapshot = JSON.parse(fs.readFileSync("godoc.json", "utf8"));
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const decode = s => s.replace(/&#x([a-f\d]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&(?:lt|gt|amp|quot|apos|nbsp);/g, s => ({ "&lt;": "<", "&gt;": ">", "&amp;": "&", "&quot;": '"', "&apos;": "'", "&nbsp;": " " })[s]);
const normalize = s => decode(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
const htmlFiles = walk(dist).filter(f => f.endsWith(".html"));
const html = new Map(htmlFiles.map(f => [f, fs.readFileSync(f, "utf8")]));
const ids = new Map([...html].map(([f, s]) => [f, new Set([...s.matchAll(/\bid="([^"]+)"/g)].map(m => decode(m[1])))]));
let localLinks = 0, sourceLinks = 0;
function validateLinks() { for (const [file, text] of html) {
  for (const match of text.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const link = decode(match[1]);
    if (/^(?:mailto:|data:|javascript:)/.test(link)) continue;
    const url = new URL(link, `${origin}${base}${path.relative(dist, file).replaceAll(path.sep, "/")}`);
    if (url.origin === origin) {
      check(url.pathname.startsWith(base), `${file}: link escapes base path: ${link}`);
      const rel = decodeURIComponent(url.pathname.slice(base.length));
      let target = path.join(dist, rel);
      if (url.pathname.endsWith("/")) target = path.join(target, "index.html");
      check(fs.existsSync(target), `${file}: missing local link ${link}`);
      if (url.hash && ids.has(target)) check(ids.get(target).has(decodeURIComponent(url.hash.slice(1))), `${file}: missing anchor ${link}`);
      localLinks++;
    } else if (url.hostname === "github.com" && url.pathname.startsWith("/maheerid/chi-sourcey-reference/blob/main/vendor/chi/")) {
      const source = decodeURIComponent(url.pathname.slice("/maheerid/chi-sourcey-reference/blob/main/".length));
      check(fs.existsSync(path.join(root, source)), `missing source link ${link}`);
      const line = Number(url.hash.replace("#L", ""));
      check(line > 0 && line <= fs.readFileSync(source, "utf8").split("\n").length, `invalid source line ${link}`);
      sourceLinks++;
    }
  }
} }
const symbols = [];
const sourceFiles = new Set();
check(snapshot.module_path === "github.com/go-chi/chi/v5", "unexpected module");
check(snapshot.packages.length === 2, "expected two public packages");
for (const p of snapshot.packages) {
  p.files.forEach(f => sourceFiles.add(f));
  const slug = p.importPath.endsWith("/middleware") ? "pkg-middleware" : "package-root";
  const file = path.join(dist, "api", slug, "index.html");
  const page = html.get(file) ?? "";
  const readable = normalize(page);
  function symbol(s, kind, owner = "") {
    const id = owner ? `method-${owner}-${s.name}` : `${kind}-${s.name}`;
    check(ids.get(file)?.has(id), `missing generated anchor ${p.importPath}#${id}`);
    const declaration = s.signature || s.declaration;
    if (owner) check(new RegExp(`^func\\s+${s.name}\\(`).test(s.signature), `malformed receiver-free method signature ${owner}.${s.name}`);
    if (declaration && kind !== "type") check(readable.includes(normalize(declaration)), `missing declaration ${p.importPath}.${owner ? owner + "." : ""}${s.name}`);
    const pos = s.position;
    if (pos?.file) {
      const source = path.join(root, "vendor/chi", pos.file);
      check(fs.existsSync(source), `missing source for ${s.name}`);
      if (fs.existsSync(source)) check(pos.line > 0 && pos.line <= fs.readFileSync(source, "utf8").split("\n").length, `bad source position ${s.name}`);
      sourceFiles.add(pos.file);
    }
    symbols.push({ package: p.importPath, name: owner ? `${owner}.${s.name}` : s.name, kind: owner ? "method" : kind,
      declaration, source: pos, url: `${origin}${base}api/${slug}/#${id}` });
  }
  p.consts.forEach(s => symbol(s, "const"));
  p.vars.forEach(s => symbol(s, "var"));
  p.funcs.forEach(s => symbol(s, "func"));
  p.types.forEach(s => { symbol(s, "type"); s.methods.forEach(m => symbol(m, "method", s.name)); });
}
check(symbols.length === 128, `expected 128 declarations, got ${symbols.length}`);
const search = JSON.parse(fs.readFileSync(path.join(dist, "search-index.json"), "utf8"));
check(search.some(x => x.title.includes("Timeout")), "Timeout not searchable");
check(search.some(x => x.title.includes("URLParam")), "URLParam not searchable");
const sitemap = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
check([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].length === 9, "expected 9 sitemap pages");
check(fs.existsSync(path.join(dist, "llms.txt")), "missing llms.txt");
const manifest = [...sourceFiles].sort().map(file => ({ file, sha256: hash(fs.readFileSync(path.join(root, "vendor/chi", file))), upstream: `https://github.com/go-chi/chi/blob/${sha}/${file}` }));
fs.mkdirSync("evidence", { recursive: true });
fs.writeFileSync("evidence/source-manifest.json", JSON.stringify({ repository: "https://github.com/go-chi/chi", commit: sha, files: manifest }, null, 2) + "\n");
fs.writeFileSync("evidence/symbol-inventory.json", JSON.stringify({ count: symbols.length, symbols }, null, 2) + "\n");
fs.cpSync("evidence", path.join(dist, "evidence"), { recursive: true });
validateLinks();
const result = { ok: errors.length === 0, pages: htmlFiles.length, sitemap_pages: 9, packages: 2, declarations: symbols.length,
  source_files: manifest.length, source_links: sourceLinks, local_links: localLinks, search_entries: search.length, errors };
fs.writeFileSync("evidence/validation.json", JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result));
if (errors.length) process.exit(1);
