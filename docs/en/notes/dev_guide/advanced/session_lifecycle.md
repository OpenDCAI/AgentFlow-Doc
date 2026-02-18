---
title: Session Lifecycle
createTime: 2025/02/04 10:00:00
icon: mdi:refresh
permalink: /en/dev_guide/advanced/session-lifecycle/
---

# Session Lifecycle

This article provides a detailed introduction to the complete Session lifecycle management.

## Lifecycle Sequence Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    Complete Lifecycle Sequence                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   sandbox.start()                                                │
│       │                                                          │
│       └── server.load_backend(backend)                           │
│               │                                                  │
│               └── scan_and_register(backend)  <- Register tools  │
│                                                                  │
│   sandbox.warmup(["rag", "vm"])     <- Explicit warmup (optional)│
│       │                                                          │
│       └── await backend.warmup()                                 │
│                                                                  │
│   ════════════════════════════════════════════════════════════    │
│                                                                  │
│   sandbox.execute("rag:search", {})                              │
│       │                                                          │
│       ├── (auto) await backend.warmup()  <- If backend not warm  │
│       └── Execute tool function                                  │
│                                                                  │
│   sandbox.create_session("vm", config)                           │
│       │                                                          │
│       └── await backend.initialize(worker_id, config)            │
│                                                                  │
│   sandbox.execute("vm:screenshot", {})                           │
│       │                                                          │
│       └── Execute using existing Session                         │
│                                                                  │
│   sandbox.destroy_session("vm")                                  │
│       │                                                          │
│       └── await backend.cleanup(worker_id, session_info)         │
│                                                                  │
│   ════════════════════════════════════════════════════════════    │
│                                                                  │
│   sandbox.close()                                                │
│       │                                                          │
│       └── Only closes client connection, server keeps running    │
│                                                                  │
│   sandbox.shutdown_server()                                      │
│       │                                                          │
│       └── await backend.shutdown()  <- Release GPU resources etc.│
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Lifecycle Methods

### warmup()

**When called**:
- Explicitly via `sandbox.warmup()`
- Automatically triggered when executing a tool (if not yet warmed up)

**Purpose**:
- Load ML models
- Establish connection pools
- Initialize global caches

```python
async def warmup(self) -> None:
    logger.info("🔥 Loading model...")
    self._model = load_model()
    logger.info("✅ Model loaded")
```

### initialize()

**When called**:
- Via `sandbox.create_session()`
- Automatically creates a temporary Session when executing a stateful tool

**Purpose**:
- Allocate independent resources for a worker
- Create user-level instances

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

**When called**:
- Via `sandbox.destroy_session()`
- Automatically called after a temporary Session finishes execution
- Automatically called when a Session times out

**Purpose**:
- Release worker resources
- Clean up temporary files

```python
async def cleanup(self, worker_id: str, session_info: Dict) -> None:
    logger.info(f"🗑️ [{worker_id}] Cleaning up...")

    resource = session_info.get("data", {}).get("resource")
    if resource:
        resource.close()
```

### shutdown()

**When called**:
- Via `sandbox.shutdown_server()`

**Purpose**:
- Release global resources
- Free GPU memory
- Close connection pools

```python
async def shutdown(self) -> None:
    logger.info("🛑 Shutting down...")

    if self._model:
        del self._model
        torch.cuda.empty_cache()
```

## Auto-Warmup Mechanism

When executing a tool, if the backend has not been warmed up yet, the system automatically triggers warmup:

```python
await sandbox.execute("rag:search", {"query": "test"})
# 1. Check if RAG backend is warmed up
# 2. Not warmed up -> Automatically call backend.warmup()
# 3. Execute tool
```

You can explicitly warmup to reduce first-call latency:

```python
await sandbox.warmup(["rag", "vm"])
await sandbox.warmup()  # Warmup all backends
```

## Temporary Sessions

When executing a stateful tool without creating a Session first, the system automatically creates a temporary Session:

```python
await sandbox.execute("vm:screenshot", {})
# 1. Detect no existing Session
# 2. Automatically create temporary Session
# 3. Execute tool
# 4. Automatically destroy temporary Session
```

## Session Timeout

Explicitly created Sessions have a TTL:

- Each tool call refreshes the TTL
- Automatically cleaned up if unused after timeout
- Default is 300 seconds

```json
{
  "server": {
    "session_ttl": 300
  }
}
```

## API Correspondence

| Sandbox API | Backend Method | Description |
|-------------|---------------|-------------|
| `start()` | - | Start connection |
| `warmup(resources)` | `warmup()` | Warmup backend |
| `create_session(type, config)` | `initialize()` | Create Session |
| `execute(action, params)` | Tool function | Execute tool |
| `destroy_session(type)` | `cleanup()` | Destroy Session |
| `close()` | - | Close connection |
| `shutdown_server()` | `shutdown()` | Shutdown server |
