---
title: Reproduce the reference
description: Rebuild static HTML, regenerate native Go documentation, and rerun the checks from public source.
---

# Reproduce the reference

The documentation repository commits the exact generator dependency lock, the native Go snapshot, authored guides, vendored upstream source, runnable examples, and validation script.

## Build from the snapshot

Use Node.js 20 or newer and npm:

```sh
git clone https://github.com/maheerid/chi-sourcey-reference.git
cd chi-sourcey-reference
npm ci
npm run build
npm run validate
```

`sourcey.config.ts` selects `mode: "snapshot"`. Sourcey reads `godoc.json` and emits static HTML in `dist/`. The deployment publishes that output in `docs/` on GitHub Pages, with `/chi-sourcey-reference` as its base path and slash-style URLs. `scripts/publish-output.mjs` copies the build plus public evidence to that folder.

## Refresh from the pinned Go source

The receipt-producing build used **Go 1.27.1** on Linux amd64. The module declares a minimum of Go 1.24. To regenerate with the same environment:

```sh
go version
npm run prepare:fixtures
npm run snapshot
git diff -- godoc.json
(cd vendor/chi && go test ./...)
(cd examples && go test -v ./...)
npm run build
npm run validate
```

The generated timestamp changes when regenerating the snapshot. Review source changes and API inventory changes before updating the pinned commit. Do not silently substitute a moving branch for the declared input.

The upstream HTTP/2 test expects a TLS pair in `vendor/chi/testdata/`. Private keys are excluded from this repository. `npm run prepare:fixtures` needs OpenSSL and generates a fresh local pair for that test only. Its certificate is self-signed, and the upstream test explicitly disables certificate verification. Do not use this test identity in production.

## Execute under runx

```sh
npx runx --version
npx runx skill inspect ./governed-build --json
npx runx skill ./governed-build -i project="$PWD" --json -R .runx-receipts
```

The checked-in CLI-tool runner invokes Sourcey, runs upstream and companion Go tests, validates local links and symbol coverage, then emits a JSON result. Receipt files contain execution provenance. Public evidence includes the sealed receipt and its verification result. Keep private runx identity keys and unrelated account credentials outside this repository.

This run uses **local development signing**. Its digest, content address, and development signature verify with `--allow-local-development-signatures`. Verification with an independently trusted production key is not configured, and single-receipt verification does not establish receipt-tree lineage. The public verdict records those limits.

```sh
npx runx verify --receipt evidence/receipt.json --allow-local-development-signatures --json
npm run deploy
```

## What validation checks

The validator checks both snapshot package identities, all 128 exported declaration records, source-file existence and line positions, generated HTML anchors and signatures, local page and asset links, source-link targets, the sitemap, and search data. The companion tests cover URL parameters and `404`/`405`, middleware scoping and subrouter mounting, late `Use`, and a cooperative deadline returning `504`.
