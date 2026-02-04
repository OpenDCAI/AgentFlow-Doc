---
title: Browser Backend
createTime: 2025/02/04 10:00:00
icon: mdi:web
permalink: /en/guide/resources/browser/
---

# Browser Backend

Browser Backend provides web automation, supporting navigation, screenshots, and interactions.

## Overview

- **Type**: Hybrid Backend (Shared + Session)
- **Requires Session**: ✅ Yes
- **Tool Prefix**: `browser:`

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `browser:goto` | Navigate to URL | `url` |
| `browser:screenshot` | Page screenshot | None |
| `browser:click` | Click element | `selector` |
| `browser:type` | Input text | `selector`, `text` |

## Usage Example

```python
async with Sandbox() as sandbox:
    await sandbox.create_session("browser", {"headless": True})
    
    await sandbox.execute("browser:goto", {"url": "https://example.com"})
    
    result = await sandbox.execute("browser:screenshot", {})
    
    await sandbox.destroy_session("browser")
```
