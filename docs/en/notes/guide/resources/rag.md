---
title: RAG Backend
createTime: 2025/02/04 10:00:00
icon: mdi:database-search
permalink: /en/guide/resources/rag/
---

# RAG Backend

RAG Backend provides document retrieval functionality, supporting vector search and hybrid retrieval.

## Overview

- **Type**: Shared Resource Backend
- **Requires Session**: ❌ No
- **Tool Prefix**: `rag:`

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `rag:search` | Search documents | `query`, `top_k` |
| `rag:index` | Index documents | `documents` |

## Usage Example

```python
async with Sandbox() as sandbox:
    # RAG doesn't need Session (shared resource)
    
    result = await sandbox.execute("rag:search", {
        "query": "What is machine learning?",
        "top_k": 5
    })
    
    for doc in result["data"]["results"]:
        print(f"Score: {doc['score']}, Content: {doc['content'][:100]}")
```
