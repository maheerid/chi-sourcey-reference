---
title: Middleware recipes and deadlines
description: Compose standard net/http middleware and handle chi Timeout correctly.
---

# Middleware recipes and deadlines

A chi middleware is `func(http.Handler) http.Handler`. It can inspect the request, update its context, wrap the response writer, or stop a request before it reaches the next handler.

## A practical initial stack

```go
r := chi.NewRouter()
r.Use(middleware.RequestID)
r.Use(middleware.Logger)
r.Use(middleware.Recoverer)
r.Get("/health", health)
```

Register `Logger` before `Recoverer` so the request logger surrounds the recovery handler. `RequestID` supplies a request identifier available through `middleware.GetReqID(r.Context())`. Choose logging and recovery behavior that fits your service; the stock logger writes to its configured output.

## Timeouts require cooperation

`middleware.Timeout` adds a deadline to the request context. **It does not terminate an arbitrary blocking handler.** The handler must observe `r.Context().Done()` and return. The wrapper writes `504` after that return when the context reached its deadline.

```go
r.With(middleware.Timeout(100 * time.Millisecond)).Get("/work", func(w http.ResponseWriter, r *http.Request) {
    select {
    case <-r.Context().Done():
        return
    case result := <-work(r.Context()):
        fmt.Fprint(w, result)
    }
})
```

Pass the context to downstream database and HTTP calls as well. Avoid writing a successful response after the context has expired. The [deadline test](https://github.com/maheerid/chi-sourcey-reference/blob/main/examples/reference_test.go) uses an already expired deadline rather than timing-sensitive sleeps and verifies both cancellation and `504`.

## Pick a middleware by its contract

| Need | APIs to inspect |
| --- | --- |
| Request correlation | `RequestID`, `GetReqID` |
| Panic recovery | `Recoverer`, `PrintPrettyStack` |
| Request size limit | `RequestSize` |
| MIME and encoding policy | `AllowContentType`, `AllowContentEncoding`, `ContentCharset` |
| Compression | `Compress`, `NewCompressor` |
| Concurrency control | `Throttle`, `ThrottleBacklog`, `ThrottleWithOpts` |
| Route-specific selection | `Maybe`, `RouteHeaders` |
| Response measurements | `NewWrapResponseWriter`, `WrapResponseWriter` |

Inspect the [middleware API reference](/chi-sourcey-reference/api/pkg-middleware/) for signatures, behavior, and source. Forwarded-client-IP middleware depends on the proxy trust configuration; do not treat untrusted forwarded headers as verified client identity.
