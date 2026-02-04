---
title: HTTP Endpoints
createTime: 2025/02/04 10:00:00
icon: mdi:server
permalink: /en/api/server/http-endpoints/
---

# HTTP Endpoints

This document describes the HTTP API endpoints for the AgentFlow server.

## Execution Endpoints

### POST /execute

Execute a tool.

**Request**:

```json
{
  "worker_id": "sandbox_xxx",
  "action": "vm:screenshot",
  "params": {},
  "timeout": 30
}
```

**Response**:

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

Execute tools in batch.

**Request**:

```json
{
  "worker_id": "sandbox_xxx",
  "actions": [
    {"action": "vm:screenshot", "params": {}},
    {"action": "bash:run", "params": {"command": "ls"}}
  ]
}
```

## Session Endpoints

### POST /session/create

Create a Session.

**Request**:

```json
{
  "worker_id": "sandbox_xxx",
  "resource_type": "vm",
  "config": {"screen_size": [1920, 1080]},
  "custom_name": "my_vm"
}
```

**Response**:

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

Destroy a Session.

**Request**:

```json
{
  "worker_id": "sandbox_xxx",
  "resource_type": "vm"
}
```

### POST /session/list

List Sessions.

**Request**:

```json
{
  "worker_id": "sandbox_xxx"
}
```

**Response**:

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

Refresh Session lifetime.

**Request**:

```json
{
  "worker_id": "sandbox_xxx",
  "resource_type": "vm"
}
```

## Tools Endpoints

### GET /tools

List available tools.

**Parameters**:
- `include_hidden` (bool): Whether to include hidden tools

**Response**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "tools": [
      {
        "name": "vm:screenshot",
        "description": "Take screenshot",
        "resource_type": "vm",
        "parameters": {...}
      }
    ]
  }
}
```

## Service Endpoints

### GET /health

Health check.

**Response**:

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

### POST /warmup

Warm up backends.

**Request**:

```json
{
  "backends": ["rag", "vm"]
}
```

### GET /warmup/status

Get warmup status.

**Response**:

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

Shutdown server.

**Request**:

```json
{
  "force": false,
  "cleanup_sessions": true
}
```