# chi / Source Reference

A community documentation project for `github.com/go-chi/chi/v5`, built with Sourcey's native Go adapter. [Read the reference](https://maheerid.github.io/chi-sourcey-reference/).

Pinned upstream: [`go-chi/chi@167e1e3bd039d060696b99c8da4e876ae04f42c1`](https://github.com/go-chi/chi/commit/167e1e3bd039d060696b99c8da4e876ae04f42c1) (2026-09-29), MIT licensed. The public root and middleware packages contain 128 exported declaration records. Six companion guides explain routing and middleware with executable tests.

```sh
npm ci
npm run build
npm run validate
# With Go 1.27.1:
npm run prepare:fixtures
(cd vendor/chi && go test ./...)
(cd examples && go test -v ./...)
npx runx skill ./governed-build -i project="$PWD" --json -R .runx-receipts
```

`godoc.json` is generated from source by `npm run snapshot`. `sourcey.config.ts` consumes that snapshot. The generated Pages deployment is committed in `docs/`; public provenance, source hashes, structured evidence and the sealed runx receipt are in `docs/evidence/`.

The receipt uses runx's local development signing mode. Verification passes only with the explicit `--allow-local-development-signatures` option; no independently trusted production key or receipt-tree lineage is claimed. Both verification verdicts are published. Run `npm run deploy` to refresh `docs/` after a reviewed change.

Source links resolve to the byte-identical vendored upstream files. This is independently maintained community documentation by Sameer Ahmed, not an official chi website. Upstream release and issue decisions remain with go-chi maintainers. See [coverage](https://maheerid.github.io/chi-sourcey-reference/coverage/) for scope and limitations.

Authored material: MIT. Vendored source: upstream MIT notice retained in `vendor/chi/LICENSE`.

Go source is byte-identical to the pinned upstream. TLS test keys and certificates are excluded from this public repository. `npm run prepare:fixtures` uses OpenSSL to generate a fresh local self-signed pair solely for upstream's HTTP/2 middleware test; it is ignored by Git and never used as a production identity.
