---
title: Installation Guide
createTime: 2025/02/04 10:00:00
icon: material-symbols-light:download-rounded
permalink: /en/guide/quickstart/install/
---

# Installation Guide

This document describes how to install and configure AgentFlow Sandbox.

## Requirements

- Python 3.9+
- pip or conda

## Installation Methods

### Method 1: Install from Source (Recommended)

```bash
# Clone repository
git clone https://github.com/yourorg/agentflow_sandbox.git
cd agentflow_sandbox

# Install dependencies
pip install -e .
```

### Method 2: pip Install

```bash
pip install agentflow-sandbox
```

## Optional Dependencies

Install optional dependencies as needed:

```bash
# RAG support
pip install faiss-cpu sentence-transformers

# Browser support
pip install playwright
playwright install

# VM support (requires Docker or cloud service configuration)
pip install docker
```

## Verify Installation

```python
from sandbox import Sandbox

async def test():
    sandbox = Sandbox(
        server_url="http://127.0.0.1:18890",
        auto_start_server=True
    )
    await sandbox.start()
    
    # Get status
    status = await sandbox.get_status()
    print(f"Server status: {status}")
    
    await sandbox.close()

import asyncio
asyncio.run(test())
```

## Next Steps

- [First Sandbox](./first_sandbox.md) - Quick start tutorial
- [Session Management](./session_management.md) - Learn about session mechanism
