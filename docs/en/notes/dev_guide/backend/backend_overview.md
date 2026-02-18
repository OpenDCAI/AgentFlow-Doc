---
title: Backend Development Overview
createTime: 2025/02/04 10:00:00
icon: mdi:view-dashboard
permalink: /en/dev_guide/backend/overview/
---

# Backend Development Overview

This article introduces the overall architecture and development patterns of the AgentFlow backend system.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                1. Lightweight API Tools                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ├── Registered using @register_api_tool decorator             │
│   ├── No need to inherit any class                              │
│   ├── Config auto-injected from the apis section of config.json │
│   ├── No Session required                                       │
│   └── Examples: WebSearch API, Translate API                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                2. Heavyweight Backend                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ├── Inherits Backend base class                               │
│   ├── Uses @tool decorator to mark tool methods                 │
│   ├── Optionally implements warmup/shutdown (global resources)  │
│   ├── Optionally implements initialize/cleanup (Session resources)│
│   └── Examples: VM, RAG, Browser, Bash Terminal                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
sandbox/server/backends/
├── __init__.py           # Exports
├── base.py               # Backend base class
│
├── resources/            # Heavyweight backends
│   ├── vm.py             # VM backend
│   ├── rag.py            # RAG backend
│   ├── bash.py           # Bash backend
│   ├── browser.py        # Browser backend
│   └── code_executor.py  # Code Executor backend
│
└── tools/                # Lightweight API tools
    ├── __init__.py       # Tool registration entry
    └── websearch.py      # WebSearch tool
```

## Backend Base Class

```python
class Backend(ABC):
    """Backend base class - all methods are optional"""

    name: str           # Backend name
    description: str    # Description
    version: str        # Version

    # Global lifecycle (optional)
    async def warmup(self) -> None:
        """Warmup resources (called on server startup)"""
        pass

    async def shutdown(self) -> None:
        """Shutdown resources (called on server shutdown)"""
        pass

    # Session lifecycle (optional)
    async def initialize(self, worker_id: str, config: Dict) -> Dict:
        """Create Session (create independent resources for a worker)"""
        raise NotImplementedError

    async def cleanup(self, worker_id: str, session_info: Dict) -> None:
        """Destroy Session (clean up worker resources)"""
        raise NotImplementedError
```

## Tool Registration Mechanism

### @tool Decorator (Backend Methods)

```python
from sandbox.server.core.decorators import tool

class MyBackend(Backend):
    @tool("my:action")
    async def action(self, param: str, session_info: Dict) -> Dict:
        return {"result": "..."}
```

### @register_api_tool Decorator (Standalone Functions)

```python
from sandbox.server.backends.tools import register_api_tool

@register_api_tool("search", config_key="websearch")
async def search(query: str, **config) -> Dict:
    return {"results": [...]}
```

## Tool Naming Conventions

| Format | Example | Type |
|--------|---------|------|
| `action` | `search`, `translate` | Lightweight API tool |
| `resource:action` | `vm:screenshot`, `rag:search` | Heavyweight Backend |

## Configuration System

### Backend Configuration

```json
{
  "resources": {
    "my": {
      "enabled": true,
      "backend_class": "sandbox.server.backends.resources.my.MyBackend",
      "config": {
        "option1": "value1"
      }
    }
  }
}
```

### API Tool Configuration

```json
{
  "apis": {
    "websearch": {
      "api_key": "${SERPER_API_KEY}",
      "max_results": 10
    }
  }
}
```

## Next Steps

- [API Tool Development](./api_tool_development.md) - Develop lightweight tools
- [Resource Backend Development](./resource_backend_development.md) - Develop heavyweight backends
- [Registration Guide](./registration_guide.md) - Detailed registration decision tree
