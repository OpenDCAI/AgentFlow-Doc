---
title: HTTP 端点
createTime: 2025/02/04 10:00:00
icon: mdi:server
permalink: /zh/api/server/http-endpoints/
---

# HTTP 端点

本文档介绍 AgentFlow 服务器的 HTTP API 端点。

## 执行端点

### POST /execute

执行工具。

**请求**:

```json
{
  "worker_id": "sandbox_xxx",
  "action": "vm:screenshot",
  "params": {},
  "timeout": 30
}
```

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {...},
  "meta": {
    "execution_time_ms": 150,
    "tool": "screenshot",
    "resource_type": "vm",
    "session_id": "vm_xxx_001",
    "temporary_session": false
  }
}
```

### POST /execute/batch

批量执行工具。

**请求**:

```json
{
  "worker_id": "sandbox_xxx",
  "actions": [
    {"action": "vm:screenshot", "params": {}},
    {"action": "bash:run", "params": {"command": "ls"}}
  ]
}
```

## Session 端点

### POST /session/create

创建 Session。

**请求**:

```json
{
  "worker_id": "sandbox_xxx",
  "resource_type": "vm",
  "config": {"screen_size": [1920, 1080]},
  "custom_name": "my_vm"
}
```

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "session_id": "vm_xxx_001",
    "session_name": "my_vm",
    "session_status": "active",
    "resource_type": "vm"
  }
}
```

### POST /session/destroy

销毁 Session。

**请求**:

```json
{
  "worker_id": "sandbox_xxx",
  "resource_type": "vm"
}
```

### POST /session/list

列出 Session。

**请求**:

```json
{
  "worker_id": "sandbox_xxx"
}
```

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "sessions": [
      {
        "resource_type": "vm",
        "session_id": "vm_xxx_001",
        "session_name": "my_vm",
        "status": "active",
        "created_at": "2025-02-04T10:00:00Z"
      }
    ]
  }
}
```

### POST /session/refresh

刷新 Session 存活时间。

**请求**:

```json
{
  "worker_id": "sandbox_xxx",
  "resource_type": "vm"
}
```

## 工具端点

### GET /tools

列出可用工具。

**参数**:
- `include_hidden` (bool): 是否包含隐藏工具

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "tools": [
      {
        "name": "vm:screenshot",
        "description": "截取屏幕",
        "resource_type": "vm",
        "parameters": {...}
      }
    ]
  }
}
```

## 服务端点

### GET /health

健康检查。

**响应**:

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

### POST /warmup

预热后端。

**请求**:

```json
{
  "backends": ["rag", "vm"]
}
```

### GET /warmup/status

获取预热状态。

**响应**:

```json
{
  "code": 0,
  "data": {
    "backends": {
      "rag": {"loaded": true, "warmed_up": true},
      "vm": {"loaded": true, "warmed_up": false}
    }
  }
}
```

### POST /shutdown

关闭服务器。

**请求**:

```json
{
  "force": false,
  "cleanup_sessions": true
}
```
