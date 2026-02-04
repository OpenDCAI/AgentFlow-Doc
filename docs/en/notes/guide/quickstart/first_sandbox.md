---
title: First Sandbox
createTime: 2025/02/04 10:00:00
icon: solar:flag-2-broken
permalink: /en/guide/quickstart/first-sandbox/
---

# First Sandbox

This document introduces how to use AgentFlow Sandbox through practical examples.

## Basic Usage

### Method 1: Auto-start Server (Recommended)

```python
import asyncio
from sandbox import Sandbox

async def main():
    sandbox = Sandbox(
        server_url="http://127.0.0.1:18890",
        auto_start_server=True,
        server_config_path="sandbox/configs/profiles/dev.json"
    )
    await sandbox.start()

    # Execute command
    result = await sandbox.execute("bash:run", {"command": "echo hello"})
    if result.get("code") == 0:
        print(result["data"])

    await sandbox.close()

asyncio.run(main())
```

### Method 2: Using Context Manager

```python
import asyncio
from sandbox import Sandbox

async def main():
    async with Sandbox(server_url="http://127.0.0.1:18890") as sandbox:
        # Create Session
        await sandbox.create_session("vm")
        
        # Take screenshot
        result = await sandbox.execute("vm:screenshot", {})
        print(f"Screenshot: {result}")
        
        # Click
        result = await sandbox.execute("vm:click", {"x": 100, "y": 200})
        print(f"Click: {result}")

asyncio.run(main())
```

### Method 3: Synchronous Mode

```python
from sandbox import Sandbox

# Sync mode
with Sandbox(server_url="http://127.0.0.1:18890") as sandbox:
    sandbox.create_session_sync("bash")
    result = sandbox.execute_sync("bash:run", {"command": "ls -la"})
    print(result)
```

## Execute Different Tool Types

### Execute Bash Commands

```python
async with Sandbox() as sandbox:
    await sandbox.create_session("bash", {"cwd": "/home/user"})
    
    result = await sandbox.execute("bash:run", {
        "command": "ls -la",
        "timeout": 30
    })
    print(result["data"]["stdout"])
```

### Execute RAG Search

```python
async with Sandbox() as sandbox:
    # RAG doesn't need Session (shared resource)
    result = await sandbox.execute("rag:search", {
        "query": "What is machine learning?",
        "top_k": 5
    })
    print(result["data"]["results"])
```

### Execute WebSearch

```python
async with Sandbox() as sandbox:
    # Lightweight API tool, no Session needed
    result = await sandbox.execute("search", {
        "query": "Python tutorial"
    })
    print(result["data"]["results"])
```

## Next Steps

- [Session Management](./session_management.md) - Learn about session mechanism
- [VM Backend](../resources/vm.md) - Using VM backend
- [RAG Backend](../resources/rag.md) - Using RAG backend
