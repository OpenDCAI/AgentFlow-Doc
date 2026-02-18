---
title: Rollout 推理评测
createTime: 2025/02/04 10:00:00
icon: carbon:play-filled-alt
permalink: /zh/guide/rollout/overview/
---

## 概述

Rollout 模块是 AgentFlow 的推理评测引擎，用于在基准数据集上批量执行 Agent 任务并自动评估结果。它提供了从单行快速调用到完整流水线配置的多层 API，支持多种评测指标、并行执行以及完整的对话轨迹记录。

---

## 快速开始

### 一行调用 `rollout()`

使用 `rollout()` 函数可以一行代码完成推理评测的全部流程：

```python
from rollout import rollout

result = rollout(
    config_path="configs/rollout/rag_benchmark.json",
    data_path="benchmark/benchmark.jsonl"
)
```

### 快速单问题测试 `quick_rollout()`

如果只需要对单个问题进行快速推理测试，可以使用 `quick_rollout()`：

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

print(result["answer"])    # 模型的回答
print(result["success"])   # 是否成功完成
print(result["trajectory"])  # 完整对话轨迹
```

---

## 核心 API

### `rollout()`

一站式推理评测���口，加载配置、执行任务、评估结果，返回汇总字典。

```python
def rollout(
    *,
    config_path: str,           # 配置文件路径（JSON/YAML）
    data_path: Optional[str] = None,     # 覆盖基准数据路径
    output_dir: Optional[str] = None,    # 覆盖输出目录
    model_name: Optional[str] = None,    # 覆盖模型名称
    max_tasks: Optional[int] = None,     # 限制任务数量
    task_ids: Optional[List[str]] = None,  # 指定要运行的任务 ID
    evaluate: bool = True,       # 是否评估结果
    metric: Optional[str] = None,        # 覆盖评测指标
) -> Dict[str, Any]
```

**返回值**：包含运行摘要的 `RolloutSummary` 字典，包括 `benchmark_name`、`total_tasks`、`successful_tasks`、`failed_tasks`、`average_score`、`metric`、`total_time_seconds` 等字段。

### `quick_rollout()`

针对单个问题的快速推理，无需配置文件，适合调试和交互式测试。

```python
def quick_rollout(
    question: str,                       # 要回答的问题
    *,
    tools: Optional[List[str]] = None,   # 可用工具列表
    model_name: str = "gpt-4.1-2025-04-14",  # 模型名称
    api_key: str = "",                   # API 密钥
    base_url: str = "",                  # API 基础 URL
    max_turns: int = 10,                 # 最大对话轮数
    sandbox_url: str = "http://127.0.0.1:18890",  # 沙箱服务地址
) -> Dict[str, Any]
```

**返回值**：包含 `question`、`answer`、`success`、`error`、`trajectory` 字段的字典。

### `load_config()`

从 JSON 或 YAML 文件加载配置。

```python
def load_config(config_path: str) -> RolloutConfig
```

支持 `.json`、`.yaml`、`.yml` 格式。

### `load_tasks()`

从文件或列表加载基准任务。

```python
def load_tasks(
    tasks_or_path: Union[str, List[Dict[str, Any]]]
) -> List[BenchmarkItem]
```

支持传入文件路径（JSONL/JSON）或直接传入任务字典列表。

---

## RolloutConfig 完整参数表

`RolloutConfig` 是 Rollout 模块的核心配置数据类，支持从 JSON/YAML 文件加载，也可以通过字典创建。

### I/O 路径

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data_path` | `Optional[str]` | `None` | 基准数据文件路径（JSONL 格式） |
| `output_dir` | `Optional[str]` | `None` | 结果输出目录 |

### 模型配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `model_name` | `str` | `"gpt-4.1-2025-04-14"` | 使用的模型名称 |
| `api_key` | `str` | `""` | 模型 API 密钥 |
| `base_url` | `str` | `""` | 模型 API 基础地址 |

### Agent 执行配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `max_turns` | `int` | `100` | 每个任务的最大对话轮数 |
| `max_retries` | `int` | `3` | 每次 LLM 调用的最大重试次数 |
| `max_workers` | `int` | `1` | 最大并行工作线程数 |
| `available_tools` | `List[str]` | `[]` | 可用工具列表（如 `["vm:screenshot", "web:search"]`） |

### 系统提示词

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `system_prompt` | `str` | `""` | 自定义系统提示词（为空时使用内置默认提示词） |
| `system_prompt_file` | `Optional[str]` | `None` | 从文件加载系统提示词 |

### 评测配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `evaluate_results` | `bool` | `True` | 是否对结果进行评估 |
| `evaluation_metric` | `str` | `"exact_match"` | 评测指标名称 |
| `evaluator_model_name` | `Optional[str]` | `None` | 评测器使用的模型名称（用于 `llm_judgement`） |
| `evaluator_api_key` | `Optional[str]` | `None` | 评测器模型的 API 密钥 |
| `evaluator_base_url` | `Optional[str]` | `None` | 评测器模型的 API 基础地址 |
| `evaluator_temperature` | `float` | `0.0` | 评测器模型的温度参数（范围 0.0 - 2.0） |
| `evaluator_max_retries` | `int` | `3` | 评测器调用的最大重试次数 |
| `evaluator_extra_params` | `Dict[str, Any]` | `{}` | 评测器的额外参数 |

### 资源配置（沙箱）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `resource_types` | `List[str]` | `[]` | 需要的资源类型列表 |
| `resource_init_configs` | `Dict[str, Dict[str, Any]]` | `{}` | 各资源类型的初始化配置 |

### 沙箱配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `sandbox_server_url` | `str` | `"http://127.0.0.1:18890"` | 沙箱服务器地址 |
| `sandbox_auto_start` | `bool` | `False` | 是否自动启动沙箱服务 |
| `sandbox_config_path` | `Optional[str]` | `None` | 沙箱配置文件路径 |
| `sandbox_timeout` | `int` | `120` | 沙箱操作超时时间（秒） |

### 基准测试配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `benchmark_name` | `Optional[str]` | `None` | 基准测试名称 |
| `number_of_tasks` | `Optional[int]` | `None` | 限制运行的任务数量（用于测试） |
| `task_ids` | `Optional[List[str]]` | `None` | 指定运行的任务 ID 列表 |
| `parallel` | `bool` | `False` | 是否启用并行执行 |

### 结果保存

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `save_results` | `bool` | `True` | 是否保��推理结果 |
| `save_trajectories` | `bool` | `True` | 是否保存完整对话轨迹 |
| `trajectory_only` | `bool` | `False` | 是否仅保存精简轨迹数据 |
| `save_summary` | `bool` | `True` | 是否保存汇总文件（`summary_<benchmark>_<timestamp>.json`） |

---

## 配置文件示例

以下是一个完整的 JSON 配置文件示例：

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

## 评测指标

Rollout 支持以下评测指标，通过 `evaluation_metric` 配置参数指定：

| 指标名称 | 说明 | 适用场景 |
|----------|------|----------|
| `exact_match` | 精确匹配，预测答案与标准答案完全一致时得分为 1.0，否则为 0.0 | 有唯一标准答案的任务，如事实问答 |
| `f1_score` | F1 分数，基于 token 级别的精确率和召回率计算 | 答案可能包含部分正确内容的任务 |
| `contains_answer` | 包含匹配，检查预测答案是否包含标准答案 | 生成式回答中需要包含关键信息 |
| `numeric_match` | 数值匹配，提取并比较数值部分 | 数学计算、统计类问题 |
| `llm_judgement` | 使用 LLM 作为评判者评估答案质量，返回 0.0-1.0 的分数 | 开放式问答、需要语义理解的评测 |
| `similarity` | 文本相似度，基于字符串相似度算法计算 | 需要模糊匹配的场景 |

### LLM 评判配置示例

当使用 `llm_judgement` 指标时，需要配置评测器模型：

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

## 基准数据格式

基准数据使用 JSONL（JSON Lines）格式，每行一个任务。支持多种字段名别名以兼容不同数据集。

### 标准格式

```jsonl
{"id": "task_001", "question": "法国的首都是哪里？", "answer": "巴黎"}
{"id": "task_002", "question": "水的化学式是什么？", "answer": "H2O"}
{"id": "task_003", "question": "计算 15 * 27 的结果", "answer": "405"}
```

### 字段说明

| 字段 | 别名 | 是否必须 | 说明 |
|------|------|----------|------|
| `id` | `task_id` | 是 | 任务唯一标识 |
| `question` | `query`, `input` | 是 | 问题/输入文本 |
| `answer` | `ground_truth`, `expected` | 否 | 标准答案（用于评测） |
| `kwargs` | - | 否 | 传递给工具的额外参数（如 `seed_path`） |

其他字段会自动归入 `metadata`。

### 带额外参数的示例

```jsonl
{"id": "doc_001", "question": "文档中提到的项目截止日期是什么？", "answer": "2025年3月15日", "kwargs": {"seed_path": "/data/docs/project_plan.pdf"}}
```

---

## 输出格式

### 推理结果文件（JSONL）

每个任务的推理结果保存为一行 JSON，包含以下字段：

```jsonl
{"task_id": "task_001", "question": "法国的首都是哪里？", "predicted_answer": "巴黎", "success": true, "ground_truth": "巴黎", "score": 1.0, "trajectory": {"task_id": "task_001", "question": "...", "messages": [...], "tool_calls": [...], "final_answer": "巴黎", "total_turns": 3, "success": true, "start_time": "2025-02-04T10:00:00", "end_time": "2025-02-04T10:00:15", "execution_time_ms": 15000}}
```

**结果字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `task_id` | `str` | 任务 ID |
| `question` | `str` | 原始问题 |
| `predicted_answer` | `str` | 模型预测的答案 |
| `success` | `bool` | 任务是否成功完成 |
| `ground_truth` | `str` | 标准答案 |
| `score` | `float` | 评测得分 |
| `error` | `str` | 错误信息（失败时） |
| `trajectory` | `object` | 完整对话轨迹（包含消息、工具调用等） |

### 评测汇总文件（JSON）

评测完成后会生成汇总文件 `summary_<benchmark>_<timestamp>.json`：

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

## 完整使用流程

### 第一步：启动沙箱服务

Rollout 依赖沙箱服务提供工具执行环境。在运行推理前，需要先启动沙箱：

```bash
# 启动沙箱服务（默认端口 18890）
python -m sandbox.server --port 18890
```

或者在配置中设置 `sandbox_auto_start: true` 让 Rollout 自动启动。

### 第二步：准备配置文件

创建 JSON 配置文件（如 `configs/rollout/my_benchmark.json`）：

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

### 第三步：准备基准数据

创建 JSONL 格式的基准数据文件：

```jsonl
{"id": "q001", "question": "AgentFlow 框架支持哪些工具类型？", "answer": "web, doc, vm, code"}
{"id": "q002", "question": "如何配置沙箱的超时时间？", "answer": "通过 sandbox_timeout 参数设置"}
```

### 第四步：运行推理评测

```python
from rollout import rollout

# 方式一：使用配置文件（推荐）
summary = rollout(config_path="configs/rollout/my_benchmark.json")

# 方式二：覆盖部分参数
summary = rollout(
    config_path="configs/rollout/my_benchmark.json",
    data_path="benchmark/another_dataset.jsonl",
    model_name="gpt-4.1-2025-04-14",
    max_tasks=10,       # 先跑 10 个任务测试
    evaluate=True,
    metric="exact_match"
)

# 查看结果
print(f"总任务数: {summary['total_tasks']}")
print(f"成功任务数: {summary['successful_tasks']}")
print(f"平均得分: {summary['average_score']}")
print(f"结果文件: {summary['results_file']}")
```

### 第五步：查看结果

推理完成后，输出目录中会包含以下文件：

```
results/my_eval/
  ├── results.jsonl                          # 每个任务的详细推理结果
  ├── evaluation.json                        # 评测详情
  └── summary_my_benchmark_20250204T103000.json  # 运行汇总
```

### 高级用法：编程式调用

如果需要更细粒度的控制，可以直接使用底层 API：

```python
from rollout import load_config, load_tasks
from rollout.core.runner import AgentRunner
import asyncio

async def custom_run():
    # 加载配置和任务
    config = load_config("configs/rollout/my_benchmark.json")
    tasks = load_tasks("benchmark/my_benchmark.jsonl")

    # 创建并启动 Runner
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
