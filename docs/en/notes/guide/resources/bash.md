---
title: Bash Backend
createTime: 2025/02/04 10:00:00
icon: mdi:console
permalink: /en/guide/resources/bash/
---

# Bash Backend

Bash Backend provides command line interaction, where each Session is an independent shell process.

## Overview

- **Type**: Session Resource Backend
- **Requires Session**: ✅ Yes
- **Tool Prefix**: `bash:`

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `bash:run` | Execute command | `command`, `timeout` |

## Usage Example

```python
async with Sandbox() as sandbox:
    await sandbox.create_session("bash", {"cwd": "/home/user"})
    
    result = await sandbox.execute("bash:run", {
        "command": "ls -la",
        "timeout": 30
    })
    
    print(result["data"]["stdout"])
    
    await sandbox.destroy_session("bash")
```
