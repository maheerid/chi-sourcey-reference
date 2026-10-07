---
title: Compose routes deliberately
description: Choose With, Group, Route, or Mount and understand where middleware applies.
---

# Compose routes deliberately

Most routing mistakes are about scope. Choose a composition operation based on whether you need a middleware scope, a path prefix, or an existing handler.

| Operation | Path prefix | Typical use |
| --- | --- | --- |
| `Use(m...)` | None | Add middleware to the current mux before registering routes |
| `With(m...).Get(...)` | None | Give one endpoint additional middleware |
| `Group(func(r chi.Router) {...})` | None | Share middleware across related routes at their existing paths |
| `Route("/api", func(r chi.Router) {...})` | `/api` | Build a subrouter under a path prefix |
| `Mount("/api", handler)` | `/api` | Attach an already constructed `http.Handler` |

## Global and endpoint middleware

```go
r := chi.NewRouter()
r.Use(middleware.RequestID) // register global middleware first
r.Get("/health", health)
r.With(requireSession).Get("/account", account)
```

`Use` must precede route registration on its mux. The pinned `Mux.Use` implementation panics if the mux handler has already been built. `With` returns an inline router with a fresh middleware stack and lets you add endpoint middleware after other endpoints have been registered.

## Group a policy; route a path

```go
r.Group(func(r chi.Router) {
    r.Use(requireSession)
    r.Get("/account", account)
    r.Post("/logout", logout)
})
r.Route("/api", func(r chi.Router) {
    r.Get("/version", version) // reached at /api/version
})
```

`Group` does not add a URL prefix. `Route` creates and mounts a fresh mux at its pattern. `Mount` is appropriate when another package already exposes an `http.Handler`; do not register the same mount pattern twice on one router.

## Inspect route structure

`chi.Walk` traverses a router's routes and reports the method, pattern, handler, and middleware. `Routes` exposes route traversal, middleware, and matching interfaces. Use these for inventory and diagnostics; do not infer the final route pattern before routing has completed.

The scoped-header test in [reference_test.go](https://github.com/maheerid/chi-sourcey-reference/blob/main/examples/reference_test.go) checks `With`, `Group`, `Route`, and `Mount` behavior and verifies that the public endpoint does not inherit the private group's header. It also exercises the late-`Use` panic so this warning stays tied to the pinned implementation.
