import fs from "node:fs";
import path from "node:path";
// Sourcey 3.6.12's godoc cross-package links retain .html in slash mode.
// Also correct relative body links on its root copy of the introduction.
function htmlFiles(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? htmlFiles(path.join(dir, e.name)) : e.name.endsWith(".html") ? [path.join(dir, e.name)] : []); }
for (const file of htmlFiles("dist")) {
  let text = fs.readFileSync(file, "utf8");
  text = text.replace(/href="(?:\.\.\/)+api\/(package-root|pkg-middleware)\.html(#[^"]*)?"/g,
    (_, slug, anchor = "") => `href="/chi-sourcey-reference/api/${slug}/${anchor}"`);
  if (file === path.join("dist", "index.html")) text = text.replace(/href="\.\.\/([a-z-]+\/[^\"]*)"/g, 'href="/chi-sourcey-reference/$1"');
  fs.writeFileSync(file, text);
}
fs.cpSync("evidence", "dist/evidence", { recursive: true });
fs.writeFileSync("dist/.nojekyll", "");
if (process.argv.includes("--deploy")) fs.cpSync("dist", "docs", { recursive: true });
