---
title: Session Management
createTime: 2025/02/04 10:00:00
icon: carbon:flow
permalink: /en/guide/quickstart/session-management/
---

# Session Management

This document details the Session management mechanism of AgentFlow Sandbox.

## Session Overview

Session is the core concept for managing stateful resources in AgentFlow. Each Session represents an independent resource instance.

## Two Session Modes

### 1. Explicit Creation (Reuse Mode)

Created explicitly via `create_session()`, can be reused multiple times:

```python
async with Sandbox() as sandbox:
    # Explicitly create Session
    await sandbox.create_session("vm", {
        "screen_size": [1920, 1080],
        "custom_name": "my_vm"
    })
    
    # Multiple executions, reuse same Session
    await sandbox.execute("vm:screenshot", {})   # Reuse
    await sandbox.execute("vm:click", {"x": 100})  # Reuse
    
    # Explicitly destroy
    await sandbox.destroy_session("vm")
```

**Use cases**:
- Multiple operations on same resource
- Need state continuity
- Long-running tasks

### 2. Auto Creation (Temporary Mode)

Execute directly without creating Session, system auto-creates temporary Session:

```python
async with Sandbox() as sandbox:
    # Execute directly, auto-create temporary Session
    await sandbox.execute("vm:screenshot", {})
    # Session already destroyed
```

**Use cases**:
- Single operation
- Stateless calls
- Don't care about resource reuse

## Session Lifecycle

```
create_session("vm", config)
    → backend.initialize(worker_id, config)

execute("vm:screenshot", {})
    → Use existing Session

destroy_session("vm")
    → backend.cleanup(worker_id, session_info)
```

## Session Timeout

Explicitly created Sessions have TTL (Time To Live):

- Each tool call refreshes TTL
- Unused Sessions are auto-cleaned after timeout
- Default: 300 seconds

```json
{
  "server": {
    "session_ttl": 300
  }
}
```
