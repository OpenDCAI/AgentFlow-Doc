---
title: 安装指南
createTime: 2025/02/04 10:00:00
icon: material-symbols-light:download-rounded
permalink: /zh/guide/quickstart/install/
---

# 安装指南

本文介绍如何安装和配置 AgentFlow。

## 环境要求

- Python 3.9+
- pip 或 conda

## 安装方式

### 方式一：从源码安装（推荐）

```bash
# 克隆仓库
git clone https://github.com/OpenDCAI/AgentFlow.git
cd AgentFlow

# 安装依赖
pip install -e .
```

### 方式二：pip 安装

```bash
pip install agentflow
```

## 可选依赖

根据需要安装可选依赖：

```bash
# RAG 支持
pip install faiss-cpu sentence-transformers

# Browser 支持
pip install playwright
playwright install

# VM 支持（需要 Docker 或云服务配置）
pip install docker

# YAML 配置支持
pip install pyyaml
```

## 验证安装

### 验证 Sandbox

```python
from sandbox import Sandbox

async def test():
    sandbox = Sandbox(
        server_url="http://127.0.0.1:18890",
        auto_start_server=True
    )
    await sandbox.start()

    # 获取状态
    status = await sandbox.get_status()
    print(f"Server status: {status}")

    await sandbox.close()

import asyncio
asyncio.run(test())
```

### 验证 Rollout

```python
from rollout import load_config

config = load_config("configs/infer/web_infer.json")
print(f"Model: {config.model_name}")
print(f"Tools: {config.available_tools}")
```

### 验证 Synthesis

```python
from synthesis import load_config

config = load_config("configs/synthesis/web_config.json")
print(f"Model: {config.model_name}")
print(f"Max depth: {config.max_depth}")
```

## 配置文件

### Sandbox 服务器配置

创建配置文件 `config.json`：

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

### 推理配置

创建推理配置 `infer_config.json`：

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

### 合成配置

创建合成配置 `synthesis_config.json`：

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

## 快速入门工作流

以 WebAgent 为例的完整工作流：

### 1. 启动 Sandbox 服务器

```bash
./start_sandbox_server.sh --config configs/sandbox-server/web_config.json
```

### 2. 数据合成

```python
from synthesis import synthesize

synthesize(config_path="configs/synthesis/web_config.json")
```

### 3. 轨迹收集

```python
from rollout import rollout

rollout(config_path="configs/trajectory/web_trajectory.json")
```

### 4. 模型推理与评测

```python
from rollout import rollout

rollout(config_path="configs/infer/web_infer.json")
```

## 下一步

- [第一个 Sandbox](./first_sandbox.md) - Sandbox 快速上手
- [Session 管理](./session_management.md) - 了解 Session 机制
- [Rollout 推理评测](../rollout/overview.md) - 推理与评测指南
- [Synthesis 数据合成](../synthesis/overview.md) - 数据合成指南
