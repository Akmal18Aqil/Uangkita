---
type: community
cohesion: 0.17
members: 23
---

# Graphify File Detection

**Cohesion:** 0.17 - loosely connected
**Members:** 23 nodes

## Members
- [[Enum]] - code
- [[Extract plain text from a PDF file using pypdf.]] - rationale - .commandcode/skills/graphify/detect.py
- [[FileType]] - code - .commandcode/skills/graphify/detect.py
- [[Heuristic does this text file read like an academic paper]] - rationale - .commandcode/skills/graphify/detect.py
- [[Like detect(), but returns only new or modified files since the last run.…]] - rationale - .commandcode/skills/graphify/detect.py
- [[Load the file modification time manifest from a previous run.]] - rationale - .commandcode/skills/graphify/detect.py
- [[Path_2]] - code
- [[Return True if this directory name looks like a venv, cache, or dep dir.]] - rationale - .commandcode/skills/graphify/detect.py
- [[Return True if this file likely contains secrets and should be skipped.]] - rationale - .commandcode/skills/graphify/detect.py
- [[Save current file mtimes so the next --update run can diff against them.]] - rationale - .commandcode/skills/graphify/detect.py
- [[_is_noise_dir()]] - code - .commandcode/skills/graphify/detect.py
- [[_is_sensitive()]] - code - .commandcode/skills/graphify/detect.py
- [[_looks_like_paper()]] - code - .commandcode/skills/graphify/detect.py
- [[classify_file()]] - code - .commandcode/skills/graphify/detect.py
- [[count_words()]] - code - .commandcode/skills/graphify/detect.py
- [[detect()]] - code - .commandcode/skills/graphify/detect.py
- [[detect.py]] - code - .commandcode/skills/graphify/detect.py
- [[detect_incremental()]] - code - .commandcode/skills/graphify/detect.py
- [[extract_pdf_text()]] - code - .commandcode/skills/graphify/detect.py
- [[load_manifest()]] - code - .commandcode/skills/graphify/detect.py
- [[manifest.py]] - code - .commandcode/skills/graphify/manifest.py
- [[save_manifest()]] - code - .commandcode/skills/graphify/detect.py
- [[str]] - code

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Graphify_File_Detection
SORT file.name ASC
```
