---
title: WebSearch Tool
createTime: 2025/02/04 10:00:00
icon: mdi:magnify
permalink: /en/guide/tools/websearch/
---

# WebSearch Tool

WebSearch is a lightweight API tool that provides web search functionality.

## Overview

- **Type**: Lightweight API Tool
- **Requires Session**: ❌ No
- **Config Key**: `websearch`

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `search` | Web search | `query`, `max_results` |
| `visit` | Visit webpage | `url` |

## Usage Example

```python
async with Sandbox() as sandbox:
    result = await sandbox.execute("search", {
        "query": "Python tutorial",
        "max_results": 10
    })
    
    for item in result["data"]["results"]:
        print(f"Title: {item['title']}")
        print(f"URL: {item['url']}")
```

## Configuration

```json
{
  "apis": {
    "websearch": {
      "serper_api_key": "${SERPER_API_KEY}",
      "max_results": 10
    }
  }
}
```
