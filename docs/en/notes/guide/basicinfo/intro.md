---
title: Introduction
createTime: 2025/02/04 10:00:00
icon: mdi:tooltip-text-outline
permalink: /en/guide/intro/
---

# AgentFlow Sandbox Introduction

AgentFlow Sandbox is a unified execution environment designed specifically for **Agent Data Synthesis**. It provides standardized tool invocation and environment interaction capabilities for large-scale Agent trajectory data synthesis, supporting VM desktop automation, RAG retrieval, command line interaction, web automation, and more.

## Why AgentFlow?

In Agent data synthesis scenarios, we need:

- **Standardized tool invocation interface**: Unified calling method for different types of tools
- **Complete trajectory recording**: Automatically record every interaction between Agent and environment
- **Large-scale parallel execution**: Support multi-worker concurrency to improve synthesis efficiency
- **Resource isolation and management**: Independent execution environment for each worker
- **High reliability**: Complete error handling and resource cleanup mechanisms

AgentFlow is designed to solve these problems.

## Core Features

### 🤖 Agent Data Synthesis

AgentFlow is optimized for Agent trajectory data synthesis:

- **Standardized response format**: Unified JSON response for easy data collection
- **Complete trajectory recording**: Automatically records tool calls, parameters, return values, execution time
- **Batch execution support**: Supports batch tool calls to improve synthesis efficiency
- **Worker isolation**: Independent execution environment for each synthesis task

```python
# Typical Agent data synthesis workflow
async with Sandbox() as sandbox:
    await sandbox.create_session("vm")
    
    # Agent decision -> Tool call -> Record trajectory
    result = await sandbox.execute("vm:screenshot", {})
    trajectory.append({
        "action": "vm:screenshot",
        "observation": result["data"],
        "metadata": result["meta"]
    })
```

### 🖥️ Multiple Resource Backends

AgentFlow supports various types of backend resources:

| Backend | Type | Description |
|---------|------|-------------|
| **VM** | Session Resource | Virtual machine desktop automation |
| **RAG** | Shared Resource | Document retrieval service |
| **Bash** | Session Resource | Command line interaction |
| **Browser** | Hybrid Resource | Web automation |
| **Code Executor** | Session Resource | Code sandbox execution |

### 📦 Session Management

Flexible session lifecycle management:

- **Explicit Session**: Created via `create_session()`, can be reused multiple times
- **Temporary Session**: Automatically created during execution, destroyed immediately after use

### 🌐 HTTP API

Standardized RESTful API interface:

```python
# Execute tool
POST /execute
{
    "worker_id": "sandbox_xxx",
    "action": "vm:screenshot",
    "params": {}
}

# Create Session
POST /session/create
{
    "worker_id": "sandbox_xxx",
    "resource_type": "vm",
    "config": {"screen_size": [1920, 1080]}
}
```

### 🔌 Extensible Architecture

Two extension methods:

- **Lightweight API Tools**: Using `@register_api_tool` decorator
- **Heavyweight Backend**: Inheriting `Backend` base class

## Quick Start

```python
from sandbox import Sandbox

async def main():
    async with Sandbox() as sandbox:
        # Create VM Session
        await sandbox.create_session("vm")
        
        # Take screenshot
        result = await sandbox.execute("vm:screenshot", {})
        print(result)
        
        # Click
        await sandbox.execute("vm:click", {"x": 100, "y": 200})

import asyncio
asyncio.run(main())
```

## Next Steps

- [Architecture](./architecture.md) - Learn about system architecture
- [Installation Guide](../quickstart/install.md) - Start installation
- [First Sandbox](../quickstart/first_sandbox.md) - Quick start tutorial
