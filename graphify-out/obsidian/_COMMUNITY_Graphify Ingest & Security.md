---
type: community
cohesion: 0.11
members: 33
---

# Graphify Ingest & Security

**Cohesion:** 0.11 - loosely connected
**Members:** 33 nodes

## Members
- [[dot-redirect_request()]] - code - .commandcode/skills/graphify/security.py
- [[Classify the URL for targeted extraction.]] - rationale - .commandcode/skills/graphify/ingest.py
- [[Convert HTML to clean markdown. Uses html2text if available, else basic strip.]] - rationale - .commandcode/skills/graphify/ingest.py
- [[Download a binary file (PDF, image) directly.]] - rationale - .commandcode/skills/graphify/ingest.py
- [[Fetch url and return decoded text (UTF-8, replacing bad bytes). Wraps…]] - rationale - .commandcode/skills/graphify/security.py
- [[Fetch url and return raw bytes. Protections applied - URL scheme validated…]] - rationale - .commandcode/skills/graphify/security.py
- [[Fetch a URL and save it into target_dir as a graphify-ready file. Returns the…]] - rationale - .commandcode/skills/graphify/ingest.py
- [[Fetch a generic webpage and convert to markdown.]] - rationale - .commandcode/skills/graphify/ingest.py
- [[Fetch a tweet URL. Returns (content, filename).]] - rationale - .commandcode/skills/graphify/ingest.py
- [[Fetch arXiv abstract page.]] - rationale - .commandcode/skills/graphify/ingest.py
- [[OpenerDirector]] - code
- [[Path_5]] - code
- [[Raise ValueError if url is not http or https. Blocks file, ftp, data,…]] - rationale - .commandcode/skills/graphify/security.py
- [[Redirect handler that re-validates every redirect target. Prevents open-…]] - rationale - .commandcode/skills/graphify/security.py
- [[Save a Q&A result as markdown so it gets extracted into the graph on next…]] - rationale - .commandcode/skills/graphify/ingest.py
- [[Turn a URL into a safe filename.]] - rationale - .commandcode/skills/graphify/ingest.py
- [[_NoFileRedirectHandler]] - code - .commandcode/skills/graphify/security.py
- [[_build_opener()]] - code - .commandcode/skills/graphify/security.py
- [[_detect_url_type()]] - code - .commandcode/skills/graphify/ingest.py
- [[_download_binary()]] - code - .commandcode/skills/graphify/ingest.py
- [[_fetch_arxiv()]] - code - .commandcode/skills/graphify/ingest.py
- [[_fetch_html()]] - code - .commandcode/skills/graphify/ingest.py
- [[_fetch_tweet()]] - code - .commandcode/skills/graphify/ingest.py
- [[_fetch_webpage()]] - code - .commandcode/skills/graphify/ingest.py
- [[_html_to_markdown()]] - code - .commandcode/skills/graphify/ingest.py
- [[_safe_filename()]] - code - .commandcode/skills/graphify/ingest.py
- [[ingest()]] - code - .commandcode/skills/graphify/ingest.py
- [[ingest.py]] - code - .commandcode/skills/graphify/ingest.py
- [[safe_fetch()]] - code - .commandcode/skills/graphify/security.py
- [[safe_fetch_text()]] - code - .commandcode/skills/graphify/security.py
- [[save_query_result()]] - code - .commandcode/skills/graphify/ingest.py
- [[security.py]] - code - .commandcode/skills/graphify/security.py
- [[validate_url()]] - code - .commandcode/skills/graphify/security.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Graphify_Ingest__Security
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_Graphify MCP Server]]
- 1 edge to [[_COMMUNITY_Graphify Export Formats]]
- 1 edge to [[_COMMUNITY_Graphify CLI & Hooks]]

## Top bridge nodes
- [[security.py]] - degree 10, connects to 2 communities
- [[safe_fetch()]] - degree 8, connects to 1 community