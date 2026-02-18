---
title: Architecture Design
createTime: 2025/02/04 10:00:00
icon: material-symbols:auto-transmission-sharp
permalink: /en/guide/architecture/
---

# Architecture Design

This document describes the overall architecture of AgentFlow, covering all three major modules: **Synthesis**, **Rollout**, and **Sandbox**.

## Architecture Overview

```
+=========================================================================+
|                          AgentFlow Framework                            |
+=========================================================================+
|                                                                         |
|  +---------------------------+    +------------------------------+      |
|  |      Synthesis Module     |    |       Rollout Module         |      |
|  |---------------------------|    |------------------------------|      |
|  | synthesize()              |    | rollout()                    |      |
|  | load_config()             |    | quick_rollout()              |      |
|  | load_seeds()              |    | load_config()                |      |
|  |                           |    | load_tasks()                 |      |
|  |  +---------------------+  |    |  +------------------------+  |      |
|  |  | SynthesisPipeline   |  |    |  | RolloutPipeline        |  |      |
|  |  |---------------------|  |    |  |------------------------|  |      |
|  |  | Sampler             |  |    |  | AgentRunner            |  |      |
|  |  | Selector            |  |    |  | Evaluator              |  |      |
|  |  | Synthesizer         |  |    |  | BenchmarkItem          |  |      |
|  |  | Worker              |  |    |  +------------------------+  |      |
|  |  +---------------------+  |    |                              |      |
|  |                           |    |  +------------------------+  |      |
|  |  +---------------------+  |    |  | RolloutConfig          |  |      |
|  |  | SynthesisConfig     |  |    |  |------------------------|  |      |
|  |  |---------------------|  |    |  | Model settings         |  |      |
|  |  | Sampling params     |  |    |  | Evaluation settings    |  |      |
|  |  | Selection params    |  |    |  | Sandbox connection     |  |      |
|  |  | Model settings      |  |    |  | Task configuration     |  |      |
|  |  | Sandbox connection  |  |    |  +------------------------+  |      |
|  |  +---------------------+  |    |                              |      |
|  +---------------------------+    +------------------------------+      |
|              |                                |                         |
|              |     Sandbox Server URL         |                         |
|              +---------------+----------------+                         |
|                              |                                          |
|  +---------------------------------------------------------------+     |
|  |                      Sandbox Module                            |     |
|  |---------------------------------------------------------------|     |
|  |                                                                |     |
|  |  +------------------+          +----------------------------+  |     |
|  |  | Sandbox (Facade) |  HTTP    | HTTPServiceServer (FastAPI)|  |     |
|  |  |   Client Side    | -------> |       Server Side          |  |     |
|  |  +------------------+          +----------------------------+  |     |
|  |                                   |                            |     |
|  |                    +--------------+--------------+             |     |
|  |                    |                             |             |     |
|  |             +------+------+            +---------+--------+   |     |
|  |             | ToolExecutor|            | ResourceRouter   |   |     |
|  |             +------+------+            +---------+--------+   |     |
|  |                    |                             |             |     |
|  |  +-----------------------------------------------------+     |     |
|  |  |              Backend System                          |     |     |
|  |  |  +------+ +-----+ +------+ +---------+ +----------+ |     |     |
|  |  |  |  VM  | | RAG | | Bash | | Browser | | CodeExec | |     |     |
|  |  |  +------+ +-----+ +------+ +---------+ +----------+ |     |     |
|  |  |  +----------+ +--------+                             |     |     |
|  |  |  | WebSearch| | Doc    |  ... (extensible)           |     |     |
|  |  |  +----------+ +--------+                             |     |     |
|  |  +-----------------------------------------------------+     |     |
|  +---------------------------------------------------------------+     |
+=========================================================================+
```

## Module Details

### Synthesis Module

The Synthesis module implements the three-stage data synthesis pipeline: Trajectory Sampling, Trajectory Selection, and QA Synthesis. It is the primary interface for generating agent training data.

#### Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| **`synthesize()`** | `synthesis/api.py` | One-call public API; loads config, loads seeds, runs the full pipeline |
| **`load_config()`** | `synthesis/api.py` | Loads `SynthesisConfig` from JSON or YAML files |
| **`load_seeds()`** | `synthesis/api.py` | Loads seed data from JSONL files, string lists, or dict lists |
| **SynthesisPipeline** | `synthesis/pipeline.py` | Orchestrates the three-stage pipeline end to end |
| **Sampler** | `synthesis/core/sampler.py` | Builds branching trajectory trees via LLM-driven exploration |
| **Selector** | `synthesis/core/selector.py` | Scores and selects high-quality root-to-leaf paths |
| **Synthesizer** | `synthesis/core/synthesizer.py` | Generates multi-hop QA pairs from selected trajectories |
| **Worker** | `synthesis/core/worker.py` | Manages parallel seed processing workers |
| **SynthesisConfig** | `synthesis/core/config.py` | Dataclass configuration with validation and serialization |

#### Configuration Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `seeds_file` | `None` | Path to seed data file (JSONL) |
| `output_dir` | `None` | Output directory for synthesized data |
| `available_tools` | `[]` | List of sandbox tools the agent can use |
| `model_name` | `"gpt-4.1-2025-04-14"` | LLM model for trajectory sampling and QA generation |
| `max_depth` | `5` | Maximum depth of the trajectory tree |
| `branching_factor` | `2` | Number of branches at each tree node |
| `depth_threshold` | `3` | Depth threshold for branching behavior |
| `min_depth` | `2` | Minimum trajectory depth for selection |
| `max_selected_traj` | `3` | Maximum number of selected trajectories per seed |
| `path_similarity_threshold` | `0.7` | Deduplication threshold for path similarity |
| `number_of_seed` | `None` | Limit on number of seeds to process |
| `sandbox_server_url` | `"http://127.0.0.1:18890"` | URL of the sandbox server |
| `sandbox_auto_start` | `True` | Whether to auto-start the sandbox server |

---

### Rollout Module

The Rollout module drives agent inference on benchmark tasks and provides built-in evaluation. It supports both batch execution on datasets and quick single-question mode.

#### Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| **`rollout()`** | `rollout/api.py` | One-call public API; loads config, applies overrides, runs the pipeline |
| **`quick_rollout()`** | `rollout/api.py` | Single-question mode for rapid testing |
| **`load_config()`** | `rollout/api.py` | Loads `RolloutConfig` from JSON or YAML files |
| **`load_tasks()`** | `rollout/api.py` | Loads benchmark tasks from file or list |
| **RolloutPipeline** | `rollout/pipeline.py` | Orchestrates task execution, evaluation, and result saving |
| **AgentRunner** | `rollout/core/runner.py` | Executes individual agent tasks with tool calls against the sandbox |
| **Evaluator** | `rollout/core/evaluator.py` | Scores agent outputs with configurable metrics |
| **BenchmarkItem** | `rollout/core/models.py` | Data model for benchmark tasks |
| **RolloutConfig** | `rollout/core/config.py` | Dataclass configuration with validation and serialization |

#### Configuration Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `data_path` | `None` | Path to benchmark data file (JSONL) |
| `output_dir` | `None` | Output directory for results |
| `model_name` | `"gpt-4.1-2025-04-14"` | LLM model for agent inference |
| `max_turns` | `100` | Maximum conversation turns per task |
| `max_retries` | `3` | Maximum retries per LLM call |
| `max_workers` | `1` | Number of parallel workers |
| `available_tools` | `[]` | List of sandbox tools the agent can use |
| `system_prompt` | `""` | Custom system prompt for the agent |
| `evaluate_results` | `True` | Whether to run evaluation after inference |
| `evaluation_metric` | `"exact_match"` | Metric: `exact_match`, `f1_score`, `contains_answer`, `numeric_match`, `similarity`, `llm_judgement` |
| `sandbox_server_url` | `"http://127.0.0.1:18890"` | URL of the sandbox server |
| `sandbox_auto_start` | `False` | Whether to auto-start the sandbox server |
| `save_trajectories` | `True` | Whether to save full conversation trajectories |
| `parallel` | `False` | Whether to enable parallel task execution |

---

### Sandbox Module

The Sandbox module provides the unified execution environment that both the Synthesis and Rollout modules depend on. It manages resource backends, session lifecycles, and tool execution through a client-server architecture.

#### Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| **Sandbox** (Facade) | `sandbox/sandbox.py` | Unified client-side entry point; wraps HTTP client; supports sync/async |
| **HTTPServiceClient** | `sandbox/client.py` | HTTP request wrapper with worker ID management and auto retry |
| **HTTPServiceServer** | `sandbox/server/app.py` | FastAPI server; holds backends; registers tools; dispatches requests |
| **ToolExecutor** | `sandbox/server/core/tool_executor.py` | Parses resource-type prefixes, injects sessions, manages temporary sessions |
| **ResourceRouter** | `sandbox/server/core/resource_router.py` | Session lifecycle management; worker resource isolation |
| **Backend** (base) | `sandbox/server/backends/base.py` | Abstract base class for all resource backends |
| **VMBackend** | `sandbox/server/backends/resources/vm.py` | Virtual machine desktop automation |
| **RAGBackend** | `sandbox/server/backends/resources/rag.py` | Document retrieval service |
| **WebSearch** | `sandbox/server/backends/tools/websearch.py` | Web search and page visit API tools |
| **Doc Tool** | `sandbox/server/backends/tools/doc_tool.py` | Document processing API tool |
| **Text2SQL Tool** | `sandbox/server/backends/tools/text2sql_tool.py` | SQL database query API tool |
| **DS Tool** | `sandbox/server/backends/tools/ds_tool.py` | Data science / analysis API tool |

#### Backend Types

| Backend | Resource Type | Session Model | Description |
|---------|---------------|---------------|-------------|
| **VM** | Session | One VM per worker | Desktop automation via screenshot, click, type, scroll |
| **RAG** | Shared | Shared across workers | Document retrieval and knowledge base search |
| **Bash** | Session | One shell per worker | Command line interaction |
| **Browser** | Hybrid | Session + shared pool | Web page automation and navigation |
| **Code Executor** | Session | One sandbox per worker | Sandboxed code execution |
| **WebSearch** | API Tool | Stateless | Web search (Serper) and page visit (Jina Reader) |

---

## Data Flow

### Synthesis Pipeline Data Flow

```
Seeds (JSONL)
    |
    v
+-------------------+
| SynthesisPipeline  |
+-------------------+
    |
    |  Stage 1: Trajectory Sampling
    |  +------------------------------------------+
    |  | Sampler                                   |
    |  |  seed --> LLM proposes tool call           |
    |  |       --> Sandbox executes tool             |
    |  |       --> Observation recorded              |
    |  |       --> Branch & repeat (up to max_depth) |
    |  |  Result: trajectory tree per seed           |
    |  +------------------------------------------+
    |
    |  Stage 2: Trajectory Selection
    |  +------------------------------------------+
    |  | Selector                                  |
    |  |  Enumerate root-to-leaf paths              |
    |  |  Score by depth, richness, diversity       |
    |  |  Deduplicate (path_similarity_threshold)   |
    |  |  Select top-k (max_selected_traj)          |
    |  +------------------------------------------+
    |
    |  Stage 3: QA Synthesis
    |  +------------------------------------------+
    |  | Synthesizer                               |
    |  |  Selected trajectory --> LLM generates QA  |
    |  |  Quality checks applied                    |
    |  |  Result: multi-hop QA pairs                |
    |  +------------------------------------------+
    |
    v
Output (JSONL: trajectories + QA pairs)
```

### Rollout Pipeline Data Flow

```
Benchmark Data (JSONL)     Config (JSON/YAML)
    |                           |
    v                           v
+-----------------------------------------------+
| RolloutPipeline                                |
+-----------------------------------------------+
    |
    |  Task Execution
    |  +------------------------------------------+
    |  | AgentRunner (per worker)                  |
    |  |  Load task (BenchmarkItem)                |
    |  |  Initialize sandbox session               |
    |  |  Loop (up to max_turns):                  |
    |  |    LLM generates response/tool call       |
    |  |    Sandbox executes tool                   |
    |  |    Record observation in trajectory        |
    |  |    If final answer: break                  |
    |  +------------------------------------------+
    |
    |  Evaluation
    |  +------------------------------------------+
    |  | Evaluator                                 |
    |  |  Compare predicted answer vs ground truth |
    |  |  Apply metric (EM / F1 / LLM judge / ...) |
    |  |  Aggregate scores                          |
    |  +------------------------------------------+
    |
    v
Results (JSON: answers + scores + trajectories)
```

### Sandbox Execution Flow

```
Client (Synthesis/Rollout)
    |
    |  POST /session/create  { worker_id, resource_type, config }
    |  POST /execute          { worker_id, action, params }
    |  POST /session/destroy  { worker_id, resource_type }
    |
    v
+---------------------------------------------------------------+
| HTTPServiceServer (FastAPI)                                    |
|                                                                |
|   Request --> ToolExecutor                                     |
|                  |                                              |
|                  +--> Parse "resource_type:action" prefix       |
|                  +--> ResourceRouter: locate/create session     |
|                  +--> Backend: execute tool method              |
|                  +--> Return standardized JSON response         |
|                                                                |
+---------------------------------------------------------------+
```

## Lifecycle Management

### Backend Lifecycle

| Method | Trigger | Purpose |
|--------|---------|---------|
| `warmup()` | Server startup | Warm up shared resources (e.g., connection pools, model loading) |
| `initialize()` | `POST /session/create` | Allocate worker-specific resources (e.g., create VM, open shell) |
| `cleanup()` | `POST /session/destroy` | Reclaim worker resources (e.g., destroy VM, close shell) |
| `shutdown()` | Server shutdown | Release all shared resources and clean up globally |

### Session Lifecycle

| Phase | Description |
|-------|-------------|
| **Explicit Session** | Created via `create_session()`; persists across multiple `execute()` calls; destroyed via `destroy_session()` |
| **Temporary Session** | Auto-created when `execute()` is called without a prior session; destroyed immediately after the call returns |
| **Worker Isolation** | Each worker ID has independent sessions; no cross-worker state leakage |

## Project Structure

```
AgentFlow/
|-- synthesis/                 # Synthesis Module
|   |-- api.py                 #   Public API: synthesize(), load_config(), load_seeds()
|   |-- pipeline.py            #   SynthesisPipeline orchestrator
|   +-- core/
|       |-- config.py          #   SynthesisConfig dataclass
|       |-- sampler.py         #   Trajectory tree sampling
|       |-- selector.py        #   Trajectory path selection
|       |-- synthesizer.py     #   QA pair generation
|       |-- worker.py          #   Parallel seed processing
|       |-- models.py          #   Data models
|       +-- utils.py           #   Utility functions
|
|-- rollout/                   # Rollout Module
|   |-- api.py                 #   Public API: rollout(), quick_rollout(), load_config()
|   |-- pipeline.py            #   RolloutPipeline orchestrator
|   +-- core/
|       |-- config.py          #   RolloutConfig dataclass
|       |-- runner.py          #   AgentRunner for task execution
|       |-- evaluator.py       #   Result evaluation with multiple metrics
|       |-- models.py          #   BenchmarkItem and result models
|       +-- utils.py           #   Utility functions
|
|-- sandbox/                   # Sandbox Module
|   |-- sandbox.py             #   Sandbox facade (client-side entry point)
|   |-- client.py              #   HTTPServiceClient
|   |-- protocol.py            #   Protocol definitions
|   |-- result_formatter.py    #   Response formatting
|   |-- server/
|   |   |-- app.py             #   HTTPServiceServer (FastAPI)
|   |   +-- core/
|   |       |-- tool_executor.py    # Tool execution engine
|   |       +-- resource_router.py  # Session and resource management
|   +-- server/backends/
|       |-- base.py            #   Backend abstract base class
|       |-- resources/
|       |   |-- vm.py          #   VM desktop backend
|       |   +-- rag.py         #   RAG retrieval backend
|       +-- tools/
|           |-- websearch.py   #   WebSearch API tool
|           |-- doc_tool.py    #   Document processing tool
|           |-- text2sql_tool.py   # SQL query tool
|           +-- ds_tool.py     #   Data science tool
|
|-- configs/                   # Configuration Files
|   |-- sandbox-server/        #   Sandbox server configs
|   |-- synthesis/             #   Synthesis pipeline configs
|   |-- trajectory/            #   Trajectory rollout configs
|   +-- infer/                 #   Inference configs
|
|-- benchmark/                 # Benchmark Datasets
|-- seeds/                     # Seed Data
+-- examples/                  # Example Scripts
```
