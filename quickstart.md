---
title: Your first route
description: Read a URL parameter and test a chi handler with net/http/httptest.
---

# Your first route

Start with a router, register a method and pattern, and use `chi.URLParam` inside the matching handler. A router implements `http.Handler`, so it works with `http.ListenAndServe` and `httptest`.

```go
package main

import (
    "fmt"
    "net/http"
    "github.com/go-chi/chi/v5"
)

func main() {
    r := chi.NewRouter()
    r.Get("/users/{userID}", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "user:%s", chi.URLParam(r, "userID"))
    })
    if err := http.ListenAndServe(":8080", r); err != nil {
        panic(err)
    }
}
```

Run this against the pinned source using the `examples/go.mod` replacement checked into this project. If you use a release in your own application, pin an explicit version and consult that release's source.

## Test the handler without opening a port

```go
request := httptest.NewRequest(http.MethodGet, "/users/42", nil)
response := httptest.NewRecorder()
r.ServeHTTP(response, request)
// response.Code == 200; response.Body.String() == "user:42"
```

Our [executable tests](https://github.com/maheerid/chi-sourcey-reference/blob/main/examples/reference_test.go) check the parameter value, a missing route's `404`, and a different method's `405`. Request handlers should validate the parameter according to application rules; a matched string is not an authorization check.

## Patterns and methods

| Pattern or API | Meaning |
| --- | --- |
| `/users/{userID}` | Capture one path segment as `userID` |
| `/files/*` | Match the remainder of a path with the wildcard parameter |
| `r.Get(pattern, fn)` | Register a GET handler |
| `r.Method(method, pattern, handler)` | Register an explicit HTTP method with an `http.Handler` |
| `r.Handle(pattern, handler)` | Match any supported HTTP method |
| `r.NotFound(fn)` / `r.MethodNotAllowed(fn)` | Override the default failure responses |

For exact method signatures and definitions, open the [chi package reference](/chi-sourcey-reference/api/package-root/). For middleware that runs before the handler, continue to [routing composition](routing.md).
