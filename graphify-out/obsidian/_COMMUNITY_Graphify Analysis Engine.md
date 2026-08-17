---
type: community
cohesion: 0.08
members: 50
---

# Graphify Analysis Engine

**Cohesion:** 0.08 - loosely connected
**Members:** 50 nodes

## Members
- [[Build a NetworkX graph from graphify nodeedge dicts. Preserves original edge…]] - rationale - .commandcode/skills/graphify/cluster.py
- [[Compare two graph snapshots and return what changed. Returns { new_nodes…]] - rationale - .commandcode/skills/graphify/analyze.py
- [[Cross-file edges between real codedoc entities, ranked by a composite surprise…]] - rationale - .commandcode/skills/graphify/analyze.py
- [[Find connections that are genuinely surprising - not obvious from file…]] - rationale - .commandcode/skills/graphify/analyze.py
- [[For single-source corpora find edges that bridge different communities. These…]] - rationale - .commandcode/skills/graphify/analyze.py
- [[Generate questions the graph is uniquely positioned to answer. Based on…]] - rationale - .commandcode/skills/graphify/analyze.py
- [[Graph]] - code
- [[Graph_3]] - code
- [[Graph_5]] - code
- [[Graph analysis god nodes (most connected), surprising connections (cross-…]] - rationale - .commandcode/skills/graphify/analyze.py
- [[Invert communities dict node_id - community_id.]] - rationale - .commandcode/skills/graphify/analyze.py
- [[Leiden community detection on NetworkX graphs. Splits oversized communities.…]] - rationale - .commandcode/skills/graphify/cluster.py
- [[Path_7]] - code
- [[Ratio of actual intra-community edges to maximum possible.]] - rationale - .commandcode/skills/graphify/cluster.py
- [[Re-run AST extraction + build + cluster + report for code files. No LLM needed.…]] - rationale - .commandcode/skills/graphify/watch.py
- [[Return True if this node is a file-level hub node (e.g. 'client', 'models') or…]] - rationale - .commandcode/skills/graphify/analyze.py
- [[Return True if this node is a manually-injected semantic concept node rather…]] - rationale - .commandcode/skills/graphify/analyze.py
- [[Return the first path component - used to detect cross-repo edges.]] - rationale - .commandcode/skills/graphify/analyze.py
- [[Return the top_n most-connected real entities - the core abstractions. File-…]] - rationale - .commandcode/skills/graphify/analyze.py
- [[Run Leiden community detection. Returns {community_id node_ids}. Community…]] - rationale - .commandcode/skills/graphify/cluster.py
- [[Run a second Leiden pass on a community subgraph to split it further.]] - rationale - .commandcode/skills/graphify/cluster.py
- [[Score how surprising a cross-file edge is. Returns (score, reasons).]] - rationale - .commandcode/skills/graphify/analyze.py
- [[Watch watch_path for new or modified files and auto-update the graph. For code-…]] - rationale - .commandcode/skills/graphify/watch.py
- [[Write a flag file and print a notification (fallback for non-code-only corpora).]] - rationale - .commandcode/skills/graphify/watch.py
- [[_cross_community_surprises()]] - code - .commandcode/skills/graphify/analyze.py
- [[_cross_file_surprises()]] - code - .commandcode/skills/graphify/analyze.py
- [[_file_category()]] - code - .commandcode/skills/graphify/analyze.py
- [[_has_non_code()]] - code - .commandcode/skills/graphify/watch.py
- [[_is_concept_node()]] - code - .commandcode/skills/graphify/analyze.py
- [[_is_file_node()]] - code - .commandcode/skills/graphify/analyze.py
- [[_node_community_map()]] - code - .commandcode/skills/graphify/analyze.py
- [[_notify_only()]] - code - .commandcode/skills/graphify/watch.py
- [[_rebuild_code()]] - code - .commandcode/skills/graphify/watch.py
- [[_split_community()]] - code - .commandcode/skills/graphify/cluster.py
- [[_surprise_score()]] - code - .commandcode/skills/graphify/analyze.py
- [[_top_level_dir()]] - code - .commandcode/skills/graphify/analyze.py
- [[analyze.py]] - code - .commandcode/skills/graphify/analyze.py
- [[build_graph()]] - code - .commandcode/skills/graphify/cluster.py
- [[cluster()]] - code - .commandcode/skills/graphify/cluster.py
- [[cluster.py]] - code - .commandcode/skills/graphify/cluster.py
- [[cohesion_score()]] - code - .commandcode/skills/graphify/cluster.py
- [[generate()]] - code - .commandcode/skills/graphify/report.py
- [[god_nodes()]] - code - .commandcode/skills/graphify/analyze.py
- [[graph_diff()]] - code - .commandcode/skills/graphify/analyze.py
- [[report.py]] - code - .commandcode/skills/graphify/report.py
- [[score_all()]] - code - .commandcode/skills/graphify/cluster.py
- [[suggest_questions()]] - code - .commandcode/skills/graphify/analyze.py
- [[surprising_connections()]] - code - .commandcode/skills/graphify/analyze.py
- [[watch()]] - code - .commandcode/skills/graphify/watch.py
- [[watch.py]] - code - .commandcode/skills/graphify/watch.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Graphify_Analysis_Engine
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_Graphify Cache & Extraction]]
- 2 edges to [[_COMMUNITY_Graphify MCP Server]]
- 2 edges to [[_COMMUNITY_Graphify Build & Validate]]
- 2 edges to [[_COMMUNITY_Graphify Export Formats]]

## Top bridge nodes
- [[watch.py]] - degree 14, connects to 3 communities
- [[_rebuild_code()]] - degree 13, connects to 3 communities
- [[god_nodes()]] - degree 9, connects to 1 community