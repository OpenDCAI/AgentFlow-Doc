---
title: Session 生命周期
createTime: 2025/02/04 10:00:00
icon: mdi:refresh
permalink: /zh/dev_guide/advanced/session-lifecycle/
---

# Session 生命周期

本文详细介绍 Session 的完整生命周期管理。

## 生命周期时序图

```
┌──────────────────────────────────────────────────────────────────┐
│                    完整生命周期时序                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   sandbox.start()                                                │
│       │                                                          │
│       └── server.load_backend(backend)                           │
│               │                                                  │
│               └── scan_and_register(backend)  ← 注册工具         │
│                                                                  │
│   sandbox.warmup(["rag", "vm"])     ← 显式预热（可选）           │
│       │                                                          │
│       └── await backend.warmup()                                 │
│                                                                  │
│   ════════════════════════════════════════════════════════════  │
│                                                                  │
│   sandbox.execute("rag:search", {})                              │
│       │                                                          │
│       ├── (自动) await backend.warmup()  ← 若后端未预热          │
│       └── 执行工具函数                                           │
│                                                                  │
│   sandbox.create_session("vm", config)                           │
│       │                                                          │
│       └── await backend.initialize(worker_id, config)  ← ⭐      │
│                                                                  │
│   sandbox.execute("vm:screenshot", {})                           │
│       │                                                          │
│       └── 使用现有 Session 执行                                  │
│                                                                  │
│   sandbox.destroy_session("vm")                                  │
│       │                                                          │
│       └── await backend.cleanup(worker_id, session_info)  ← ⭐   │
│                                                                  │
│   ════════════════════════════════════════════════════════════  │
│                                                                  │
│   sandbox.close()                                                │
│       │                                                          │
│       └── 只关闭客户端连接，服务器继续运行                       │
│                                                                  │
│   sandbox.shutdown_server()                                      │
│       │                                                          │
│       └── await backend.shutdown()  ← ⭐ 释放 GPU 等资源         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 生命周期方法

### warmup()

**调用时机**：
- `sandbox.warmup()` 显式调用
- 执行工具时自动触发（如果未预热）

**用途**：
- 加载 ML 模型
- 建立连接池
- 初始化全局缓存

```python
async def warmup(self) -> None:
    logger.info("🔥 Loading model...")
    self._model = load_model()
    logger.info("✅ Model loaded")
```

### initialize()

**调用时机**：
- `sandbox.create_session()` 调用
- 执行有状态工具时自动创建临时 Session

**用途**：
- 为 worker 分配独立资源
- 创建用户级别的实例

```python
async def initialize(self, worker_id: str, config: Dict) -> Dict:
    logger.info(f"📦 [{worker_id}] Creating session...")
    
    resource = create_resource(config)
    
    return {
        "resource": resource,
        "config": config
    }
```

### cleanup()

**调用时机**：
- `sandbox.destroy_session()` 调用
- 临时 Session 执行完成后自动调用
- Session 超时后自动调用

**用途**：
- 释放 worker 资源
- 清理临时文件

```python
async def cleanup(self, worker_id: str, session_info: Dict) -> None:
    logger.info(f"🗑️ [{worker_id}] Cleaning up...")
    
    resource = session_info.get("data", {}).get("resource")
    if resource:
        resource.close()
```

### shutdown()

**调用时机**：
- `sandbox.shutdown_server()` 调用

**用途**：
- 释放全局资源
- 释放 GPU 显存
- 关闭连接池

```python
async def shutdown(self) -> None:
    logger.info("🛑 Shutting down...")
    
    if self._model:
        del self._model
        torch.cuda.empty_cache()
```

## 自动预热机制

执行工具时，如果后端尚未预热，系统会自动触发预热：

```python
await sandbox.execute("rag:search", {"query": "test"})
# 1. 检查 RAG 后端是否已预热
# 2. 未预热 → 自动调用 backend.warmup()
# 3. 执行工具
```

可以显式预热以减少首次调用延迟：

```python
await sandbox.warmup(["rag", "vm"])
await sandbox.warmup()  # 预热所有后端
```

## 临时 Session

不创建 Session 直接执行有状态工具时，系统会自动创建临时 Session：

```python
await sandbox.execute("vm:screenshot", {})
# 1. 检测到无现有 Session
# 2. 自动创建临时 Session
# 3. 执行工具
# 4. 自动销毁临时 Session
```

## Session 超时

显式创建的 Session 有 TTL：

- 每次工具调用刷新 TTL
- 超时未使用自动清理
- 默认 300 秒

```json
{
  "server": {
    "session_ttl": 300
  }
}
```

## API 对应关系

| Sandbox API | Backend 方法 | 说明 |
|-------------|-------------|------|
| `start()` | - | 启动连接 |
| `warmup(resources)` | `warmup()` | 预热后端 |
| `create_session(type, config)` | `initialize()` | 创建 Session |
| `execute(action, params)` | 工具函数 | 执行工具 |
| `destroy_session(type)` | `cleanup()` | 销毁 Session |
| `close()` | - | 关闭连接 |
| `shutdown_server()` | `shutdown()` | 关闭服务器 |
