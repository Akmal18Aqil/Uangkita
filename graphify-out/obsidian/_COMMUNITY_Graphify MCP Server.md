---
type: community
cohesion: 0.16
members: 19
---

# Graphify MCP Server

**Cohesion:** 0.16 - loosely connected
**Members:** 19 nodes

## Members
- [[Graph_6]] - code
- [[Path_6]] - code
- [[Reconstruct community dict from community property stored on nodes.]] - rationale - .commandcode/skills/graphify/serve.py
- [[Render subgraph as text, cutting at token_budget (approx 4 charstoken).]] - rationale - .commandcode/skills/graphify/serve.py
- [[Resolve path and verify it stays inside base. base defaults to the…]] - rationale - .commandcode/skills/graphify/security.py
- [[Return node IDs whose label or ID matches the search term (case-insensitive).]] - rationale - .commandcode/skills/graphify/serve.py
- [[Start the MCP server. Requires pip install mcp.]] - rationale - .commandcode/skills/graphify/serve.py
- [[Strip control characters, cap length, then HTML-escape. Applied to all node…]] - rationale - .commandcode/skills/graphify/security.py
- [[_bfs()]] - code - .commandcode/skills/graphify/serve.py
- [[_communities_from_graph()]] - code - .commandcode/skills/graphify/serve.py
- [[_dfs()]] - code - .commandcode/skills/graphify/serve.py
- [[_find_node()]] - code - .commandcode/skills/graphify/serve.py
- [[_load_graph()]] - code - .commandcode/skills/graphify/serve.py
- [[_score_nodes()]] - code - .commandcode/skills/graphify/serve.py
- [[_subgraph_to_text()]] - code - .commandcode/skills/graphify/serve.py
- [[sanitize_label()]] - code - .commandcode/skills/graphify/security.py
- [[serve()]] - code - .commandcode/skills/graphify/serve.py
- [[serve.py]] - code - .commandcode/skills/graphify/serve.py
- [[validate_graph_path()]] - code - .commandcode/skills/graphify/security.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Graphify_MCP_Server
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_Graphify Ingest & Security]]
- 2 edges to [[_COMMUNITY_Graphify Analysis Engine]]
- 2 edges to [[_COMMUNITY_Graphify Export Formats]]
- 1 edge to [[_COMMUNITY_Graphify CLI & Hooks]]

## Top bridge nodes
- [[serve.py]] - degree 12, connects to 2 communities
- [[sanitize_label()]] - degree 6, connects to 2 communities
- [[serve()]] - degree 6, connects to 2 communities
- [[validate_graph_path()]] - degree 5, connects to 1 community