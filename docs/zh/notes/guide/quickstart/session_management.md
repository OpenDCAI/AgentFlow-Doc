---
title: Session 管理
createTime: 2025/02/04 10:00:00
icon: carbon:flow
permalink: /zh/guide/quickstart/session-management/
---

# Session 管理

本文详细介绍 AgentFlow Sandbox 的 Session 管理机制。

## Session 概述

Session 是 AgentFlow 中管理有状态资源的核心概念。每个 Session 代表一个独立的资源实例。

## 两种 Session 模式

### 1. 显式创建（复用模式）

通过 `create_session()` 显式创建，可多次复用：

```python
async with Sandbox() as sandbox:
    # 显式创建 Session
    await sandbox.create_session("vm", {
        "screen_size": [1920, 1080],
        "custom_name": "my_vm"
    })
    
    # 多次执行，复用同一个 Session
    await sandbox.execute("vm:screenshot", {})   # 复用
    await sandbox.execute("vm:click", {"x": 100})  # 复用
    await sandbox.execute("vm:type", {"text": "hello"})  # 复用
    
    # 显式销毁
    await sandbox.destroy_session("vm")
```

**适用场景**：
- 需要多次操作同一资源
- 需要保持状态连续性
- 长时间任务

### 2. 自动创建（临时模式）

不创建 Session 直接执行，系统自动创建临时 Session：

```python
async with Sandbox() as sandbox:
    # 直接执行，自动创建临时 Session
    await sandbox.execute("vm:screenshot", {})
    # Session 已自动销毁
    
    # 再次执行会创建新的临时 Session
    await sandbox.execute("vm:click", {"x": 100})
    # Session 又销毁了
```

**适用场景**：
- 单次操作
- 无状态调用
- 不关心资源复用

## Session 生命周期

```
┌──────────────────────────────────────────────────────────────────┐
│                    完整生命周期时序                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   sandbox.create_session("vm", config)                           │
│       │                                                          │
│       └── await backend.initialize(worker_id, config)            │
│                                                                  │
│   sandbox.execute("vm:screenshot", {})                           │
│       │                                                          │
│       └── 使用现有 Session 执行                                  │
│                                                                  │
│   sandbox.destroy_session("vm")                                  │
│       │                                                          │
│       └── await backend.cleanup(worker_id, session_info)         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 返回结果

执行结果包含 `temporary_session` 字段：

```json
{
    "code": 0,
    "message": "success",
    "data": {...},
    "meta": {
        "tool": "screenshot",
        "resource_type": "vm",
        "session_id": "xxx",
        "temporary_session": true
    }
}
```

## Session 超时

显式创建的 Session 有 TTL（存活时间）：

- 每次工具调用会刷新 TTL
- 超时未使用的 Session 会被自动清理
- 默认 TTL：300 秒

```json
{
  "server": {
    "session_ttl": 300
  }
}
```

## Session 刷新

手动刷新 Session 存活时间：

```python
async with Sandbox() as sandbox:
    await sandbox.create_session("vm")
    
    # 刷新指定 Session
    await sandbox.refresh_sessions("vm")
    
    # 刷新所有 Session
    await sandbox.refresh_sessions()
```

## 重新初始化

重新初始化指定资源（不影响其他资源）：

```python
async with Sandbox() as sandbox:
    await sandbox.create_session("vm", {"screen_size": [1920, 1080]})
    
    # 需要更换配置时，重新初始化
    result = await sandbox.reinitialize("vm", {"screen_size": [2560, 1440]})
    print(result)
    # {
    #     "status": "success",
    #     "old_session_id": "xxx",
    #     "new_session_id": "yyy",
    #     "config_applied": {"screen_size": [2560, 1440]}
    # }
```

## 查看当前 Session

```python
async with Sandbox() as sandbox:
    await sandbox.create_session(["vm", "bash"])
    
    # 列出所有 Session
    sessions = await sandbox.list_sessions()
    print(sessions)
    # {
    #     "sessions": [
    #         {"resource_type": "vm", "session_id": "xxx", "status": "active"},
    #         {"resource_type": "bash", "session_id": "yyy", "status": "active"}
    #     ]
    # }
```

## 最佳实践

### 1. 根据使用场景选择模式

```python
# 多次操作同一资源 → 显式创建
await sandbox.create_session("vm")
await sandbox.execute("vm:screenshot", {})
await sandbox.execute("vm:click", {"x": 100})
await sandbox.execute("vm:type", {"text": "hello"})
await sandbox.destroy_session("vm")

# 单次操作 → 临时 Session
await sandbox.execute("vm:screenshot", {})
```

### 2. 及时清理 Session

```python
async with Sandbox() as sandbox:
    try:
        await sandbox.create_session("vm")
        # ... 操作 ...
    finally:
        await sandbox.destroy_session("vm")
```

### 3. 使用上下文管理器

```python
# 上下文管理器会自动调用 close()
async with Sandbox() as sandbox:
    await sandbox.create_session("vm")
    # ... 操作 ...
# 退出时自动清理
```
