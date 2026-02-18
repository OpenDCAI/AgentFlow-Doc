---
title: Introduction
createTime: 2025/02/04 10:00:00
icon: mdi:tooloutline
permalink: /en/guide/intro/
---

# Introduction

**AgentFlow** is the **first unified Agent data synthesis framework** that generates high-quality training and evaluation data across heterogeneous agent environments -- including RAG, MM-Doc, Deep Research, GUI, Text2SQL, Data Analysis, Embodied Agents, and more.

It provides a unified, extensible, all-in-one environment for synthesizing agent trajectories, reasoning traces, tool interactions, and environment feedback. AgentFlow also explores the underlying mechanisms of agent data synthesis and model training, enabling the development of industrial-grade agentic foundation models that operate seamlessly across domains.

> **One framework. All agent worlds.**

## Core Highlights

### Unified Agent Data Synthesis Paradigm

AgentFlow synthesizes complex agent training data through a three-stage pipeline:

1. **Trajectory Sampling** -- An LLM-driven agent iteratively explores a sandbox environment starting from seed inputs. At each step it proposes a tool call, executes it, and records the observation, building a branching trajectory tree with concurrent expansion and action de-duplication.
2. **Trajectory Selection** -- All root-to-leaf paths are scored by depth, information richness, and tool diversity, then selected with configurable strategies to ensure high-quality content.
3. **QA Synthesis** -- For each selected path the LLM generates a multi-hop, factoid QA pair grounded in the collected observations, with built-in quality checks.

With just a few lines of code you can synthesize complex agent training data across any supported environment.

### All-in-One Sandbox Environment

The Sandbox module provides standardized tool invocation and environment interaction for large-scale Agent trajectory data synthesis. It supports multiple resource backends through a modular design:

| Backend | Type | Description |
|---------|------|-------------|
| **VM** | Session Resource | Virtual machine desktop automation (screenshot, click, type, scroll) |
| **RAG** | Shared Resource | Document retrieval and knowledge base search |
| **Bash** | Session Resource | Command line interaction and shell execution |
| **Browser** | Hybrid Resource | Web page automation and navigation |
| **Code Executor** | Session Resource | Sandboxed code execution for Python/SQL/data analysis |
| **WebSearch** | API Tool | Web search via Serper API and page visit via Jina Reader |

Each backend provides complete lifecycle management (warmup, initialize, cleanup, shutdown) and supports multi-worker parallel execution with full resource isolation.

### Rollout Inference & Evaluation

The Rollout module drives agent execution on benchmarks and real-world tasks. It provides:

- **Configurable agent execution** -- Set model, tools, system prompts, max turns, and parallel workers through a single JSON/YAML config file.
- **Built-in evaluation** -- Supports multiple metrics including `exact_match`, `f1_score`, `contains_answer`, `numeric_match`, `similarity`, and `llm_judgement`.
- **Trajectory recording** -- Full conversation trajectories are saved for analysis and debugging.
- **Quick single-question mode** -- Run a single question through an agent with `quick_rollout()` for rapid testing.

### Extensible Architecture

AgentFlow is designed for extensibility at every layer:

- **Lightweight API Tools** -- Register new tools with the `@register_api_tool` decorator for quick integration.
- **Heavyweight Backends** -- Inherit from the `Backend` base class to add full-lifecycle resource management.
- **Configurable Pipelines** -- Both Synthesis and Rollout pipelines are driven by dataclass-based configs (`SynthesisConfig`, `RolloutConfig`) that support JSON and YAML formats.

## Quick Start

### Data Synthesis

Synthesize QA training data from seed inputs using the three-stage pipeline:

```python
from synthesis import synthesize

synthesize(config_path="configs/synthesis/web_config.json")
```

The `SynthesisConfig` controls trajectory sampling parameters (`max_depth`, `branching_factor`, `depth_threshold`), trajectory selection parameters (`min_depth`, `max_selected_traj`, `path_similarity_threshold`), model settings, and sandbox connection.

### Rollout Inference & Evaluation

Run agent inference on a benchmark dataset and evaluate the results:

```python
from rollout import rollout

results = rollout(
    config_path="configs/rollout/rag_benchmark.json",
    data_path="benchmark/benchmark.jsonl",
    evaluate=True,
    metric="f1_score"
)
```

For quick single-question testing:

```python
from rollout import quick_rollout

result = quick_rollout(
    "What is the capital of France?",
    tools=["rag:search"],
    model_name="gpt-4.1-2025-04-14",
    sandbox_url="http://127.0.0.1:18890"
)
print(result["answer"])
```

### Sandbox Environment

Launch the sandbox server and interact with backends programmatically:

```bash
./sandbox-server.sh --config configs/sandbox-server/web_config.json \
    --port 18890 \
    --host 0.0.0.0
```

```python
from sandbox import Sandbox
import asyncio

async def main():
    async with Sandbox() as sandbox:
        # Create a VM session
        await sandbox.create_session("vm")

        # Take a screenshot
        result = await sandbox.execute("vm:screenshot", {})
        print(result)

        # Perform a click action
        await sandbox.execute("vm:click", {"x": 100, "y": 200})

asyncio.run(main())
```

## Next Steps

- [Architecture Design](./architecture.md) -- Learn about the system architecture of all three modules
- [Installation Guide](../quickstart/install.md) -- Set up your environment
- [First Sandbox](../quickstart/first_sandbox.md) -- Quick start tutorial
