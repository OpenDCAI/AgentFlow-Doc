---
title: Rollout Inference & Evaluation
createTime: 2025/02/04 10:00:00
icon: carbon:play-filled-alt
permalink: /en/guide/rollout/overview/
---

## Overview

The Rollout module is the inference and evaluation engine of AgentFlow. It is designed for batch-executing Agent tasks on benchmark datasets with automatic result evaluation. It provides a multi-layered API ranging from one-liner quick calls to fully configurable pipelines, supporting various evaluation metrics, parallel execution, and complete conversation trajectory recording.

---

## Quick Start

### One-Liner with `rollout()`

Use the `rollout()` function to complete the entire inference and evaluation workflow in a single call:

```python
from rollout import rollout

result = rollout(
    config_path="configs/rollout/rag_benchmark.json",
    data_path="benchmark/benchmark.jsonl"
)
```

### Quick Single-Question Test with `quick_rollout()`

For a quick inference test on a single question, use `quick_rollout()`:

```python
from rollout import quick_rollout

result = quick_rollout(
    "What is the capital of France?",
    tools=["web:search", "web:browse"],
    model_name="gpt-4.1-2025-04-14",
    api_key="sk-xxx",
    base_url="https://api.openai.com/v1",
    max_turns=10,
    sandbox_url="http://127.0.0.1:18890"
)

print(result["answer"])      # The model's answer
print(result["success"])     # Whether the task completed successfully
print(result["trajectory"])  # Full conversation trajectory
```

---

## Core API

### `rollout()`

All-in-one inference and evaluation entry point. Loads configuration, executes tasks, evaluates results, and returns a summary dictionary.

```python
def rollout(
    *,
    config_path: str,           # Path to configuration file (JSON/YAML)
    data_path: Optional[str] = None,     # Override benchmark data path
    output_dir: Optional[str] = None,    # Override output directory
    model_name: Optional[str] = None,    # Override model name
    max_tasks: Optional[int] = None,     # Limit the number of tasks
    task_ids: Optional[List[str]] = None,  # Specific task IDs to run
    evaluate: bool = True,       # Whether to evaluate results
    metric: Optional[str] = None,        # Override evaluation metric
) -> Dict[str, Any]
```

**Returns**: A `RolloutSummary` dictionary containing `benchmark_name`, `total_tasks`, `successful_tasks`, `failed_tasks`, `average_score`, `metric`, `total_time_seconds`, and other fields.

### `quick_rollout()`

Quick inference for a single question without a configuration file. Ideal for debugging and interactive testing.

```python
def quick_rollout(
    question: str,                       # The question to answer
    *,
    tools: Optional[List[str]] = None,   # List of available tools
    model_name: str = "gpt-4.1-2025-04-14",  # Model name
    api_key: str = "",                   # API key
    base_url: str = "",                  # API base URL
    max_turns: int = 10,                 # Maximum conversation turns
    sandbox_url: str = "http://127.0.0.1:18890",  # Sandbox server URL
) -> Dict[str, Any]
```

**Returns**: A dictionary with `question`, `answer`, `success`, `error`, and `trajectory` fields.

### `load_config()`

Load configuration from a JSON or YAML file.

```python
def load_config(config_path: str) -> RolloutConfig
```

Supports `.json`, `.yaml`, and `.yml` formats.

### `load_tasks()`

Load benchmark tasks from a file or list.

```python
def load_tasks(
    tasks_or_path: Union[str, List[Dict[str, Any]]]
) -> List[BenchmarkItem]
```

Accepts a file path (JSONL/JSON) or a list of task dictionaries directly.

---

## Full RolloutConfig Parameter Reference

`RolloutConfig` is the core configuration dataclass of the Rollout module. It supports loading from JSON/YAML files or creation from dictionaries.

### I/O Paths

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `data_path` | `Optional[str]` | `None` | Benchmark data file path (JSONL format) |
| `output_dir` | `Optional[str]` | `None` | Output directory for results |

### Model Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `model_name` | `str` | `"gpt-4.1-2025-04-14"` | Name of the model to use |
| `api_key` | `str` | `""` | Model API key |
| `base_url` | `str` | `""` | Model API base URL |

### Agent Execution Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `max_turns` | `int` | `100` | Maximum conversation turns per task |
| `max_retries` | `int` | `3` | Maximum retries per LLM call |
| `max_workers` | `int` | `1` | Maximum number of parallel workers |
| `available_tools` | `List[str]` | `[]` | List of available tools (e.g., `["vm:screenshot", "web:search"]`) |

### System Prompt

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `system_prompt` | `str` | `""` | Custom system prompt (uses built-in default if empty) |
| `system_prompt_file` | `Optional[str]` | `None` | Load system prompt from a file |

### Evaluation Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `evaluate_results` | `bool` | `True` | Whether to evaluate results |
| `evaluation_metric` | `str` | `"exact_match"` | Evaluation metric name |
| `evaluator_model_name` | `Optional[str]` | `None` | Model name for the evaluator (used with `llm_judgement`) |
| `evaluator_api_key` | `Optional[str]` | `None` | API key for the evaluator model |
| `evaluator_base_url` | `Optional[str]` | `None` | API base URL for the evaluator model |
| `evaluator_temperature` | `float` | `0.0` | Temperature for the evaluator model (range 0.0 - 2.0) |
| `evaluator_max_retries` | `int` | `3` | Maximum retries for evaluator calls |
| `evaluator_extra_params` | `Dict[str, Any]` | `{}` | Extra parameters for the evaluator |

### Resource Configuration (Sandbox)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `resource_types` | `List[str]` | `[]` | List of required resource types |
| `resource_init_configs` | `Dict[str, Dict[str, Any]]` | `{}` | Initialization configs for each resource type |

### Sandbox Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sandbox_server_url` | `str` | `"http://127.0.0.1:18890"` | Sandbox server URL |
| `sandbox_auto_start` | `bool` | `False` | Whether to auto-start the sandbox server |
| `sandbox_config_path` | `Optional[str]` | `None` | Path to sandbox configuration file |
| `sandbox_timeout` | `int` | `120` | Sandbox operation timeout in seconds |

### Benchmark Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `benchmark_name` | `Optional[str]` | `None` | Name of the benchmark |
| `number_of_tasks` | `Optional[int]` | `None` | Limit the number of tasks to run (for testing) |
| `task_ids` | `Optional[List[str]]` | `None` | Specific task IDs to run |
| `parallel` | `bool` | `False` | Whether to enable parallel execution |

### Result Saving

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `save_results` | `bool` | `True` | Whether to save inference results |
| `save_trajectories` | `bool` | `True` | Whether to save full conversation trajectories |
| `trajectory_only` | `bool` | `False` | Whether to save only minimal trajectory payload |
| `save_summary` | `bool` | `True` | Whether to save the summary file (`summary_<benchmark>_<timestamp>.json`) |

---

## Configuration File Example

Below is a complete JSON configuration file example:

```json
{
  "data_path": "benchmark/rag_benchmark.jsonl",
  "output_dir": "results/rag_eval",
  "model_name": "gpt-4.1-2025-04-14",
  "api_key": "sk-your-api-key",
  "base_url": "https://api.openai.com/v1",
  "max_turns": 50,
  "max_retries": 3,
  "max_workers": 4,
  "available_tools": ["web:search", "web:browse", "doc:read"],
  "system_prompt": "",
  "system_prompt_file": "prompts/rag_system.txt",
  "evaluate_results": true,
  "evaluation_metric": "f1_score",
  "evaluator_model_name": "gpt-4.1-2025-04-14",
  "evaluator_api_key": "sk-your-api-key",
  "evaluator_base_url": "https://api.openai.com/v1",
  "evaluator_temperature": 0.0,
  "evaluator_max_retries": 3,
  "resource_types": ["web", "doc"],
  "resource_init_configs": {
    "doc": {
      "content": {
        "seed_path": "/data/documents"
      }
    }
  },
  "sandbox_server_url": "http://127.0.0.1:18890",
  "sandbox_auto_start": false,
  "sandbox_timeout": 120,
  "benchmark_name": "rag_benchmark_v1",
  "number_of_tasks": null,
  "task_ids": null,
  "parallel": true,
  "save_results": true,
  "save_trajectories": true,
  "trajectory_only": false,
  "save_summary": true
}
```

---

## Evaluation Metrics

Rollout supports the following evaluation metrics, specified via the `evaluation_metric` configuration parameter:

| Metric | Description | Use Case |
|--------|-------------|----------|
| `exact_match` | Exact match: scores 1.0 if the predicted answer is identical to the ground truth, 0.0 otherwise | Tasks with a single definitive answer, such as factual QA |
| `f1_score` | F1 score based on token-level precision and recall | Tasks where the answer may contain partially correct content |
| `contains_answer` | Checks whether the predicted answer contains the ground truth | Generative answers that need to include key information |
| `numeric_match` | Extracts and compares numeric values | Math calculations, statistical questions |
| `llm_judgement` | Uses an LLM as a judge to evaluate answer quality, returning a score from 0.0 to 1.0 | Open-ended QA, evaluations requiring semantic understanding |
| `similarity` | Text similarity based on string similarity algorithms | Scenarios requiring fuzzy matching |

### LLM Judgement Configuration Example

When using the `llm_judgement` metric, you need to configure the evaluator model:

```json
{
  "evaluation_metric": "llm_judgement",
  "evaluator_model_name": "gpt-4.1-2025-04-14",
  "evaluator_api_key": "sk-your-evaluator-key",
  "evaluator_base_url": "https://api.openai.com/v1",
  "evaluator_temperature": 0.0,
  "evaluator_max_retries": 3,
  "evaluator_extra_params": {
    "max_tokens": 1024
  }
}
```

---

## Benchmark Data Format

Benchmark data uses JSONL (JSON Lines) format, with one task per line. Multiple field name aliases are supported for compatibility with different datasets.

### Standard Format

```jsonl
{"id": "task_001", "question": "What is the capital of France?", "answer": "Paris"}
{"id": "task_002", "question": "What is the chemical formula for water?", "answer": "H2O"}
{"id": "task_003", "question": "Calculate 15 * 27", "answer": "405"}
```

### Field Description

| Field | Aliases | Required | Description |
|-------|---------|----------|-------------|
| `id` | `task_id` | Yes | Unique task identifier |
| `question` | `query`, `input` | Yes | Question / input text |
| `answer` | `ground_truth`, `expected` | No | Ground truth answer (used for evaluation) |
| `kwargs` | - | No | Additional parameters passed to tools (e.g., `seed_path`) |

Any other fields are automatically placed into `metadata`.

### Example with Extra Parameters

```jsonl
{"id": "doc_001", "question": "What is the project deadline mentioned in the document?", "answer": "March 15, 2025", "kwargs": {"seed_path": "/data/docs/project_plan.pdf"}}
```

---

## Output Format

### Inference Results File (JSONL)

Each task's inference result is saved as a single JSON line with the following fields:

```jsonl
{"task_id": "task_001", "question": "What is the capital of France?", "predicted_answer": "Paris", "success": true, "ground_truth": "Paris", "score": 1.0, "trajectory": {"task_id": "task_001", "question": "...", "messages": [...], "tool_calls": [...], "final_answer": "Paris", "total_turns": 3, "success": true, "start_time": "2025-02-04T10:00:00", "end_time": "2025-02-04T10:00:15", "execution_time_ms": 15000}}
```

**Result Field Description**:

| Field | Type | Description |
|-------|------|-------------|
| `task_id` | `str` | Task ID |
| `question` | `str` | Original question |
| `predicted_answer` | `str` | Model's predicted answer |
| `success` | `bool` | Whether the task completed successfully |
| `ground_truth` | `str` | Ground truth answer |
| `score` | `float` | Evaluation score |
| `error` | `str` | Error message (on failure) |
| `trajectory` | `object` | Full conversation trajectory (messages, tool calls, etc.) |

### Evaluation Summary File (JSON)

After evaluation, a summary file `summary_<benchmark>_<timestamp>.json` is generated:

```json
{
  "benchmark_name": "rag_benchmark_v1",
  "total_tasks": 100,
  "successful_tasks": 95,
  "failed_tasks": 5,
  "average_score": 0.82,
  "metric": "f1_score",
  "total_time_seconds": 3600.5,
  "results_file": "results/rag_eval/results.jsonl",
  "evaluation_file": "results/rag_eval/evaluation.json",
  "timestamp": "2025-02-04T10:30:00"
}
```

---

## Complete Usage Workflow

### Step 1: Start the Sandbox Service

Rollout relies on the sandbox service for tool execution. Before running inference, start the sandbox:

```bash
# Start the sandbox service (default port 18890)
python -m sandbox.server --port 18890
```

Alternatively, set `sandbox_auto_start: true` in the configuration to let Rollout start it automatically.

### Step 2: Prepare the Configuration File

Create a JSON configuration file (e.g., `configs/rollout/my_benchmark.json`):

```json
{
  "data_path": "benchmark/my_benchmark.jsonl",
  "output_dir": "results/my_eval",
  "model_name": "gpt-4.1-2025-04-14",
  "api_key": "sk-your-api-key",
  "base_url": "https://api.openai.com/v1",
  "max_turns": 50,
  "available_tools": ["web:search", "web:browse"],
  "evaluate_results": true,
  "evaluation_metric": "f1_score",
  "resource_types": ["web"],
  "sandbox_server_url": "http://127.0.0.1:18890",
  "save_results": true,
  "save_trajectories": true,
  "save_summary": true
}
```

### Step 3: Prepare Benchmark Data

Create a benchmark data file in JSONL format:

```jsonl
{"id": "q001", "question": "What tool types does AgentFlow support?", "answer": "web, doc, vm, code"}
{"id": "q002", "question": "How do you configure the sandbox timeout?", "answer": "Set the sandbox_timeout parameter"}
```

### Step 4: Run Inference and Evaluation

```python
from rollout import rollout

# Option 1: Use configuration file (recommended)
summary = rollout(config_path="configs/rollout/my_benchmark.json")

# Option 2: Override specific parameters
summary = rollout(
    config_path="configs/rollout/my_benchmark.json",
    data_path="benchmark/another_dataset.jsonl",
    model_name="gpt-4.1-2025-04-14",
    max_tasks=10,       # Run 10 tasks first as a test
    evaluate=True,
    metric="exact_match"
)

# View results
print(f"Total tasks: {summary['total_tasks']}")
print(f"Successful tasks: {summary['successful_tasks']}")
print(f"Average score: {summary['average_score']}")
print(f"Results file: {summary['results_file']}")
```

### Step 5: Review Results

After inference completes, the output directory contains the following files:

```
results/my_eval/
  ├── results.jsonl                          # Detailed inference results for each task
  ├── evaluation.json                        # Evaluation details
  └── summary_my_benchmark_20250204T103000.json  # Run summary
```

### Advanced Usage: Programmatic Control

For finer-grained control, you can use the lower-level API directly:

```python
from rollout import load_config, load_tasks
from rollout.core.runner import AgentRunner
import asyncio

async def custom_run():
    # Load config and tasks
    config = load_config("configs/rollout/my_benchmark.json")
    tasks = load_tasks("benchmark/my_benchmark.jsonl")

    # Create and start the Runner
    runner = AgentRunner(config, worker_id="custom_runner")
    await runner.start()

    try:
        for task in tasks:
            result = await runner.run_task(task)
            print(f"Task {result.task_id}: {result.predicted_answer}")
            print(f"  Score: {result.score}, Success: {result.success}")
    finally:
        await runner.stop()

asyncio.run(custom_run())
```
