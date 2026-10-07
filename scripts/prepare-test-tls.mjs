import fs from "node:fs";
import { spawnSync } from "node:child_process";

// The pinned upstream HTTP/2 test uses InsecureSkipVerify and needs a TLS pair.
// Generate a local disposable fixture; private keys never enter the public repo.
const dir = "vendor/chi/testdata";
fs.mkdirSync(dir, { recursive: true });
const result = spawnSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-sha256", "-nodes", "-days", "1",
  "-subj", "/CN=localhost", "-keyout", `${dir}/key.pem`, "-out", `${dir}/cert.pem`], { encoding: "utf8" });
if (result.status !== 0) {
  process.stderr.write(result.stderr || result.error?.message || "OpenSSL failed");
  process.exit(1);
}
fs.chmodSync(`${dir}/key.pem`, 0o600);
process.stdout.write("Generated a disposable local TLS fixture for the upstream HTTP/2 test.\n");
