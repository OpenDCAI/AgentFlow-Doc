---
title: 第一个 Sandbox
createTime: 2025/02/04 10:00:00
icon: solar:flag-2-broken
permalink: /zh/guide/quickstart/first-sandbox/
---

# 第一个 Sandbox

本文通过实际示例介绍如何使用 AgentFlow Sandbox。

## 基本使用

### 方式一：自动启动服务器（推荐）

```python
import asyncio
from sandbox import Sandbox

async def main():
    sandbox = Sandbox(
        server_url="http://127.0.0.1:18890",
        auto_start_server=True,
        server_config_path="sandbox/configs/profiles/dev.json"
    )
    await sandbox.start()

    # 执行命令
    result = await sandbox.execute("bash:run", {"command": "echo hello"})
    if result.get("code") == 0:
        print(result["data"])

    await sandbox.close()

asyncio.run(main())
```

### 方式二：使用上下文管理器

```python
import asyncio
from sandbox import Sandbox

async def main():
    async with Sandbox(server_url="http://127.0.0.1:18890") as sandbox:
        # 创建 Session
        await sandbox.create_session("vm")
        
        # 执行截图
        result = await sandbox.execute("vm:screenshot", {})
        print(f"Screenshot: {result}")
        
        # 执行点击
        result = await sandbox.execute("vm:click", {"x": 100, "y": 200})
        print(f"Click: {result}")

asyncio.run(main())
```

### 方式三：同步模式

```python
from sandbox import Sandbox

# 同步模式
with Sandbox(server_url="http://127.0.0.1:18890") as sandbox:
    sandbox.create_session_sync("bash")
    result = sandbox.execute_sync("bash:run", {"command": "ls -la"})
    print(result)
```

## 执行不同类型的工具

### 执行 Bash 命令

```python
async with Sandbox() as sandbox:
    await sandbox.create_session("bash", {"cwd": "/home/user"})
    
    # 执行命令
    result = await sandbox.execute("bash:run", {
        "command": "ls -la",
        "timeout": 30
    })
    print(result["data"]["stdout"])
```

### 执行 RAG 检索

```python
async with Sandbox() as sandbox:
    # RAG 不需要创建 Session（共享资源）
    result = await sandbox.execute("rag:search", {
        "query": "什么是机器学习？",
        "top_k": 5
    })
    print(result["data"]["results"])
```

### 执行 WebSearch

```python
async with Sandbox() as sandbox:
    # 轻量级 API 工具，无需 Session
    result = await sandbox.execute("search", {
        "query": "Python tutorial"
    })
    print(result["data"]["results"])
```

## 批量操作

### 批量创建 Session

```python
async with Sandbox() as sandbox:
    # 批量创建多个 Session
    result = await sandbox.create_session(["vm", "bash", "browser"])
    print(f"Created sessions: {result}")
    
    # 带配置的批量创建
    result = await sandbox.create_session({
        "vm": {"screen_size": [1920, 1080]},
        "bash": {"cwd": "/tmp"},
        "browser": {"headless": True}
    })
```

### 批量销毁 Session

```python
async with Sandbox() as sandbox:
    # ... 执行操作 ...
    
    # 销毁所有 Session
    await sandbox.destroy_session()
    
    # 或销毁指定 Session
    await sandbox.destroy_session(["vm", "bash"])
```

## 预热后端

```python
async with Sandbox() as sandbox:
    # 预热指定后端（减少首次调用延迟）
    await sandbox.warmup(["rag", "vm"])
    
    # 获取预热状态
    status = await sandbox.get_warmup_status()
    print(status)
    # {
    #     "backends": {
    #         "rag": {"loaded": True, "warmed_up": True},
    #         "vm": {"loaded": True, "warmed_up": True}
    #     }
    # }
```

## 错误处理

```python
from sandbox import Sandbox, SandboxError, SandboxConnectionError

async def main():
    try:
        async with Sandbox() as sandbox:
            result = await sandbox.execute("vm:screenshot", {})
            
            if result.get("code") != 0:
                print(f"Error: {result.get('message')}")
            else:
                print(f"Success: {result['data']}")
                
    except SandboxConnectionError as e:
        print(f"Connection error: {e}")
    except SandboxError as e:
        print(f"Sandbox error: {e}")
```

## 下一步

- [Session 管理](./session_management.md) - 深入了解 Session 机制
- [VM 后端](../resources/vm.md) - 使用 VM 后端
- [RAG 后端](../resources/rag.md) - 使用 RAG 后端
