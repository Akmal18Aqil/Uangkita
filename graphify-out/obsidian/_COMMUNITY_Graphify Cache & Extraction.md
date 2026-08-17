---
type: community
cohesion: 0.08
members: 53
---

# Graphify Cache & Extraction

**Cohesion:** 0.08 - loosely connected
**Members:** 53 nodes

## Members
- [[Build a stable node ID from one or more name parts.]] - rationale - .commandcode/skills/graphify/extract.py
- [[Check semantic extraction cache for a list of absolute file paths. Returns…]] - rationale - .commandcode/skills/graphify/cache.py
- [[Delete all graphify-outcache.json files.]] - rationale - .commandcode/skills/graphify/cache.py
- [[Deterministic structural extraction from Python code using tree-sitter. Outputs…]] - rationale - .commandcode/skills/graphify/extract.py
- [[Extract AST nodes and edges from a list of code files. Two-pass process 1.…]] - rationale - .commandcode/skills/graphify/extract.py
- [[Extract classes, functions, and imports from a .py file via tree-sitter AST.]] - rationale - .commandcode/skills/graphify/extract.py
- [[Extract classes, functions, arrow functions, and imports from a .js.ts.tsx…]] - rationale - .commandcode/skills/graphify/extract.py
- [[Extract classes, functions, methods, namespace uses, and calls from a .php file.]] - rationale - .commandcode/skills/graphify/extract.py
- [[Extract classes, interfaces, methods, constructors, and imports from a .java…]] - rationale - .commandcode/skills/graphify/extract.py
- [[Extract classes, interfaces, methods, namespaces, and usings from a .cs file.]] - rationale - .commandcode/skills/graphify/extract.py
- [[Extract classes, methods, singleton methods, and calls from a .rb file.]] - rationale - .commandcode/skills/graphify/extract.py
- [[Extract classes, objects, functions, and imports from a .kt.kts file.]] - rationale - .commandcode/skills/graphify/extract.py
- [[Extract classes, objects, functions, and imports from a .scala file.]] - rationale - .commandcode/skills/graphify/extract.py
- [[Extract functions and includes from a .c.h file.]] - rationale - .commandcode/skills/graphify/extract.py
- [[Extract functions, classes, and includes from a .cpp.cc.cxx.hpp file.]] - rationale - .commandcode/skills/graphify/extract.py
- [[Extract functions, methods, type declarations, and imports from a .go file.]] - rationale - .commandcode/skills/graphify/extract.py
- [[Extract functions, structs, enums, traits, impl methods, and use declarations…]] - rationale - .commandcode/skills/graphify/extract.py
- [[Path_1]] - code
- [[Path_3]] - code
- [[Return cached extraction for this file if hash matches, else None. Cache key…]] - rationale - .commandcode/skills/graphify/cache.py
- [[Return set of file paths that have a valid cache entry (hash still matches).]] - rationale - .commandcode/skills/graphify/cache.py
- [[Returns graphify-outcache - creates it if needed.]] - rationale - .commandcode/skills/graphify/cache.py
- [[SHA256 of file contents, hex digest.]] - rationale - .commandcode/skills/graphify/cache.py
- [[Save extraction result for this file. Stores as graphify-outcache{hash}.json…]] - rationale - .commandcode/skills/graphify/cache.py
- [[Save semantic extraction results to cache, keyed by source_file. Groups nodes…]] - rationale - .commandcode/skills/graphify/cache.py
- [[Two-pass import resolution turn file-level imports into class-level edges.…]] - rationale - .commandcode/skills/graphify/extract.py
- [[_make_id()]] - code - .commandcode/skills/graphify/extract.py
- [[_resolve_cross_file_imports()]] - code - .commandcode/skills/graphify/extract.py
- [[cache.py]] - code - .commandcode/skills/graphify/cache.py
- [[cache_dir()]] - code - .commandcode/skills/graphify/cache.py
- [[cached_files()]] - code - .commandcode/skills/graphify/cache.py
- [[check_semantic_cache()]] - code - .commandcode/skills/graphify/cache.py
- [[clear_cache()]] - code - .commandcode/skills/graphify/cache.py
- [[collect_files()]] - code - .commandcode/skills/graphify/extract.py
- [[extract()]] - code - .commandcode/skills/graphify/extract.py
- [[extract.py]] - code - .commandcode/skills/graphify/extract.py
- [[extract_c()]] - code - .commandcode/skills/graphify/extract.py
- [[extract_cpp()]] - code - .commandcode/skills/graphify/extract.py
- [[extract_csharp()]] - code - .commandcode/skills/graphify/extract.py
- [[extract_go()]] - code - .commandcode/skills/graphify/extract.py
- [[extract_java()]] - code - .commandcode/skills/graphify/extract.py
- [[extract_js()]] - code - .commandcode/skills/graphify/extract.py
- [[extract_kotlin()]] - code - .commandcode/skills/graphify/extract.py
- [[extract_php()]] - code - .commandcode/skills/graphify/extract.py
- [[extract_python()]] - code - .commandcode/skills/graphify/extract.py
- [[extract_ruby()]] - code - .commandcode/skills/graphify/extract.py
- [[extract_rust()]] - code - .commandcode/skills/graphify/extract.py
- [[extract_scala()]] - code - .commandcode/skills/graphify/extract.py
- [[file_hash()]] - code - .commandcode/skills/graphify/cache.py
- [[graphify_step3a.py]] - code - graphify_step3a.py
- [[load_cached()]] - code - .commandcode/skills/graphify/cache.py
- [[save_cached()]] - code - .commandcode/skills/graphify/cache.py
- [[save_semantic_cache()]] - code - .commandcode/skills/graphify/cache.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Graphify_Cache__Extraction
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_Graphify Analysis Engine]]

## Top bridge nodes
- [[extract()]] - degree 20, connects to 1 community
- [[collect_files()]] - degree 3, connects to 1 community