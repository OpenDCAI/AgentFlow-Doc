---
title: 安装指南
createTime: 2025/02/04 10:00:00
icon: material-symbols-light:download-rounded
permalink: /zh/guide/quickstart/install/
---

# 安装指南

本文介绍如何安装和配置 AgentFlow Sandbox。

## 环境要求

- Python 3.9+
- pip 或 conda

## 安装方式

### 方式一：从源码安装（推荐）

```bash
# 克隆仓库
git clone https://github.com/yourorg/agentflow_sandbox.git
cd agentflow_sandbox

# 安装依赖
pip install -e .
```

### 方式二：pip 安装

```bash
pip install agentflow-sandbox
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
```

## 验证安装

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

## 配置文件

创建配置文件 `config.json`：

```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 18890,
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
      "api_key": "${SERPER_API_KEY}"
    }
  }
}
```

## 下一步

- [第一个 Sandbox](./first_sandbox.md) - 快速上手教程
- [Session 管理](./session_management.md) - 了解 Session 机制
