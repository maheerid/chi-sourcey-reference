# chi source reference: maintainer-facing report

- The native Go adapter documents two packages and 128 exported declaration records from an exact maintained, MIT-licensed upstream commit. Source positions and SHA-256 file hashes make a signature or comment independently checkable.
- A composition guide fills a practical gap between reading method signatures and selecting `With`, `Group`, `Route`, or `Mount`. Its scope matrix and executable header assertions identify which endpoints inherit middleware.
- A tested warning explains that `Mux.Use` must run before route registration; the late-Use panic is verified against the pinned implementation rather than inferred from a tutorial.
- The Timeout recipe calls out cooperative cancellation. An already expired context produces a deterministic test of `ctx.Done()` and the wrapper's `504`, avoiding timing-dependent sleeps.
- The quickstart verifies parameter extraction and the router's default `404`/`405` behavior with `net/http/httptest`, giving maintainers a small, repeatable onboarding check.
- Searchable generated API pages connect exported functions, types and methods to byte-identical source files. The public snapshot supports HTML builds without a Go toolchain; source extraction and behavior tests remain separately reproducible.
- Upstream source has no Go Example blocks extracted by this snapshot. A useful future improvement would be conventionally named upstream examples for the main routing composition operations; our companion tests are clearly identified as independent authored material.
- Snapshot builds are intentionally pinned. A maintainable adoption needs a reviewed refresh process, a library release/version selector, and CI that flags removed declarations and broken source links.
- Local validation found two Sourcey 3.6.12 slash-URL issues: native Go cross-package links kept `.html` suffixes, and body links in the root introduction copy escaped the project base path. The small checked-in post-build script corrects these targets before deployment; the validator then checks the actual corrected files.
- The actual runx receipt verifies in local development mode. Its digest, content address, and development signature pass. A trusted production verification key is not configured, and receipt-tree lineage remains unverified; both verdicts are public.
- This is a community reference, not adopted upstream documentation. The current personal GitHub Pages deployment is useful as a portfolio but fails Frantic bounty 33's registered-domain requirement. No bounty delivery or earned payment is claimed.
