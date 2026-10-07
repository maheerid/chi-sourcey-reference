import fs from "node:fs";

// Sourcey 3.6.12 leaves a receiver fragment in HeaderRouter.Route's signature.
// Read the pinned source declaration at its recorded line before correcting it.
const snapshot = JSON.parse(fs.readFileSync("godoc.json", "utf8"));
const pkg = snapshot.packages.find(p => p.importPath.endsWith("/middleware"));
const method = pkg.types.find(t => t.name === "HeaderRouter").methods.find(m => m.name === "Route");
const sourceFile = `vendor/chi/${method.position.file}`;
const sourceLine = fs.readFileSync(sourceFile, "utf8").split("\n")[method.position.line - 1];
const declaration = sourceLine.match(/^func \(hr HeaderRouter\) (Route\(.*\) HeaderRouter) \{$/);
if (!declaration) throw new Error("Pinned HeaderRouter.Route source declaration changed; review before rebuilding");
const expected = `func ${declaration[1]}`;
if (method.signature !== expected) {
  if (!method.signature.startsWith("func  Router) Route(")) throw new Error("Unexpected Sourcey signature; review the adapter output");
  const correction = { generator: "Sourcey 3.6.12", symbol: "HeaderRouter.Route", source: method.position,
    before: method.signature, after: expected,
    reason: "Remove the native adapter's leftover receiver fragment; parameters and return type are read from pinned Go source." };
  method.signature = expected;
  fs.writeFileSync("godoc.json", JSON.stringify(snapshot, null, 2) + "\n");
  fs.writeFileSync("evidence/snapshot-corrections.json", JSON.stringify({ corrections: [correction] }, null, 2) + "\n");
}
console.log("Verified the HeaderRouter.Route snapshot signature against pinned Go source.");
