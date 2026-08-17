---
type: community
cohesion: 0.31
members: 10
---

# Graphify Build & Validate

**Cohesion:** 0.31 - loosely connected
**Members:** 10 nodes

## Members
- [[Graph_2]] - code
- [[Merge multiple extraction results into one graph.]] - rationale - .commandcode/skills/graphify/build.py
- [[Raise ValueError with all errors if extraction is invalid.]] - rationale - .commandcode/skills/graphify/validate.py
- [[Validate an extraction JSON dict against the graphify schema. Returns a list of…]] - rationale - .commandcode/skills/graphify/validate.py
- [[assert_valid()]] - code - .commandcode/skills/graphify/validate.py
- [[build()]] - code - .commandcode/skills/graphify/build.py
- [[build.py]] - code - .commandcode/skills/graphify/build.py
- [[build_from_json()]] - code - .commandcode/skills/graphify/build.py
- [[validate.py]] - code - .commandcode/skills/graphify/validate.py
- [[validate_extraction()]] - code - .commandcode/skills/graphify/validate.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Graphify_Build__Validate
SORT file.name ASC
```

## Connections to other communities
- 2 edges to [[_COMMUNITY_Graphify Analysis Engine]]

## Top bridge nodes
- [[build_from_json()]] - degree 6, connects to 1 community