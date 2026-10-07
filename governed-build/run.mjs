import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const project = path.resolve(process.env.RUNX_INPUT_PROJECT || "..");
const results = [];
function run(command, args, cwd = project) {
  const p = spawnSync(command, args, { cwd, encoding: "utf8", timeout: 180000 });
  const result = { command: [command, ...args].join(" "), directory: path.relative(project, cwd) || ".", status: p.status, stdout: p.stdout, stderr: p.stderr };
  results.push(result);
  if (p.status !== 0) { process.stderr.write(JSON.stringify(result)); process.exit(1); }
}
run(path.join(project, "node_modules/.bin/runx"), ["--version"]);
run("go", ["version"]);
run("node", ["scripts/repair-snapshot.mjs"]);
run(path.join(project, "node_modules/.bin/sourcey"), ["build"]);
run("node", ["scripts/prepare-test-tls.mjs"]);
run("go", ["test", "./..."], path.join(project, "vendor/chi"));
run("go", ["test", "-v", "./..."], path.join(project, "examples"));
run("node", ["scripts/publish-output.mjs"]);
run("node", ["scripts/validate-site.mjs"]);
run("node", ["scripts/publish-output.mjs"]);
fs.writeFileSync(path.join(project, "evidence/commands.json"), JSON.stringify(results, null, 2) + "\n");
const validation = JSON.parse(fs.readFileSync(path.join(project, "evidence/validation.json"), "utf8"));
process.stdout.write(JSON.stringify({ validation: { ...validation, commands: results } }) + "\n");
