import { defineConfig, markdown, godoc } from "sourcey";

export default defineConfig({
  name: "chi / Source Reference",
  siteUrl: "https://maheerid.github.io",
  baseUrl: "/chi-sourcey-reference",
  prettyUrls: "slash",
  repo: "https://github.com/maheerid/chi-sourcey-reference",
  editBranch: "main",
  theme: { colors: { primary: "#087f8c" }, fonts: { google: false } },
  ogImage: "static/reference-card.svg",
  navigation: { tabs: [
    { tab: "Guides", slug: "", source: markdown({ groups: [
      { group: "Start building", pages: ["introduction", "quickstart", "routing", "middleware"] },
      { group: "Trust and reproduce", pages: ["coverage", "rebuild"] }
    ] }) },
    { tab: "Go API", slug: "api", source: godoc({
      module: "vendor/chi", packages: ["./..."], snapshot: "godoc.json",
      mode: "snapshot", sourceBasePath: "vendor/chi",
      includeTests: true, includeUnexported: false
    }) }
  ] },
  navbar: { links: [
    { type: "github", label: "Upstream chi", href: "https://github.com/go-chi/chi" },
    { type: "link", label: "Build evidence", href: "/chi-sourcey-reference/evidence/evidence.json" }
  ] },
  footer: { links: [
    { type: "github", label: "Documentation source", href: "https://github.com/maheerid/chi-sourcey-reference" },
    { type: "link", label: "MIT license", href: "https://github.com/go-chi/chi/blob/167e1e3bd039d060696b99c8da4e876ae04f42c1/LICENSE" }
  ] },
  search: { featured: ["quickstart", "routing", "middleware", "coverage"] }
});
