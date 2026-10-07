---
title: chi — HTTP routing from the source
description: A community reference for the pinned chi v5 source, generated with Sourcey and backed by executable examples.
---

# Small router. Composable HTTP services.

**chi** is a Go HTTP router that works with `net/http`. Build one small handler, compose middleware around it, and mount larger services without replacing the standard library's handler interface.

This community reference combines two source-generated package references with tested recipes for the choices you make most often: reading path parameters, choosing a subrouter, scoping middleware, and handling request deadlines.

## Choose your next step

| You want to… | Start here |
| --- | --- |
| Serve your first parameterized route | [Quickstart](quickstart.md) |
| Choose between `With`, `Group`, `Route`, and `Mount` | [Routing composition](routing.md) |
| Add request IDs, recovery, or a deadline | [Middleware recipes](middleware.md) |
| Inspect exact signatures and source locations | [Go API](/chi-sourcey-reference/api/) |
| Verify what was generated and which commit it describes | [Coverage and provenance](coverage.md) |
| Regenerate the snapshot and run the examples | [Reproduce the build](rebuild.md) |

## What this reference describes

The input is `github.com/go-chi/chi/v5` at commit **`167e1e3bd039d060696b99c8da4e876ae04f42c1`**, dated September 29, 2026. API signatures, comments, exported methods, and source positions come from Sourcey's native `godoc` adapter. Guides are hand-authored companion material and are checked with executable Go tests.

This is an independently maintained community documentation project by Sameer Ahmed. Upstream chi remains the authority for releases, issue reports, and compatibility decisions. These pages document the pinned source, which can include changes after the latest tagged release.

## Follow the source

Use a **Defined in** link on an API entry to inspect the byte-identical vendored source. [Coverage and provenance](coverage.md) links to the pinned upstream files and includes a hash manifest so you can compare the two. Search works locally in your browser; the published static site needs no account or paid service.
