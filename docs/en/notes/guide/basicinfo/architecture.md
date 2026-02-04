---
title: Architecture
createTime: 2025/02/04 10:00:00
icon: material-symbols:auto-transmission-sharp
permalink: /en/guide/architecture/
---

# Architecture

This document introduces the overall architecture of AgentFlow Sandbox.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          User Layer                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Sandbox (Facade)                              │   │
│  │  - Unified entry point                                           │   │
│  │  - Auto server startup/detection                                 │   │
│  │  - Supports sync/async modes                                     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│                              ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              HTTPServiceClient (HTTP Client)                     │   │
│  │  - HTTP request wrapper                                          │   │
│  │  - Worker ID management                                          │   │
│  │  - Auto retry/error handling                                     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│                              │ HTTP/JSON                                  │
└─────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────────┐
│                        Server Layer                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              HTTPServiceServer (FastAPI)                          │   │
│  │  - Holds tool data structures                                    │   │
│  │  - Holds Backend instances                                       │   │
│  │  - Scans and registers @tool marked methods                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│        ┌─────────────────────┴─────────────────────┐                   │
│        ▼                                             ▼                   │
│  ┌──────────────────┐                    ┌──────────────────┐          │
│  │  ToolExecutor    │                    │ ResourceRouter   │          │
│  │  - Tool execution│                    │  - Session mgmt  │          │
│  │  - Route parsing │                    │  - Resource route│          │
│  └──────────────────┘                    └──────────────────┘          │
│                              │                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Backend System                                │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   │
│  │  │ VMBackend    │  │ RAGBackend   │  │ API Tools    │          │   │
│  │  │ (Session)    │  │ (Shared)     │  │ (Lightweight)│          │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Sandbox (User Facade)

**Location**: `sandbox/sandbox.py`

**Responsibilities**:
- Provides unified user interface
- Wraps `HTTPServiceClient`
- Auto server startup/detection
- Session batch creation management
- Supports sync/async modes

### 2. HTTPServiceServer (HTTP Server)

**Location**: `sandbox/server/app.py`

**Responsibilities**:
- Holds tool data structures
- Holds Backend instances
- Scans and registers @tool marked methods
- Dispatches requests to corresponding tool functions

### 3. ToolExecutor (Tool Executor)

**Location**: `sandbox/server/core/tool_executor.py`

**Responsibilities**:
- Tool execution logic
- Resource type prefix parsing
- Session auto injection
- Temporary session management

### 4. ResourceRouter (Resource Router)

**Location**: `sandbox/server/core/resource_router.py`

**Responsibilities**:
- Session lifecycle management
- Worker resource isolation
- Registers Backend initialize/cleanup functions

## Backend Lifecycle Methods

| Method | Trigger | Purpose |
|--------|---------|---------|
| `warmup()` | Server startup or explicit call | Warmup shared resources |
| `initialize()` | Create Session | Allocate worker-specific resources |
| `cleanup()` | Destroy Session | Reclaim worker resources |
| `shutdown()` | Server shutdown | Release all shared resources |
