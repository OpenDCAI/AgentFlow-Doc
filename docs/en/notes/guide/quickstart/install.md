---
title: Installation Guide
createTime: 2025/02/04 10:00:00
icon: material-symbols-light:download-rounded
permalink: /en/guide/quickstart/install/
---

# Installation Guide

This document describes how to install and configure AgentFlow.

## Requirements

- Python 3.9+
- pip or conda

## Installation Methods

### Method 1: Install from Source (Recommended)

```bash
# Clone repository
git clone https://github.com/OpenDCAI/AgentFlow.git
cd AgentFlow

# Install dependencies
pip install -e .
```

### Method 2: pip Install

```bash
pip install agentflow
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

# YAML configuration support
pip install pyyaml
```

## Verify Installation

### Verify Sandbox

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

### Verify Rollout

```python
from rollout import load_config

config = load_config("configs/infer/web_infer.json")
print(f"Model: {config.model_name}")
print(f"Tools: {config.available_tools}")
```

### Verify Synthesis

```python
from synthesis import load_config

config = load_config("configs/synthesis/web_config.json")
print(f"Model: {config.model_name}")
print(f"Max depth: {config.max_depth}")
```

## Configuration Files

### Sandbox Server Configuration

Create configuration file `config.json`:

```json
{
  "server": {
    "url": "http://127.0.0.1:18890",
    "port": 18890,
    "title": "AgentFlow Sandbox",
    "session_ttl": 300
  },
  "resources": {
    "vm": {
      "enabled": true,
      "backend_class": "sandbox.server.backends.resources.vm.VMBackend"
    },
    "rag": {
      "enabled": true,
      "backend_class": "sandbox.server.backends.resources.rag.RAGBackend"
    },
    "bash": {
      "enabled": true,
      "backend_class": "sandbox.server.backends.resources.bash.BashBackend"
    }
  },
  "apis": {
    "websearch": {
      "serper_api_key": "${SERPER_API_KEY}"
    }
  }
}
```

### Inference Configuration

Create inference configuration `infer_config.json`:

```json
{
  "data_path": "benchmark/web_bench.jsonl",
  "output_dir": "results/web_infer",
  "model_name": "gpt-4.1-2025-04-14",
  "api_key": "your-api-key",
  "base_url": "https://api.openai.com/v1",
  "max_turns": 20,
  "available_tools": ["web-search", "web-visit"],
  "evaluate_results": true,
  "evaluation_metric": "contains_answer",
  "sandbox_server_url": "http://127.0.0.1:18890"
}
```

### Synthesis Configuration

Create synthesis configuration `synthesis_config.json`:

```json
{
  "seeds_file": "seeds/web/seeds.jsonl",
  "output_dir": "results/web_synthesis",
  "model_name": "gpt-4.1-2025-04-14",
  "api_key": "your-api-key",
  "base_url": "https://api.openai.com/v1",
  "max_depth": 10,
  "branching_factor": 2,
  "available_tools": ["web-search", "web-visit"],
  "sandbox_server_url": "http://127.0.0.1:18890"
}
```

## Quick Start Workflow

Complete workflow using WebAgent as an example:

### 1. Start Sandbox Server

```bash
./start_sandbox_server.sh --config configs/sandbox-server/web_config.json
```

### 2. Data Synthesis

```python
from synthesis import synthesize

synthesize(config_path="configs/synthesis/web_config.json")
```

### 3. Trajectory Collection

```python
from rollout import rollout

rollout(config_path="configs/trajectory/web_trajectory.json")
```

### 4. Model Inference & Evaluation

```python
from rollout import rollout

rollout(config_path="configs/infer/web_infer.json")
```

## Next Steps

- [First Sandbox](./first_sandbox.md) - Quick start with Sandbox
- [Session Management](./session_management.md) - Learn about Session mechanism
- [Rollout Inference & Evaluation](../rollout/overview.md) - Inference and evaluation guide
- [Synthesis Data Generation](../synthesis/overview.md) - Data synthesis guide
