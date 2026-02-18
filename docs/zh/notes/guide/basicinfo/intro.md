---
title: 简介
createTime: 2025/02/04 10:00:00
icon: mdi:tooltip-text-outline
permalink: /zh/guide/intro/
---

# AgentFlow 简介

AgentFlow 是**首个统一的 Agent 数据合成框架**，为自定义任务提供一体化环境。它能够跨异构 Agent 环境生成高质量的训练与评测数据，覆盖 RAG、多模态文档、深度搜索、GUI、Text2SQL、数据分析、具身智能等多种场景。

> **One framework. All agent worlds.**

## 为什么选择 AgentFlow？

在 Agent 数据合成与评测场景中，我们需要：

- **统一的数据合成范式**：几行代码即可合成复杂的 Agent 训练数据
- **统一的抽象层**：在异构 Agent 环境之间无缝合成数据
- **大规模推理评测**：支持多种 Benchmark 的批量推理与自动化评测
- **一体化沙箱环境**：内置多种后端资源，通过模块化设计轻松扩展
- **资源隔离与管理**：每个 Worker 独立的执行环境，避免相互干扰
- **高可靠性**：完善的错误处理和资源清理机制

AgentFlow 正是为解决这些问题而设计。

## 三大核心模块

AgentFlow 由三大核心模块组成，分别负责数据合成、推理评测和沙箱环境：

### Synthesis -- 数据合成

Synthesis 模块负责高质量 Agent 训练数据的自动合成。它通过三阶段流水线实现：**轨迹采样 (Trajectory Sampling) -> 轨迹选择 (Trajectory Selection) -> QA 合成 (QA Synthesis)**。

核心组件：

- **TrajectorySampler**：LLM 驱动的 Agent 从种子输入出发，迭代探索沙箱环境，构建分支轨迹树
- **TrajectorySelector**：对所有根到叶路径按深度、信息丰富度和工具多样性评分，筛选高质量轨迹
- **QASynthesizer**：基于选定的轨迹，利用 LLM 生成多跳事实型 QA 对，并内置质量检查

关键配置参数：

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `max_depth` | 轨迹树最大探索深度 | 5 |
| `branching_factor` | 每个节点的分支数 | 2 |
| `depth_threshold` | 深度阈值 | 3 |
| `min_depth` | 最小轨迹深度 | 2 |
| `max_selected_traj` | 最大选择轨迹数 | 3 |
| `path_similarity_threshold` | 路径相似度阈值 | 0.7 |

### Rollout -- 推理评测

Rollout 模块负责 Agent 在 Benchmark 上的批量推理与自动化评测。它驱动 Agent 在沙箱环境中与工具交互，记录完整轨迹，并对预测结果进行评估。

核心组件：

- **RolloutPipeline**：主流水线，负责加载 Benchmark、启动 AgentRunner、执行任务、评估结果
- **AgentRunner**：Agent 执行器，管理 LLM 对话循环和工具调用
- **Evaluator**：评估器，支持 `exact_match`、`f1_score`、`contains_answer`、`numeric_match`、`llm_judgement` 等多种评测指标

关键配置参数：

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `max_turns` | 每个任务最大对话轮次 | 100 |
| `max_workers` | 最大并行 Worker 数 | 1 |
| `max_retries` | LLM 调用最大重试次数 | 3 |
| `evaluation_metric` | 评测指标 | `exact_match` |
| `save_trajectories` | 是否保存完整轨迹 | `true` |
| `trajectory_only` | 仅保存轨迹（推理模式） | `false` |

### Sandbox -- 沙箱环境

Sandbox 模块提供统一的工具执行环境，是 Synthesis 和 Rollout 的底层支撑。它通过 HTTP 服务提供标准化的工具调用接口，支持多种后端资源。

核心能力：

- **标准化响应格式**：统一的 JSON 响应，便于数据收集
- **完整轨迹记录**：自动记录工具调用、参数、返回值、执行时间
- **Session 管理**：支持显式 Session 和临时 Session
- **可扩展架构**：通过 `@register_api_tool` 或继承 `Backend` 基类扩展

## 支持的后端

AgentFlow Sandbox 内置以下后端资源：

| 后端 | 类型 | 说明 | 典型工具示例 |
|------|------|------|-------------|
| **VM** | Session 资源 | 虚拟机桌面自动化（截图、点击、键盘输入等） | `vm:screenshot`, `vm:click` |
| **RAG** | 共享资源 | 文档检索与知识库查询 | `rag:search`, `rag:lookup` |
| **Bash** | Session 资源 | 命令行交互 | `bash:execute` |
| **Browser** | 混合资源 | 网页自动化与浏览器控制 | `browser:navigate`, `browser:click` |
| **Code Executor** | Session 资源 | 代码沙箱执行（Python 等） | `code:execute` |
| **WebSearch** | API 工具 | 网络搜索（轻量级，无需 Session） | `websearch:search` |

## 快速开始

### Synthesis -- 数据合成

```python
from synthesis import synthesize

# 一行调用，自动完成轨迹采样、选择和 QA 合成
synthesize(config_path="configs/synthesis/web_config.json")
```

也可以通过 Python API 手动控制合成流程：

```python
from synthesis import load_config, load_seeds
from synthesis.pipeline import SynthesisPipeline

config = load_config("configs/synthesis/rag_config.json")
seeds = load_seeds("seeds/rag_seeds.jsonl")

pipeline = SynthesisPipeline(config=config, output_dir="output/rag_synthesis")
pipeline.run(seeds)
```

### Rollout -- 推理评测

```python
from rollout import rollout

# 在 Benchmark 上运行 Agent 推理与评测
results = rollout(
    config_path="configs/rollout/rag_benchmark.json",
    data_path="benchmark/benchmark.jsonl",
    evaluate=True,
    metric="f1_score"
)
```

也可以对单个问题进行快速推理：

```python
from rollout import quick_rollout

result = quick_rollout(
    "鲁迅的《呐喊》是哪一年出版的？",
    tools=["rag:search", "rag:lookup"],
    model_name="gpt-4.1-2025-04-14",
    sandbox_url="http://127.0.0.1:18890"
)
print(result["answer"])
```

### Sandbox -- 沙箱环境

```python
from sandbox import Sandbox
import asyncio

async def main():
    async with Sandbox() as sandbox:
        # 创建 VM Session
        await sandbox.create_session("vm")

        # 执行截图
        result = await sandbox.execute("vm:screenshot", {})
        print(result)

        # 执行点击
        await sandbox.execute("vm:click", {"x": 100, "y": 200})

asyncio.run(main())
```

也可以通过命令行启动 Sandbox 服务器：

```bash
./sandbox-server.sh --config configs/sandbox-server/web_config.json \
    --port 18890 \
    --host 0.0.0.0
```

## 配置文件

| 用途 | 配置路径 |
|------|---------|
| 启动 Sandbox | `configs/sandbox-server/` |
| 数据合成 (Synthesis) | `configs/synthesis/` |
| 轨迹推理 (Trajectory Rollout) | `configs/trajectory/` |
| 模型推理 (Inference) | `configs/infer/` |

## 下一步

- [架构设计](./architecture.md) -- 了解 AgentFlow 三大模块的系统架构
- [安装指南](../quickstart/install.md) -- 开始安装 AgentFlow
- [第一个 Sandbox](../quickstart/first_sandbox.md) -- 快速上手 Sandbox 环境
