package examples

import (
    "fmt"
    "net/http"
    "net/http/httptest"
    "testing"
    "time"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

func TestParameterAndFailures(t *testing.T) {
    r := chi.NewRouter()
    r.Get("/users/{userID}", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "user:%s", chi.URLParam(r, "userID"))
    })
    for _, tc := range []struct{ method, path string; status int; body string }{
        {"GET", "/users/42", 200, "user:42"},
        {"GET", "/missing", 404, ""},
        {"POST", "/users/42", 405, ""},
    } {
        t.Run(tc.method+tc.path, func(t *testing.T) {
            w := httptest.NewRecorder()
            r.ServeHTTP(w, httptest.NewRequest(tc.method, tc.path, nil))
            if w.Code != tc.status { t.Fatalf("status %d, want %d", w.Code, tc.status) }
            if tc.body != "" && w.Body.String() != tc.body { t.Fatalf("body %q, want %q", w.Body.String(), tc.body) }
        })
    }
}

func header(name string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler { return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set(name, "yes")
        next.ServeHTTP(w, r)
    }) }
}

func TestCompositionScopes(t *testing.T) {
    r := chi.NewRouter()
    ok := func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(200) }
    r.Get("/public", ok)
    r.With(header("X-Inline")).Get("/inline", ok)
    r.Group(func(r chi.Router) { r.Use(header("X-Group")); r.Get("/private", ok) })
    r.Route("/api", func(r chi.Router) { r.Get("/version", ok) })
    child := chi.NewRouter()
    child.Get("/ping", ok)
    r.Mount("/child", child)
    for _, tc := range []struct{ path, expected string }{
        {"/public", ""}, {"/inline", "X-Inline"}, {"/private", "X-Group"},
        {"/api/version", ""}, {"/child/ping", ""},
    } {
        t.Run(tc.path, func(t *testing.T) {
            w := httptest.NewRecorder()
            r.ServeHTTP(w, httptest.NewRequest("GET", tc.path, nil))
            if w.Code != 200 { t.Fatalf("status %d", w.Code) }
            for _, name := range []string{"X-Inline", "X-Group"} {
                want := ""; if name == tc.expected { want = "yes" }
                if w.Header().Get(name) != want { t.Fatalf("%s = %q, want %q", name, w.Header().Get(name), want) }
            }
        })
    }
    t.Run("late Use panics", func(t *testing.T) {
        defer func() { if recover() == nil { t.Fatal("Use after route registration should panic") } }()
        r.Use(header("X-Late"))
    })
}

func TestCooperativeDeadline(t *testing.T) {
    r := chi.NewRouter()
    observed := false
    r.With(middleware.Timeout(-time.Second)).Get("/work", func(w http.ResponseWriter, r *http.Request) {
        select {
        case <-r.Context().Done(): observed = true; return
        default: t.Fatal("expired context was not canceled")
        }
    })
    w := httptest.NewRecorder()
    r.ServeHTTP(w, httptest.NewRequest("GET", "/work", nil))
    if !observed || w.Code != http.StatusGatewayTimeout { t.Fatalf("canceled=%v status=%d", observed, w.Code) }
}
