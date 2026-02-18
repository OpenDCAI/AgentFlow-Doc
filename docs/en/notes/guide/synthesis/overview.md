---
title: Synthesis Data Generation
createTime: 2025/02/04 10:00:00
icon: carbon:data-enrichment
permalink: /en/guide/synthesis/overview/
---

## Overview

The Synthesis module is AgentFlow's data generation engine. It automatically produces high-quality multi-hop QA training data through a **three-stage pipeline**. An LLM Agent autonomously explores a sandbox environment, builds branching trajectory trees, then the system selects the best paths and synthesizes question-answer pairs from them.

## Quick Start

Launch the full synthesis pipeline with a single line of code:

```python
from synthesis import synthesize

synthesize(config_path="config.json")
```

You can also pass seed data directly at call time:

```python
synthesize(
    config_path="config.json",
    seeds=["Research the top 10 countries by GDP in 2024", "Analyze a company's financial reports"]
)
```

## Three-Stage Pipeline

Synthesis uses a three-stage pipeline architecture, with each stage serving a distinct purpose:

```
Seed Data
│
├── Stage 1: Trajectory Sampling
│   │
│   │   LLM Agent explores sandbox, builds branching trajectory tree
│   │
│   │           [Root]
│   │          /      \
│   │      [Node A]  [Node B]
│   │       /   \        \
│   │   [A-1] [A-2]    [B-1]
│   │    /       \        \
│   │ [A-1-1] [A-2-1]  [B-1-1]
│   │
│   ▼
├── Stage 2: Trajectory Selection
│   │
│   │   Scores and filters all root-to-leaf paths
│   │   - Filter by depth (min_depth)
│   │   - Score by information density
│   │   - Deduplicate by path similarity (path_similarity_threshold)
│   │
│   ▼
└── Stage 3: QA Synthesis
    │
    │   Generates multi-hop QA pairs from selected trajectories
    │   - Includes reasoning steps (reasoning_steps >= 3)
    │   - Answer leakage detection
    │   - Question verbosity detection
    │
    ▼
  Output: synthesized_qa.jsonl + trajectories.jsonl
```

### Stage 1: Trajectory Sampling

Starting from seed data, the LLM Agent autonomously explores the sandbox environment using available tools (e.g., search, browse, code execution). At each node, the Agent can produce multiple branching actions, forming a trajectory tree.

**Core Concepts:**
- **TrajectoryNode**: A single node in the trajectory tree, containing `observation`, `intent`, and `action`
- **Trajectory Tree**: A tree structure produced through multi-step exploration starting from the root node

**Key Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `max_depth` | `int` | `5` | Maximum exploration depth of the trajectory tree |
| `branching_factor` | `int` | `2` | Number of branches produced at each node |
| `depth_threshold` | `int` | `3` | Depth threshold for increasing branching exploration |
| `available_tools` | `List[str]` | `[]` | List of tools available to the Agent |
| `sampling_tips` | `str` | `""` | Guidance prompt for Agent exploration |

### Stage 2: Trajectory Selection

Extracts all root-to-leaf paths from the trajectory tree, then selects the most informative and diverse trajectories through multi-dimensional scoring and deduplication.

**Selection Process:**
1. Find all leaf nodes
2. Filter by minimum depth (`min_depth`)
3. Trace back from leaf to root to build complete paths
4. Score by information density (normalized average observation text length)
5. Deduplicate by path similarity to avoid redundant trajectories

**Key Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `min_depth` | `int` | `2` | Minimum depth for valid trajectories |
| `max_selected_traj` | `int` | `3` | Maximum number of trajectories selected per seed |
| `path_similarity_threshold` | `float` | `0.7` | Path similarity threshold (paths above this value are considered duplicates) |

### Stage 3: QA Synthesis

Based on the selected trajectories, the LLM generates multi-hop QA pairs. Each QA pair includes a question, an answer, and a chain of reasoning steps.

**Quality Assurance Mechanisms:**
- Up to 3 retry attempts
- Minimum 3 reasoning steps required
- Answer leakage detection (the answer must not appear in the question)
- Question verbosity detection (the question must not be overly verbose)

**Key Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `synthesis_tips` | `str` | `""` | Guidance prompt for QA generation |
| `qa_examples` | `List[Dict]` | `[]` | Example QA pairs to guide generation style |

## Core API

### `synthesize()`

One-call wrapper to launch the complete synthesis pipeline.

```python
def synthesize(
    *,
    config_path: str,
    seeds: Optional[Union[str, List[str], List[Dict[str, Any]]]] = None,
) -> None
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `config_path` | `str` | Path to configuration file (supports `.json` / `.yaml` / `.yml`) |
| `seeds` | `str \| List[str] \| List[Dict] \| None` | Seed data: can be a JSONL file path, a list of strings, or a list of dicts. If `None`, loads from `seeds_file` in the config |

### `load_config()`

Load synthesis configuration from a file.

```python
def load_config(config_path: str) -> SynthesisConfig
```

Supports both JSON and YAML configuration file formats.

### `load_seeds()`

Load seed data from various sources.

```python
def load_seeds(
    seeds_or_path: Union[str, List[str], List[Dict[str, Any]]]
) -> List[Dict[str, Any]]
```

**Supported Input Formats:**
- `str`: JSONL file path, or a single seed string
- `List[str]`: List of strings, automatically converted to `{"content": ..., "kwargs": {}}`
- `List[Dict]`: List of dicts, used as-is

## Full Configuration Parameter Table (SynthesisConfig)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| **I/O Paths** | | | |
| `seeds_file` | `Optional[str]` | `None` | Path to seed data file (JSONL format) |
| `output_dir` | `Optional[str]` | `None` | Output directory path (defaults to `synthesis_results`) |
| **Tools & Prompts** | | | |
| `available_tools` | `List[str]` | `[]` | List of tools available to the Agent |
| `qa_examples` | `List[Dict[str, str]]` | `[]` | Example QA pairs to guide generation |
| `sampling_tips` | `str` | `""` | Exploration stage guidance prompt (accepts string or list of strings) |
| `synthesis_tips` | `str` | `""` | Synthesis stage guidance prompt (accepts string or list of strings) |
| `seed_description` | `str` | `""` | Description of the seed data |
| **Model Configuration** | | | |
| `model_name` | `str` | `"gpt-4.1-2025-04-14"` | LLM model name to use |
| `api_key` | `str` | `""` | API key |
| `base_url` | `str` | `""` | API base URL |
| **Trajectory Sampling** | | | |
| `max_depth` | `int` | `5` | Maximum depth of the trajectory tree |
| `branching_factor` | `int` | `2` | Number of branches per node |
| `depth_threshold` | `int` | `3` | Depth threshold |
| **Trajectory Selection** | | | |
| `min_depth` | `int` | `2` | Minimum depth for valid trajectories |
| `max_selected_traj` | `int` | `3` | Maximum trajectories selected per seed |
| `path_similarity_threshold` | `float` | `0.7` | Path similarity deduplication threshold |
| **Seed Processing** | | | |
| `number_of_seed` | `Optional[int]` | `None` | Maximum number of seeds to process (`None` means process all) |
| **Resource Configuration** | | | |
| `resource_types` | `List[str]` | `[]` | List of sandbox resource types |
| `resource_init_configs` | `Dict[str, Dict]` | `{}` | Resource initialization configurations |
| **Sandbox Configuration** | | | |
| `sandbox_server_url` | `str` | `"http://127.0.0.1:18890"` | Sandbox server URL |
| `sandbox_auto_start` | `bool` | `True` | Whether to auto-start the sandbox |
| `sandbox_config_path` | `Optional[str]` | `None` | Sandbox configuration file path |
| `sandbox_timeout` | `int` | `120` | Sandbox operation timeout in seconds |

## Configuration File Example

### JSON Format

```json
{
  "seeds_file": "seeds.jsonl",
  "output_dir": "output/synthesis_results",

  "available_tools": ["web_search", "browse_url", "python_execute"],

  "qa_examples": [
    {
      "question": "What are the top three countries by GDP in 2024, and what is each country's GDP?",
      "answer": "The top three countries by GDP in 2024 are: 1. United States (~$29.17 trillion), 2. China (~$18.53 trillion), 3. Germany (~$4.59 trillion)."
    }
  ],

  "sampling_tips": "Use multiple tools for in-depth exploration. Verify information at each step.",
  "synthesis_tips": "Generated questions should require multi-step reasoning to answer. Avoid simple factual lookups.",
  "seed_description": "Each seed represents a topic that requires in-depth research.",

  "model_name": "gpt-4.1-2025-04-14",
  "api_key": "your-api-key",
  "base_url": "https://api.openai.com/v1",

  "max_depth": 5,
  "branching_factor": 2,
  "depth_threshold": 3,

  "min_depth": 2,
  "max_selected_traj": 3,
  "path_similarity_threshold": 0.7,

  "number_of_seed": null,

  "resource_types": ["web"],
  "resource_init_configs": {},

  "sandbox_server_url": "http://127.0.0.1:18890",
  "sandbox_auto_start": true,
  "sandbox_config_path": null,
  "sandbox_timeout": 120
}
```

## Seed Data Format

Seed data uses JSONL format (one JSON object per line). Each record must contain a `content` field and may optionally include a `kwargs` field:

```jsonl
{"content": "Research AI applications in healthcare in 2024", "kwargs": {"domain": "healthcare", "year": 2024}}
{"content": "Analyze Tesla's Q4 2023 earnings report key metrics", "kwargs": {"company": "Tesla"}}
{"content": "Compare Python and Rust for web backend development", "kwargs": {}}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | `str` | Yes | Seed content, used as the starting point for Agent exploration |
| `kwargs` | `Dict[str, Any]` | No | Additional parameters passed to the sampling process (defaults to `{}`) |

## Output Format

After synthesis completes, two files are generated in the `output_dir` directory:

### `synthesized_qa.jsonl`

One synthesized QA pair per line:

```jsonl
{
  "question": "Among the top three countries by GDP in 2024, which had the fastest GDP growth rate, and what was that rate?",
  "answer": "Based on 2024 data, India had the fastest GDP growth rate at 6.8%...",
  "trajectory_id": "traj_abc123",
  "source_id": "seed_001",
  "qa_id": "traj_abc123_qa_0",
  "reasoning_steps": [
    {"step": "First, look up the 2024 global GDP rankings"},
    {"step": "Identify the top three countries: USA, China, Germany"},
    {"step": "Look up the GDP growth rate for each of the three countries"},
    {"step": "Compare growth rates and draw the conclusion"}
  ],
  "metadata": {}
}
```

### `trajectories.jsonl`

One trajectory record per line:

```jsonl
{
  "trajectory_id": "traj_abc123",
  "source_id": "seed_001",
  "seed_data": "Research 2024 global GDP rankings",
  "total_depth": 4,
  "nodes": [
    {
      "node_id": "node_001",
      "observation": "Starting point: Research 2024 global GDP rankings",
      "intent": "Initialize exploration",
      "action": null,
      "parent_id": null,
      "children_ids": ["node_002", "node_003"],
      "depth": 0
    },
    {
      "node_id": "node_002",
      "observation": "Search results show the 2024 global GDP ranking...",
      "intent": "Search for global GDP ranking data",
      "action": {"tool": "web_search", "args": {"query": "2024 global GDP ranking"}},
      "parent_id": "node_001",
      "children_ids": ["node_004"],
      "depth": 1
    }
  ]
}
```

## Complete Usage Workflow

### 1. Prepare Seed Data

Create a `seeds.jsonl` file:

```jsonl
{"content": "Research AI applications in healthcare", "kwargs": {"domain": "healthcare"}}
{"content": "Analyze the global electric vehicle market landscape in 2024", "kwargs": {}}
```

### 2. Write Configuration File

Create `config.json` (see the configuration file example above).

### 3. Run Synthesis

```python
from synthesis import synthesize

# Option 1: Use seeds_file from the config
synthesize(config_path="config.json")

# Option 2: Pass seed file path directly
synthesize(
    config_path="config.json",
    seeds="seeds.jsonl"
)

# Option 3: Pass a list of strings
synthesize(
    config_path="config.json",
    seeds=["Research topic A", "Research topic B"]
)

# Option 4: Pass a list of dicts
synthesize(
    config_path="config.json",
    seeds=[
        {"content": "Research topic A", "kwargs": {"key": "value"}},
        {"content": "Research topic B", "kwargs": {}}
    ]
)
```

### 4. Advanced Usage: Custom Pipeline

```python
from synthesis.api import load_config, load_seeds
from synthesis.pipeline import SynthesisPipeline

config = load_config("config.json")
seeds = load_seeds("seeds.jsonl")

pipeline = SynthesisPipeline(config=config, output_dir="my_output")
pipeline.run(seeds)
```

## Scenario Configuration Examples

### WebAgent Scenario

Suitable for tasks that require searching and browsing web pages:

```json
{
  "available_tools": ["web_search", "browse_url"],
  "sampling_tips": "Use search tools to find relevant information, then browse specific pages for detailed content. Cross-verify information from different sources.",
  "synthesis_tips": "Generated questions should require synthesizing information from multiple web pages. Encourage multi-step reasoning.",
  "max_depth": 6,
  "branching_factor": 3,
  "min_depth": 3,
  "resource_types": ["web"]
}
```

### RAG Agent Scenario

Suitable for retrieval-augmented generation tasks based on a knowledge base:

```json
{
  "available_tools": ["retrieval", "web_search"],
  "sampling_tips": "Prioritize the retrieval tool to fetch relevant documents from the knowledge base. Supplement with web search when necessary.",
  "synthesis_tips": "Questions should require combining information from multiple knowledge base documents to answer completely.",
  "max_depth": 5,
  "branching_factor": 2,
  "min_depth": 2,
  "resource_types": ["knowledge_base"],
  "resource_init_configs": {
    "knowledge_base": {
      "index_path": "/path/to/index",
      "top_k": 5
    }
  }
}
```

### Document Agent Scenario

Suitable for in-depth document analysis tasks:

```json
{
  "available_tools": ["read_document", "search_document", "python_execute"],
  "sampling_tips": "Start by surveying the document structure, then analyze key sections in depth. Use Python for data calculations and chart generation.",
  "synthesis_tips": "Generated questions should test deep understanding of document content, such as cross-section information integration or data reasoning.",
  "max_depth": 5,
  "branching_factor": 2,
  "min_depth": 2,
  "resource_types": ["document"],
  "resource_init_configs": {
    "document": {
      "file_path": "/path/to/document.pdf"
    }
  }
}
```

### Text2SQL Scenario

Suitable for natural language to SQL query tasks:

```json
{
  "available_tools": ["execute_sql", "get_table_schema"],
  "sampling_tips": "First examine the database table schemas to understand field meanings and table relationships, then construct SQL queries. Try different query strategies.",
  "synthesis_tips": "Generated questions should require multi-table joins or subqueries to answer, covering aggregation, filtering, sorting, and other operations.",
  "seed_description": "Each seed is a database scenario description containing table schemas and business context.",
  "max_depth": 4,
  "branching_factor": 3,
  "min_depth": 2,
  "resource_types": ["database"],
  "resource_init_configs": {
    "database": {
      "connection_string": "sqlite:///data/example.db"
    }
  }
}
```

### Data Analysis Scenario

Suitable for data analysis and visualization tasks:

```json
{
  "available_tools": ["python_execute", "read_file", "web_search"],
  "sampling_tips": "Use Python for data loading, cleaning, analysis, and visualization. Explore patterns and outliers in the data. Combine with web search for domain background knowledge.",
  "synthesis_tips": "Generated questions should require data analysis to answer, such as trend analysis, anomaly detection, statistical inference, etc.",
  "seed_description": "Each seed contains a dataset description and analysis objectives.",
  "max_depth": 6,
  "branching_factor": 2,
  "min_depth": 3,
  "max_selected_traj": 5,
  "resource_types": ["filesystem"],
  "resource_init_configs": {
    "filesystem": {
      "data_dir": "/path/to/datasets"
    }
  }
}
```
