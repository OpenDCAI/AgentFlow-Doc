---
title: 架构设计
createTime: 2025/02/04 10:00:00
icon: material-symbols:auto-transmission-sharp
permalink: /zh/guide/architecture/
---

# 架构设计

本文介绍 AgentFlow 的整体架构设计。AgentFlow 由三大核心模块组成：**Synthesis（数据合成）**、**Rollout（推理评测）** 和 **Sandbox（沙箱环境）**。三者协同工作，构成完整的 Agent 数据合成与评测框架。

## 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AgentFlow 统一框架                                    │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│                      │                      │                               │
│  ┌────────────────┐  │  ┌────────────────┐  │  ┌─────────────────────────┐  │
│  │   Synthesis    │  │  │    Rollout     │  │  │        Sandbox          │  │
│  │   (数据合成)    │  │  │   (推理评测)   │  │  │      (沙箱环境)         │  │
│  ├────────────────┤  │  ├────────────────┤  │  ├─────────────────────────┤  │
│  │                │  │  │                │  │  │                         │  │
│  │ SynthesisPipe- │  │  │ RolloutPipe-   │  │  │  Sandbox (Facade)      │  │
│  │ line           │  │  │ line           │  │  │    │                    │  │
│  │   │            │  │  │   │            │  │  │    ▼                    │  │
│  ���   ├─Trajectory │  │  │   ├─AgentRunner│  │  │  HTTPServiceClient     │  │
│  │   │  Sampler   │  │  │   │            │  │  │    │                    │  │
│  │   │            │  │  │   ├─Evaluator  │  │  │    │ HTTP/JSON          │  │
│  │   ├─Trajectory │  │  │   │            │  │  │    ▼                    │  │
│  │   │  Selector  │  │  │   └─TaskResult │  │  │  HTTPServiceServer     │  │
│  │   │            │  │  │                │  │  │    │                    │  │
│  │   └─QA         │  │  │                │  │  │    ├─ToolExecutor      │  │
│  │     Synthesizer│  │  │                │  │  │    ├─ResourceRouter     │  │
│  │                │  │  │                │  │  │    │                    │  │
│  └───────┬────────┘  │  └───────┬────────┘  │  │    ▼                    │  │
│          │           │          │           │  │  Backend System         │  │
│          │           │          │           │  │  ┌─���─┬───┬───┬───┬───┐  │  │
│          │           │          │           │  │  │VM │RAG│Bsh│Brw│Cod│  │  │
│          ▼           │          ▼           │  │  └───┴───┴───┴───┴───┘  │  │
│     Sandbox API      │     Sandbox API      │  │  ┌─────────────────┐    │  │
│                      │                      │  │  │  API Tools      │    │  │
│                      │                      │  │  │  (WebSearch...) │    │  │
│                      │                      │  │  └─────────────────┘    │  │
│                      │                      │  └─────────────────────────┘  │
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

Synthesis 和 Rollout 模块均通过 Sandbox 提供的统一 API 与底层工具和环境交互。

## 模块一：Synthesis（数据合成）

### 组件说明

| 组件 | 位置 | 职责 |
|------|------|------|
| **SynthesisPipeline** | `synthesis/pipeline.py` | 主流水线，编排三个阶段的执行流程 |
| **SynthesisConfig** | `synthesis/core/config.py` | 合成配置管理，支持 JSON/YAML 加载 |
| **TrajectorySampler** | `synthesis/core/sampler.py` | 轨迹采样器，LLM 驱动的环境探索与轨迹树构建 |
| **TrajectorySelector** | `synthesis/core/selector.py` | 轨迹选择器，按深度、信息丰富度、工具多样性评分筛选 |
| **QASynthesizer** | `synthesis/core/synthesizer.py` | QA 合成器，基于轨迹生成多跳事实型 QA 对 |
| **SandboxWorker** | `synthesis/core/worker.py` | Sandbox 工作单元，封装与沙箱环境的交互 |
| **synthesize()** | `synthesis/api.py` | 一行调用入口函数 |

### 数据合成流水线

```
Seeds (种子数据)
  │
  │  从 JSONL 文件或列表加载
  ▼
┌──────────────────────────────────┐
│     TrajectorySampler            │
│                                  │
│  对每个 Seed:                     │
│  1. 初始化 Sandbox Session       │
│  2. LLM 提出工具调用              │
│  3. 在 Sandbox 中执行工具         │
│  4. 记录观测结果                  │
│  5. 构建分支轨迹树                │
│     (并发扩展 + 动作去重)          │
│                                  │
│  配置: max_depth, branching_factor│
└──────────┬───────────────────────┘
           │
           │  轨迹树 (Dict[str, TrajectoryNode])
           ▼
┌──────────────────────────────────┐
│     TrajectorySelector           │
│                                  │
│  1. 查找所有叶节点                │
│  2. 按 min_depth 过滤             │
│  3. 构建根到叶路径                │
│  4. 多维评分:                     │
│     - 路径深度                    │
│     - 信息丰富度                  │
│     - 工具多样性                  │
│  5. 相似度去重                    │
│  6. 选择 top-k 轨迹              │
│                                  │
│  配置: min_depth, max_selected_traj│
│        path_similarity_threshold  │
└──────────┬───────────────────────┘
           │
           │  List[Trajectory]
           ▼
┌──────────────────────────────────┐
│     QASynthesizer                │
│                                  │
│  对每条轨迹:                      │
│  1. 格式化轨迹描述                │
│  2. 构建 LLM Prompt              │
│  3. 调用 LLM 生成 QA 对          │
│  4. 内置质量校验                  │
│  5. 失败重试 (最多 3 次)          │
│                                  │
│  输出: SynthesizedQA             │
└──────────┬───────────────────────┘
           │
           ▼
  QA Data (合成的 QA 数据)
  输出文件:
    - synthesized_qa.jsonl
    - trajectories.jsonl
```

## 模块二：Rollout（推理评测）

### 组件说明

| 组件 | 位置 | 职责 |
|------|------|------|
| **RolloutPipeline** | `rollout/pipeline.py` | 主流水线，编排 Benchmark 推理与评估 |
| **RolloutConfig** | `rollout/core/config.py` | 推理评测配置管理，支持 JSON/YAML |
| **AgentRunner** | `rollout/core/runner.py` | Agent 执行器，管理 LLM 对话循环和工具调用 |
| **Evaluator** | `rollout/core/evaluator.py` | 评估器，支持多种评测指标 |
| **BenchmarkItem** | `rollout/core/models.py` | Benchmark 任务数据模型 |
| **TaskResult** | `rollout/core/models.py` | 任务执行结果数据模型 |
| **RolloutSummary** | `rollout/core/models.py` | 运行摘要数据模型 |
| **rollout()** | `rollout/api.py` | 一行调用入口函数 |
| **quick_rollout()** | `rollout/api.py` | 单问题快速推理函数 |

### 推理评测流水线

```
Benchmark (评测数据集)
  │
  │  从 JSONL/JSON 文件加载
  │  可选: 限制任务数 (max_tasks)
  │        指定任务 ID (task_ids)
  ▼
┌──────────────────────────────────┐
│     RolloutPipeline              │
│                                  │
│  1. 加载 RolloutConfig           │
│  2. 验证配置                      │
│  3. 初始化输出文件                │
│  4. 创建 AgentRunner             │
│  5. 分配任务 (顺序/并行)          │
│                                  │
│  配置: max_workers, parallel      │
└──────────┬───────────────────────┘
           │
           │  List[BenchmarkItem]
           ▼
┌──────────────────────────────────┐
│     AgentRunner                  │
│                                  │
│  对每个 BenchmarkItem:            │
│  1. 连接 Sandbox                 │
│  2. 初始化 LLM 对话              │
│  3. 对话循环:                     │
│     a. LLM 生成回复/工具调用      │
│     b. 在 Sandbox 中执行工具      │
│     c. 将观测结果反馈给 LLM       │
│     d. 重复直至得到答案或达到上限  │
│  4. 提取预测答案                  │
│  5. 记录完整轨迹                  │
│                                  │
│  配置: max_turns, max_retries     │
│        system_prompt, model_name  │
└──────────┬───────────────────────┘
           │
           │  List[TaskResult]
           ▼
┌──────────────────────────────────┐
│     Evaluator                    │
│                                  │
│  对每个 TaskResult:               │
│  对比预测答案与标准答案:           │
│                                  │
│  支持的评测指标:                   │
│  - exact_match: 精确匹配          │
│  - f1_score: Token 级 F1 分数     │
│  - contains_answer: 包含答案      │
│  - numeric_match: 数值比较        │
│  - similarity: 语义相似度         │
│  - llm_judgement: LLM 评判        │
│                                  │
│  配置: evaluation_metric          │
│        evaluator_model_name       │
└──────────┬───────────────────────┘
           │
           ▼
  Results (评测结果)
  输出文件:
    - results_<benchmark>_<timestamp>.jsonl
    - evaluation_<benchmark>_<timestamp>.json
    - summary_<benchmark>_<timestamp>.json
```

## 模块三：Sandbox（沙箱环境）

### 组件说明

| 组件 | 位置 | 职责 |
|------|------|------|
| **Sandbox** | `sandbox/sandbox.py` | 用户门面类，提供统一的调用接口 |
| **SandboxConfig** | `sandbox/sandbox.py` | Sandbox 配置，包含服务连接参数 |
| **HTTPServiceClient** | `sandbox/client.py` | HTTP 客户端，封装请求与错误处理 |
| **HTTPServiceServer** | `sandbox/server/app.py` | HTTP 服务器（FastAPI），持有工具映射和 Backend 实例 |
| **ToolExecutor** | `sandbox/server/core/tool_executor.py` | 工具执行器，路由解析、Session 注入、工具调用 |
| **ResourceRouter** | `sandbox/server/core/resource_router.py` | 资源路由器，Session 生命周期、Worker 资源隔离 |
| **Backend** | `sandbox/server/backends/base.py` | 后端基类，定义 warmup/initialize/cleanup/shutdown 接口 |

### Sandbox 执行流程

```
用户代码 / Synthesis / Rollout
  │
  │ sandbox.execute("vm:screenshot", {})
  ▼
Sandbox.execute()
  │
  │ await client.execute()
  ▼
HTTPServiceClient
  │
  │ POST /execute { worker_id, action, params }
  ▼
HTTPServiceServer (routes.py)
  │
  │ await server.execute()
  ▼
ToolExecutor.execute()
  │
  │ 1. 解析: "vm:screenshot" -> resource_type="vm", tool="screenshot"
  │ 2. 查找工具函数 (三层映射)
  │ 3. 获取/创建 Session (ResourceRouter)
  │ 4. 注入参数 (session, params)
  │ 5. 调用后端工具函数
  │ 6. 临时 Session 自动销毁
  ▼
返回结果 { status, data, meta }
```

### Backend 系统架构

```
Backend System
├── Resources (重量级后端, 需要 Session)
│   ├── VMBackend          - 虚拟机桌面自动化
│   │   └── 工具: screenshot, click, type, scroll, ...
│   ├── RAGBackend         - 文档检索服务
│   │   └── 工具: search, lookup, ...
│   ├── BashBackend        - 命令行交互
│   │   └── 工具: execute, ...
│   ├── BrowserBackend     - 网页自动化
│   │   └── 工具: navigate, click, extract, ...
│   └── CodeExecutorBackend - 代码沙箱执行
│       └── 工具: execute, ...
│
└── API Tools (轻量级工具, 无需 Session)
    ├── WebSearch          - 网络搜索
    ├── Text2SQL Tool      - SQL 查询
    ├── Doc Tool           - 文档处理
    └── DS Tool            - 数据科学
```

## 生命周期管理

### Backend 生命周期方法

| 方法 | 调用时机 | 作用 | 适用范围 |
|------|---------|------|---------|
| `warmup()` | 服务器启动或显式调用 | 预热共享资源（如加载模型、建立连接池） | 全局一次 |
| `initialize()` | 创建 Session | 为指定 Worker 分配专属资源 | 每个 Worker |
| `cleanup()` | 销毁 Session | 回收 Worker 专属资源 | 每个 Worker |
| `shutdown()` | 服务器关闭 | 释放所有共享资源 | 全局一次 |

### Sandbox API 与 Backend 生命周期对应

| Sandbox API | Backend 方法 | 说明 |
|-------------|-------------|------|
| `start()` | `warmup()` | 启动服务器，可选预热后端 |
| `warmup(resources)` | `warmup()` | 显式预热指定后端 |
| `create_session(type, config)` | `initialize()` | 创建 Session，分配 Worker 资源 |
| `execute(action, params)` | 工具函数 | 执行工具调用 |
| `destroy_session(type)` | `cleanup()` | 销毁 Session，回收 Worker 资源 |
| `shutdown_server()` | `shutdown()` | 关闭服务器，释放全部资源 |

## 模块间协作

Synthesis 和 Rollout 模块通过 Sandbox 提供的统一接口与底层环境交互，其协作关系如下：

```
┌──────────────────────────────────────────────────────────┐
│                    Synthesis 模块                         │
│                                                          │
│  SynthesisPipeline                                       │
│    └─ SandboxWorker ──┐                                  │
│         │              │                                 │
│  TrajectorySampler     │                                 │
│    └─ 调用 Sandbox     │   Sandbox API                   │
│       execute()        ├─────────────────┐               │
│                        │                 │               │
└────────────────────────┘                 │               │
                                           ▼               │
                                 ┌──────────────────┐      │
                                 │     Sandbox      │      │
                                 │                  │      │
                                 │  create_session()│      │
                                 │  execute()       │      │
                                 │  destroy_session()│     │
                                 │                  │      │
                                 └──────────────────┘      │
                                           ▲               │
┌────────────────────────┐                 │               │
│                        │                 │               │
│  RolloutPipeline       │   Sandbox API   │               │
│    └─ AgentRunner ─────┼─────────────────┘               │
│         │              │                                 │
│  Evaluator             │                                 │
│    └─ 评估结果          │                                 │
│                        │                                 │
│                    Rollout 模块                           │
└──────────────────────────────────────────────────────────┘
```

## 配置体系

三大模块各自拥有独立的配置类，均支持 JSON 和 YAML 格式加载：

| 模块 | 配置类 | 配置路径 | 核心配置项 |
|------|--------|---------|-----------|
| Synthesis | `SynthesisConfig` | `configs/synthesis/` | seeds_file, max_depth, branching_factor, available_tools |
| Rollout | `RolloutConfig` | `configs/trajectory/`, `configs/infer/` | data_path, max_turns, evaluation_metric, max_workers |
| Sandbox | 服务端 JSON 配置 | `configs/sandbox-server/` | resources, apis, server (host, port, session_ttl) |

所有模块均通过以下参数连接 Sandbox：

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `sandbox_server_url` | Sandbox 服务器地址 | `http://127.0.0.1:18890` |
| `sandbox_auto_start` | 是否自动启动服务器 | Synthesis: `true`, Rollout: `false` |
| `sandbox_config_path` | Sandbox 配置文件路径 | `None` |
| `sandbox_timeout` | Sandbox 请求超时（秒） | `120` |

## 项目结构

```
AgentFlow/
├── synthesis/                    # 数据合成模块
│   ├── __init__.py
│   ├── api.py                    # 公开 API (synthesize, load_config, load_seeds)
│   ├── pipeline.py               # SynthesisPipeline 主流水线
│   └── core/
│       ├── __init__.py
│       ├── config.py             # SynthesisConfig 配置管理
│       ├── sampler.py            # TrajectorySampler 轨迹采样器
│       ├── selector.py           # TrajectorySelector 轨迹选择器
│       ├── synthesizer.py        # QASynthesizer QA 合成器
│       ├── worker.py             # SandboxWorker 沙箱工作单元
│       ├── models.py             # 数据模型 (TrajectoryNode, Trajectory, SynthesizedQA)
│       └── utils.py              # 工具函数
│
├── rollout/                      # 推理评测模块
│   ├── __init__.py
│   ├── api.py                    # 公开 API (rollout, quick_rollout)
│   ├── pipeline.py               # RolloutPipeline 主流水线
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py             # RolloutConfig 配置管理
│   │   ├── runner.py             # AgentRunner Agent 执行器
│   │   ├── evaluator.py          # Evaluator 评估器
│   │   ├── models.py             # 数据模型 (BenchmarkItem, TaskResult, RolloutSummary)
│   │   └── utils.py              # 工具函数
│   └── tests/                    # 单元测试
│       ├── test_config.py
│       ├── test_evaluator.py
│       ├── test_models.py
│       └── test_integration.py
│
├── sandbox/                      # 沙箱环境模块
│   ├── __init__.py               # 模块导出
│   ├── sandbox.py                # Sandbox 用户门面类
│   ├── client.py                 # HTTPServiceClient HTTP 客户端
│   ├── tool_schemas/             # 工具 Schema 定义
│   │
│   ├── server/                   # 服务器模块
│   │   ├── app.py                # HTTPServiceServer (FastAPI)
│   │   ├── routes.py             # HTTP 路由定义
│   │   ├── config_loader.py      # 配置加载器
│   │   │
│   │   ├── core/                 # 核心组件
│   │   │   ├── decorators.py     # @tool 装饰器
│   │   │   ├── tool_executor.py  # ToolExecutor 工具执行器
│   │   │   └── resource_router.py # ResourceRouter 资源路由器
│   │   │
│   │   └── backends/             # 后端实现
│   │       ├── base.py           # Backend 基类
│   │       ├── resources/        # 重量级后端 (VM, RAG, Bash, Browser, Code)
│   │       └── tools/            # 轻量级 API 工具 (WebSearch, Text2SQL, ...)
│   │
│   └── configs/                  # 配置文件
│
└── configs/                      # 全局配置目录
    ├── sandbox-server/           # Sandbox 服务器配置
    ├── synthesis/                # 数据合成配置
    ├── trajectory/               # 轨迹推理配置
    └── infer/                    # 模型推理配置
```
