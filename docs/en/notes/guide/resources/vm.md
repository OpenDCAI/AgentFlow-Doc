---
title: VM Backend
createTime: 2025/02/04 10:00:00
icon: mdi:desktop-classic
permalink: /en/guide/resources/vm/
---

# VM Backend

VM Backend provides virtual machine desktop automation, supporting screenshot, click, and input operations.

## Overview

- **Type**: Session Resource Backend
- **Requires Session**: ✅ Yes
- **Tool Prefix**: `vm:`

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `vm:screenshot` | Capture screen | None |
| `vm:click` | Click coordinates | `x`, `y` |
| `vm:type` | Input text | `text` |
| `vm:hotkey` | Send hotkey | `keys` |

## Usage Example

```python
async with Sandbox() as sandbox:
    await sandbox.create_session("vm", {
        "screen_size": [1920, 1080]
    })
    
    # Screenshot
    result = await sandbox.execute("vm:screenshot", {})
    image_base64 = result["data"]["image"]
    
    # Click
    await sandbox.execute("vm:click", {"x": 500, "y": 300})
    
    # Type text
    await sandbox.execute("vm:type", {"text": "Hello World"})
    
    await sandbox.destroy_session("vm")
```
