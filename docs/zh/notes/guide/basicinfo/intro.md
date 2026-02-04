---
title: 简介
createTime: 2025/02/04 10:00:00
icon: mdi:tooltip-text-outline
permalink: /zh/guide/intro/
---

# AgentFlow Sandbox 简介

AgentFlow Sandbox 是一个专为 **Agent 数据合成** 设计的统一执行环境。它为大规模 Agent 轨迹数据合成提供标准化的工具调用与环境交互能力，支持 VM 桌面自动化、RAG 检索、命令行交互、网页自动化等多种后端资源。

## 为什么选择 AgentFlow？

在 Agent 数据合成场景中，我们需要：

- **标准化的工具调用接口**：统一不同类型工具的调用方式
- **完整的轨迹记录**：自动记录 Agent 与环境的每次交互
- **大规模并行执行**：支持多 Worker 并发，提升数据合成效率
- **资源隔离与管理**：每个 Worker 独立的执行环境，避免相互干扰
- **高可靠性**：完善的错误处理和资源清理机制

AgentFlow 正是为解决这些问题而设计。

## 核心特性

### 🤖 Agent 数据合成

AgentFlow 专为 Agent 轨迹数据合成优化：

- **标准化响应格式**：统一的 JSON 响应，便于数据收集
- **完整轨迹记录**：自动记录工具调用、参数、返回值、执行时间
- **批量执行支持**：支持批量工具调用，提升合成效率
- **Worker 隔离**：每个合成任务独立的执行环境

```python
# 典型的 Agent 数据合成流程
async with Sandbox() as sandbox:
    await sandbox.create_session("vm")
    
    # Agent 决策 -> 工具调用 -> 记录轨迹
    result = await sandbox.execute("vm:screenshot", {})
    trajectory.append({
        "action": "vm:screenshot",
        "observation": result["data"],
        "metadata": result["meta"]
    })
```

### 🖥️ 多资源后端

AgentFlow 支持多种类型的后端资源：

| 后端 | 类型 | 说明 |
|------|------|------|
| **VM** | Session 资源 | 虚拟机桌面自动化 |
| **RAG** | 共享资源 | 文档检索服务 |
| **Bash** | Session 资源 | 命令行交互 |
| **Browser** | 混合资源 | 网页自动化 |
| **Code Executor** | Session 资源 | 代码沙箱执行 |

### 📦 Session 管理

灵活的 Session 生命周期管理：

- **显式 Session**: 通过 `create_session()` 创建，可多次复用
- **临时 Session**: 执行时自动创建，用完即销毁

### 🌐 HTTP API

标准化的 RESTful API 接口：

```python
# 执行工具
POST /execute
{
    "worker_id": "sandbox_xxx",
    "action": "vm:screenshot",
    "params": {}
}

# 创建 Session
POST /session/create
{
    "worker_id": "sandbox_xxx",
    "resource_type": "vm",
    "config": {"screen_size": [1920, 1080]}
}
```

### 🔌 可扩展架构

两种扩展方式：

- **轻量级 API 工具**: 使用 `@register_api_tool` 装饰器
- **重量级 Backend**: 继承 `Backend` 基类

## 快速体验

```python
from sandbox import Sandbox

async def main():
    async with Sandbox() as sandbox:
        # 创建 VM Session
        await sandbox.create_session("vm")
        
        # 执行截图
        result = await sandbox.execute("vm:screenshot", {})
        print(result)
        
        # 执行点击
        await sandbox.execute("vm:click", {"x": 100, "y": 200})

import asyncio
asyncio.run(main())
```

## 下一步

- [架构设计](./architecture.md) - 了解系统架构
- [安装指南](../quickstart/install.md) - 开始安装
- [第一个 Sandbox](../quickstart/first_sandbox.md) - 快速上手
