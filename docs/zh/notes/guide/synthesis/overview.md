---
title: Synthesis 数据合成
createTime: 2025/02/04 10:00:00
icon: carbon:data-enrichment
permalink: /zh/guide/synthesis/overview/
---

## 概述

Synthesis 模块是 AgentFlow 的数据合成引擎，通过 **三阶段流水线** 自动生成高质量的多跳问答（Multi-hop QA）训练数据。它让 LLM Agent 在沙箱环境中自主探索，构建分支轨迹树，再从中筛选出高质量路径并合成问答对。

## 快速开始

只需一行代码即可启动完整合成流程：

```python
from synthesis import synthesize

synthesize(config_path="config.json")
```

你也可以在调用时直接传入种子数据：

```python
synthesize(
    config_path="config.json",
    seeds=["请查询2024年全球GDP排名前十的国家", "分析某公司近三年财报数据"]
)
```

## 三阶段流水线

Synthesis 采用三阶段流水线架构，每一阶段各司其职：

```
Seed Data (种子数据)
│
├── Stage 1: Trajectory Sampling (轨迹采样)
│   │
│   │   LLM Agent 在沙箱中探索，构建分支轨迹树
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
├── Stage 2: Trajectory Selection (轨迹选择)
│   │
│   │   对所有从根到叶的路径进行评分与过滤
│   │   - 按深度过滤（min_depth）
│   │   - 按信息密度评分
│   │   - 按路径相似度去重（path_similarity_threshold）
│   │
│   ▼
└── Stage 3: QA Synthesis (问答合成)
    │
    │   基于选中的轨迹生成多跳问答对
    │   - 包含推理步骤（reasoning_steps >= 3）
    │   - 答案泄漏检测
    │   - 问题冗余检测
    │
    ▼
  Output: synthesized_qa.jsonl + trajectories.jsonl
```

### Stage 1: Trajectory Sampling（轨迹采样）

LLM Agent 以种子数据为起点，在沙箱环境中使用可用工具（如搜索、浏览、代码执行等）进行自主探索。在每个节点上，Agent 可以产生多个分支动作，形成一棵轨迹树。

**核心概念：**
- **TrajectoryNode**：轨迹树中的单个节点，包含 `observation`（观察）、`intent`（意图）、`action`（动作）
- **轨迹树**：从根节点出发，通过多步探索产生的树状结构

**关键参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `max_depth` | `int` | `5` | 轨迹树的最大探索深度 |
| `branching_factor` | `int` | `2` | 每个节点产生的分支数量 |
| `depth_threshold` | `int` | `3` | 开始增加分支探索的深度阈值 |
| `available_tools` | `List[str]` | `[]` | Agent 可使用的工具列表 |
| `sampling_tips` | `str` | `""` | 引导 Agent 探索的提示语 |

### Stage 2: Trajectory Selection（轨迹选择）

从轨迹树中提取所有根到叶的路径，通过多维度评分和去重，挑选出最具信息量和多样性的轨迹。

**选择流程：**
1. 找到所有叶节点
2. 按最小深度过滤（`min_depth`）
3. 从叶到根回溯构建完整路径
4. 按信息密度评分（观察文本平均长度归一化）
5. 路径相似度去重，避免重复轨迹

**关键参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `min_depth` | `int` | `2` | 有效轨迹的最小深度 |
| `max_selected_traj` | `int` | `3` | 每个种子最多选择的轨迹数 |
| `path_similarity_threshold` | `float` | `0.7` | 路径相似度阈值（大于此值视为重复） |

### Stage 3: QA Synthesis（问答合成）

基于选中的轨迹，由 LLM 生成多跳问答对。每个 QA 对包含问题、答案和推理步骤链。

**质量保障机制：**
- 最多 3 次重试
- 推理步骤数量不少于 3 步
- 答案泄漏检测（答案不能出现在问题中）
- 问题冗余检测（问题不能过于冗长）

**关键参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `synthesis_tips` | `str` | `""` | 引导 QA 生成的提示语 |
| `qa_examples` | `List[Dict]` | `[]` | QA 示例，用于引导生成风格 |

## 核心 API

### `synthesize()`

一键启动完整的合成流水线。

```python
def synthesize(
    *,
    config_path: str,
    seeds: Optional[Union[str, List[str], List[Dict[str, Any]]]] = None,
) -> None
```

**参数说明：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `config_path` | `str` | 配置文件路径（支持 `.json` / `.yaml` / `.yml`） |
| `seeds` | `str \| List[str] \| List[Dict] \| None` | 种子数据，可以是 JSONL 文件路径、字符串列表或字典列表。若为 `None`，则从配置中的 `seeds_file` 加载 |

### `load_config()`

从文件加载合成配置。

```python
def load_config(config_path: str) -> SynthesisConfig
```

支持 JSON 和 YAML 格式的配置文件。

### `load_seeds()`

从多种来源加载种子数据。

```python
def load_seeds(
    seeds_or_path: Union[str, List[str], List[Dict[str, Any]]]
) -> List[Dict[str, Any]]
```

**支持的输入格式：**
- `str`：JSONL 文件路径，或单条种子字符串
- `List[str]`：字符串列表，自动转换为 `{"content": ..., "kwargs": {}}`
- `List[Dict]`：字典列表，直接使用

## 完整配置参数表（SynthesisConfig）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| **I/O 路径** | | | |
| `seeds_file` | `Optional[str]` | `None` | 种子数据文件路径（JSONL 格式） |
| `output_dir` | `Optional[str]` | `None` | 输出目录路径（默认 `synthesis_results`） |
| **工具与提示** | | | |
| `available_tools` | `List[str]` | `[]` | Agent 可用的工具列表 |
| `qa_examples` | `List[Dict[str, str]]` | `[]` | QA 示例，用于引导生成 |
| `sampling_tips` | `str` | `""` | 探索阶段提示语（支持字符串或字符串列表） |
| `synthesis_tips` | `str` | `""` | 合成阶段提示语（支持字符串或字符串列表） |
| `seed_description` | `str` | `""` | 种子数据的描述信息 |
| **模型配置** | | | |
| `model_name` | `str` | `"gpt-4.1-2025-04-14"` | 使用的 LLM 模型名称 |
| `api_key` | `str` | `""` | API 密钥 |
| `base_url` | `str` | `""` | API 基础 URL |
| **轨迹采样配置** | | | |
| `max_depth` | `int` | `5` | 轨迹树最大深度 |
| `branching_factor` | `int` | `2` | 每个节点的分支数 |
| `depth_threshold` | `int` | `3` | 深度阈值 |
| **轨迹选择配置** | | | |
| `min_depth` | `int` | `2` | 有效轨迹最小深度 |
| `max_selected_traj` | `int` | `3` | 每个种子最多选择的轨迹数 |
| `path_similarity_threshold` | `float` | `0.7` | 路径相似度去重阈值 |
| **种子处理** | | | |
| `number_of_seed` | `Optional[int]` | `None` | 处理的种子数量上限（`None` 表示全部处理） |
| **资源配置** | | | |
| `resource_types` | `List[str]` | `[]` | 沙箱资源类型列表 |
| `resource_init_configs` | `Dict[str, Dict]` | `{}` | 资源初始化配置 |
| **沙箱配置** | | | |
| `sandbox_server_url` | `str` | `"http://127.0.0.1:18890"` | 沙箱服务器地址 |
| `sandbox_auto_start` | `bool` | `True` | 是否自动启动沙箱 |
| `sandbox_config_path` | `Optional[str]` | `None` | 沙箱配置文件路径 |
| `sandbox_timeout` | `int` | `120` | 沙箱操作超时时间（秒） |

## 配置文件示例

### JSON 格式

```json
{
  "seeds_file": "seeds.jsonl",
  "output_dir": "output/synthesis_results",

  "available_tools": ["web_search", "browse_url", "python_execute"],

  "qa_examples": [
    {
      "question": "2024年全球GDP排名前三的国家分别是哪些？各自的GDP是多少？",
      "answer": "2024年全球GDP排名前三的国家分别是：1. 美国（约29.17万亿美元），2. 中国（约18.53万亿美元），3. 德国（约4.59万亿美元）。"
    }
  ],

  "sampling_tips": "请尽量使用多种工具进行深入探索，每一步都要验证获取的信息",
  "synthesis_tips": "生成的问题应该需要多步推理才能回答，避免简单的事实查询",
  "seed_description": "每条种子数据代表一个需要深入研究的主题",

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

## 种子数据格式

种子数据采用 JSONL 格式（每行一个 JSON 对象），每条记录必须包含 `content` 字段，可选包含 `kwargs` 字段：

```jsonl
{"content": "请调研2024年全球人工智能行业的发展趋势", "kwargs": {"domain": "AI", "year": 2024}}
{"content": "分析特斯拉2023年Q4财报中的关键指标", "kwargs": {"company": "Tesla"}}
{"content": "比较Python和Rust在Web后端开发中的优劣势", "kwargs": {}}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `content` | `str` | 是 | 种子内容，作为 Agent 探索的起始点 |
| `kwargs` | `Dict[str, Any]` | 否 | 额外参数，传递给采样过程使用（默认为 `{}`） |

## 输出格式

合成完成后，在 `output_dir` 目录下生成两个文件：

### `synthesized_qa.jsonl`

每行一条合成的问答对：

```jsonl
{
  "question": "根据2024年的数据，全球GDP排名前三的国家中，哪个国家的GDP增速最快？增速是多少？",
  "answer": "根据2024年的数据，印度的GDP增速最快，达到了6.8%...",
  "trajectory_id": "traj_abc123",
  "source_id": "seed_001",
  "qa_id": "traj_abc123_qa_0",
  "reasoning_steps": [
    {"step": "首先查询2024年全球GDP排名数据"},
    {"step": "确认排名前三的国家：美国、中国、德国"},
    {"step": "分别查询三个国家的GDP增速"},
    {"step": "比较增速得出结论"}
  ],
  "metadata": {}
}
```

### `trajectories.jsonl`

每行一条轨迹数据：

```jsonl
{
  "trajectory_id": "traj_abc123",
  "source_id": "seed_001",
  "seed_data": "请调研2024年全球GDP排名",
  "total_depth": 4,
  "nodes": [
    {
      "node_id": "node_001",
      "observation": "Starting point: 请调研2024年全球GDP排名",
      "intent": "Initialize exploration",
      "action": null,
      "parent_id": null,
      "children_ids": ["node_002", "node_003"],
      "depth": 0
    },
    {
      "node_id": "node_002",
      "observation": "搜索结果显示2024年全球GDP排名...",
      "intent": "搜索全球GDP排名数据",
      "action": {"tool": "web_search", "args": {"query": "2024 global GDP ranking"}},
      "parent_id": "node_001",
      "children_ids": ["node_004"],
      "depth": 1
    }
  ]
}
```

## 完整使用流程

### 1. 准备种子数据

创建 `seeds.jsonl` 文件：

```jsonl
{"content": "调研人工智能在医疗领域的应用", "kwargs": {"domain": "healthcare"}}
{"content": "分析2024年全球新能源汽车市场格局", "kwargs": {}}
```

### 2. 编写配置文件

创建 `config.json`（参见上方配置文件示例）。

### 3. 运行合成

```python
from synthesis import synthesize

# 方式一：使用配置文件中的 seeds_file
synthesize(config_path="config.json")

# 方式二：直接传入种子数据
synthesize(
    config_path="config.json",
    seeds="seeds.jsonl"
)

# 方式三：传入字符串列表
synthesize(
    config_path="config.json",
    seeds=["调研主题A", "调研主题B"]
)

# 方式四：传入字典列表
synthesize(
    config_path="config.json",
    seeds=[
        {"content": "调研主题A", "kwargs": {"key": "value"}},
        {"content": "调研主题B", "kwargs": {}}
    ]
)
```

### 4. 高级用法：自定义流水线

```python
from synthesis.api import load_config, load_seeds
from synthesis.pipeline import SynthesisPipeline

config = load_config("config.json")
seeds = load_seeds("seeds.jsonl")

pipeline = SynthesisPipeline(config=config, output_dir="my_output")
pipeline.run(seeds)
```

## 场景配置示例

### WebAgent 场景

适用于需要搜索和浏览网页的任务：

```json
{
  "available_tools": ["web_search", "browse_url"],
  "sampling_tips": "使用搜索工具查找相关信息，然后浏览具体页面获取详细内容。注意交叉验证不同来源的信息。",
  "synthesis_tips": "生成的问题应该需要综合多个网页的信息才能回答，鼓励多步推理。",
  "max_depth": 6,
  "branching_factor": 3,
  "min_depth": 3,
  "resource_types": ["web"]
}
```

### RAG Agent 场景

适用于基于知识库进行检索增强生成的任务：

```json
{
  "available_tools": ["retrieval", "web_search"],
  "sampling_tips": "优先使用检索工具从知识库中获取相关文档，必要时结合网络搜索补充信息。",
  "synthesis_tips": "问题需要结合知识库中多个文档的信息才能完整回答。",
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

### Document Agent 场景

适用于对文档进行深入分析的任务：

```json
{
  "available_tools": ["read_document", "search_document", "python_execute"],
  "sampling_tips": "先通览文档结构，再对关键段落进行深入分析。可以使用 Python 进行数据计算和图表生成。",
  "synthesis_tips": "生成的问题应该考察对文档内容的深入理解，例如跨章节的信息整合或数据推理。",
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

### Text2SQL 场景

适用于自然语言转 SQL 查询的任务：

```json
{
  "available_tools": ["execute_sql", "get_table_schema"],
  "sampling_tips": "先查看数据库表结构，理解字段含义和表间关系，再构造 SQL 查询。尝试不同的查询策略。",
  "synthesis_tips": "生成的问题应该需要多表关联查询或子查询才能回答，涵盖聚合、过滤、排序等操作。",
  "seed_description": "每条种子是一个数据库场景描述，包含表结构和业务背景",
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

### Data Analysis 场景

适用于数据分析和可视化任务：

```json
{
  "available_tools": ["python_execute", "read_file", "web_search"],
  "sampling_tips": "使用 Python 进行数据加载、清洗、分析和可视化。探索数据中的模式和异常值。可以结合网络搜索获取领域背景知识。",
  "synthesis_tips": "生成的问题应该需要进行数据分析才能回答，例如趋势分析、异常检测、统计推断等。",
  "seed_description": "每条种子包含一个数据集的描述和分析目标",
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
