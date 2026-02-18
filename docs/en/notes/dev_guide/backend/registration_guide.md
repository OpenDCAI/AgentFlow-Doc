---
title: Registration Guide
createTime: 2025/02/04 10:00:00
icon: mdi:book-open-page-variant
permalink: /en/dev_guide/backend/registration-guide/
---

# Registration Guide

This article provides a detailed tool registration decision guide.

## Decision Tree

```
                     Start: I need to develop a new tool
                                  │
                                  ▼
               ┌─────────────────────────────────────┐
               │ Q1: Need persistent connections or   │
               │     long-lived state?                │
               │                                     │
               │ - TCP/WebSocket connections          │
               │ - Process handles                    │
               │ - VM/Container instances             │
               │ - Database connection pools          │
               │ - Browser Sessions                   │
               └─────────────────────────────────────┘
                         │              │
                        Yes             No
                         │              │
                         ▼              ▼
              ┌──────────────┐  ┌─────────────────────────┐
              │ Backend class │  │ Q2: Need to preload      │
              │              │  │     resources?            │
              │ Continue...  │  │                           │
              └──────────────┘  │ - ML models               │
                         │      │ - Vector indices           │
                         │      │ - Large config files       │
                         │      └─────────────────────────┘
                         │               │           │
                         │              Yes          No
                         │               │           │
                         │               ▼           ▼
                         │    ┌──────────────┐  ┌──────────────────┐
                         │    │ Backend class │  │ @register_api_tool │
                         │    │ (Shared       │  │ (Lightweight tool) │
                         │    │  resource)    │  │                    │
                         │    └──────────────┘  └──────────────────┘
                         │
                         ▼
              ┌───────────────────────────────────┐
              │ Q3: Are resources globally shared   │
              │     or user-independent?            │
              └───────────────────────────────────┘
                         │              │
                    Globally       User-independent
                     shared
                         │              │
                         ▼              ▼
              ┌─────────────────┐  ┌─────────────────┐
              │ Implement        │  │ Implement        │
              │ warmup()         │  │ initialize()     │
              │ shutdown()       │  │ cleanup()        │
              │                 │  │                 │
              │ e.g., RAG, Model│  │ e.g., VM, Bash  │
              └─────────────────┘  └─────────────────┘
                         │              │
                         └──────┬───────┘
                                ▼
               ┌─────────────────────────────────────┐
               │ Q4: Need both types of resources?     │
               │                                     │
               │ e.g., Browser (shared process +      │
               │       independent pages)             │
               └─────────────────────────────────────┘
                         │              │
                        Yes             No
                         │              │
                         ▼              ▼
              ┌─────────────────┐  ┌─────────────────┐
              │ Hybrid Backend  │  │ Done!           │
              │ Implement all   │  │                 │
              │ four methods    │  │                 │
              └─────────────────┘  └─────────────────┘
```

## Edge Case Guide

| Scenario | Recommended Choice | Reason |
|----------|-------------------|--------|
| Complex API Client with authentication | APITool | Authentication is stateless |
| API Client with connection pool | Backend (warmup) | Connection pool needs lifecycle management |
| API requiring Session Cookies | Backend (initialize) | Session state maintained across requests |
| Simple HTTP API call | APITool | Request-response pattern |
| API requiring retry logic | APITool | Retry is a stateless operation |
| API requiring rate limiting/circuit breaking | Backend (warmup) | Rate limiter needs global state |

## Implementation Comparison Table

| Type | Base Class | Session | Lifecycle Methods | Tool Naming | Example |
|------|-----------|---------|-------------------|-------------|---------|
| Lightweight API Tool | None | ❌ | None | `action` | WebSearch |
| Shared Resource Backend | `Backend` | ❌ | `warmup()`, `shutdown()` | `resource:action` | RAG |
| Session Resource Backend | `Backend` | ✅ | `initialize()`, `cleanup()` | `resource:action` | VM |
| Hybrid Backend | `Backend` | ✅ | All four | `resource:action` | Browser |

## FAQ

### Q: When to use APITool?

When your tool:
- Calls external HTTP APIs
- Does not need to maintain state
- Does not need to preload resources
- Each call is independent of others

### Q: When to use Backend?

When your tool:
- Needs to preload models or resources
- Needs to maintain persistent connections
- Needs to allocate independent resources for each user
- Needs to manage resource lifecycles

### Q: When to implement warmup()?

When you need to:
- Load ML models
- Establish connection pools
- Initialize global caches
- Start background processes

### Q: When to implement initialize()?

When you need to:
- Allocate independent resources for each user
- Maintain user-level state
- Isolate operations between users

## CI/CD Validation

It is recommended to validate configuration in CI/CD:

```bash
python -m sandbox validate --config configs/profiles/production.json --strict
```

Validation checks:

| Check Item | Description |
|-----------|-------------|
| `backend_class` path | Verify class path is importable |
| @tool decorator | Verify tool methods exist |
| API tool registration | Verify config_key matches |
| Config completeness | Verify required config items |
