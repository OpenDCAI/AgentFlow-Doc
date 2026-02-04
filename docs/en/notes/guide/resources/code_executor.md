---
title: Code Executor Backend
createTime: 2025/02/04 10:00:00
icon: mdi:code-braces
permalink: /en/guide/resources/code-executor/
---

# Code Executor Backend

Code Executor Backend provides code sandbox execution, supporting multiple programming languages.

## Overview

- **Type**: Session Resource Backend
- **Requires Session**: ✅ Yes
- **Tool Prefix**: `code:`

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `code:execute` | Execute code | `code`, `language`, `timeout` |

## Usage Example

```python
async with Sandbox() as sandbox:
    await sandbox.create_session("code")
    
    result = await sandbox.execute("code:execute", {
        "code": """
import math
print(f"Pi = {math.pi}")
        """,
        "language": "python",
        "timeout": 30
    })
    
    print(result["data"]["stdout"])
    
    await sandbox.destroy_session("code")
```

## Supported Languages

- Python 3.x
- JavaScript (Node.js)
- Bash
