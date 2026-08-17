# Graph Report - Uangkita  (2026-08-16)

## Corpus Check
- Corpus is ~48,845 words - fits in a single context window. You may not need a graph.

## Summary
- 389 nodes · 760 edges · 17 communities (14 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Frontend Components & Pages
- Graphify Cache & Extraction
- Graphify Analysis Engine
- Project Specification & Design
- Graphify Ingest & Security
- Graphify CLI & Hooks
- Graphify File Detection
- Graphify Export Formats
- Graphify MCP Server
- Google Apps Script Config
- Graphify Wiki Generator
- PWA Manifest
- Graphify Build & Validate
- Service Worker
- Graphify Init
- Vercel Config
- User Preferences

## God Nodes (most connected - your core abstractions)
1. `extract()` - 20 edges
2. `FinanceKu App` - 18 edges
3. `_make_id()` - 15 edges
4. `_rebuild_code()` - 13 edges
5. `formatRupiah()` - 13 edges
6. `main()` - 11 edges
7. `showToast()` - 11 edges
8. `openTransactionForm()` - 10 edges
9. `_is_file_node()` - 9 edges
10. `god_nodes()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Phase 2: Core Finance` --semantically_similar_to--> `Transaksi (Transaction) Module`  [INFERRED] [semantically similar]
  TASK.md → PRD.md
- `Phase 4: Tasks + Calendar` --semantically_similar_to--> `Tasks Module`  [INFERRED] [semantically similar]
  TASK.md → PRD.md
- `Phase 3: Analytics` --semantically_similar_to--> `Analytics Module`  [INFERRED] [semantically similar]
  TASK.md → PRD.md
- `Phase 1: Foundation` --semantically_similar_to--> `Dark Glassmorphism Design System`  [INFERRED] [semantically similar]
  TASK.md → PRD.md
- `Phase 5: Polish & Deploy` --semantically_similar_to--> `Vercel Deployment`  [INFERRED] [semantically similar]
  TASK.md → PRD.md

## Import Cycles
- None detected.

## Communities (17 total, 3 thin omitted)

### Community 0 - "Frontend Components & Pages"
Cohesion: 0.09
Nodes (42): api, createBarChart(), createDonutChart(), createProgressBar(), createReferenceBarChart(), renderFAB(), showBottomSheet(), navItems (+34 more)

### Community 1 - "Graphify Cache & Extraction"
Cohesion: 0.08
Nodes (50): cache_dir(), cached_files(), check_semantic_cache(), clear_cache(), file_hash(), load_cached(), Path, SHA256 of file contents, hex digest. (+42 more)

### Community 2 - "Graphify Analysis Engine"
Cohesion: 0.08
Nodes (46): _cross_community_surprises(), _cross_file_surprises(), _file_category(), god_nodes(), graph_diff(), _is_concept_node(), _is_file_node(), _node_community_map() (+38 more)

### Community 3 - "Project Specification & Design"
Cohesion: 0.10
Nodes (34): SPA App Shell (index.html), css/animations.css, css/components.css, css/index.css (Design System), css/pages.css, PWA Setup, Service Worker (sw.js), js/app.js (Main App Entry) (+26 more)

### Community 4 - "Graphify Ingest & Security"
Cohesion: 0.11
Nodes (30): _detect_url_type(), _download_binary(), _fetch_arxiv(), _fetch_html(), _fetch_tweet(), _fetch_webpage(), _html_to_markdown(), ingest() (+22 more)

### Community 5 - "Graphify CLI & Hooks"
Cohesion: 0.11
Nodes (28): _estimate_tokens(), print_benchmark(), Graph, _query_subgraph_tokens(), Token-reduction benchmark - measures how much context graphify saves vs naive…, Print a human-readable benchmark report., Run BFS from best-matching nodes and return estimated tokens in the subgraph…, Measure token reduction: corpus tokens vs graphify query tokens. Args:… (+20 more)

### Community 6 - "Graphify File Detection"
Cohesion: 0.17
Nodes (21): classify_file(), count_words(), detect(), detect_incremental(), extract_pdf_text(), FileType, _is_noise_dir(), _is_sensitive() (+13 more)

### Community 7 - "Graphify Export Formats"
Cohesion: 0.15
Nodes (22): attach_hyperedges(), _html_script(), _html_styles(), _hyperedge_script(), _node_community_map(), push_to_neo4j(), Graph, Invert communities dict: node_id -> community_id. (+14 more)

### Community 8 - "Graphify MCP Server"
Cohesion: 0.16
Nodes (18): Path, Resolve *path* and verify it stays inside *base*. *base* defaults to the…, Strip control characters, cap length, then HTML-escape. Applied to all node…, sanitize_label(), validate_graph_path(), _bfs(), _communities_from_graph(), _dfs() (+10 more)

### Community 9 - "Google Apps Script Config"
Cohesion: 0.17
Nodes (11): dependencies, exceptionLogging, oauthScopes, runtimeVersion, timeZone, webapp, access, executeAs (+3 more)

### Community 10 - "Graphify Wiki Generator"
Cohesion: 0.33
Nodes (10): _community_article(), _cross_community_links(), _god_node_article(), _index_md(), Graph, Path, Return (community_label, edge_count) pairs for cross-community connections,…, Generate a Wikipedia-style wiki from the graph. Writes: - index.md — agent… (+2 more)

### Community 11 - "PWA Manifest"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, short_name, shortcuts, start_url (+2 more)

### Community 12 - "Graphify Build & Validate"
Cohesion: 0.31
Nodes (8): build(), build_from_json(), Graph, Merge multiple extraction results into one graph., assert_valid(), Validate an extraction JSON dict against the graphify schema. Returns a list of…, Raise ValueError with all errors if extraction is invalid., validate_extraction()

### Community 13 - "Service Worker"
Cohesion: 0.43
Nodes (5): ASSETS_TO_CACHE, cacheFirst(), isCacheable(), networkFirst(), staleWhileRevalidate()

## Knowledge Gaps
- **34 isolated node(s):** `timeZone`, `dependencies`, `exceptionLogging`, `runtimeVersion`, `executeAs` (+29 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `god_nodes()` connect `Graphify Analysis Engine` to `Graphify MCP Server`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Why does `extract()` connect `Graphify Cache & Extraction` to `Graphify Analysis Engine`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Why does `_rebuild_code()` connect `Graphify Analysis Engine` to `Graphify Cache & Extraction`, `Graphify Build & Validate`, `Graphify Export Formats`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `FinanceKu App` (e.g. with `User Preferences (Indonesian, Lean Solutions)` and `index.html — SPA Shell`) actually correct?**
  _`FinanceKu App` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `timeZone`, `dependencies`, `exceptionLogging` to the rest of the system?**
  _34 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Frontend Components & Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.08997668997668998 - nodes in this community are weakly interconnected._
- **Should `Graphify Cache & Extraction` be split into smaller, more focused modules?**
  _Cohesion score 0.08055152394775036 - nodes in this community are weakly interconnected._