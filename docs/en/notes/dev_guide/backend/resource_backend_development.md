---
title: Resource Backend Development
createTime: 2025/02/04 10:00:00
icon: mdi:cube
permalink: /en/dev_guide/backend/resource-backend/
---

# Resource Backend Development

This article introduces how to develop heavyweight Backend services.

## Features

- ✅ Inherits `Backend` base class
- ✅ Uses `@tool` decorator to mark tool methods
- ✅ Optionally implements lifecycle methods
- ✅ Supports Session management

## Backend Types

### 1. Shared Resource Backend (e.g., RAG)

Only implements `warmup()` and `shutdown()`, no Session needed:

```python
from sandbox.server.backends.base import Backend
from sandbox.server.core.decorators import tool

class RAGBackend(Backend):
    name = "rag"
    description = "RAG Backend"
    version = "1.0.0"

    def __init__(self, config=None):
        super().__init__(config)
        self._model = None

    async def warmup(self) -> None:
        """Warmup: Load Embedding model"""
        self._model = load_model()

    async def shutdown(self) -> None:
        """Shutdown: Release model"""
        self._model = None

    @tool("rag:search")
    async def search(self, query: str, top_k: int = 10) -> Dict:
        results = self._model.search(query, top_k)
        return {"code": 0, "data": {"results": results}}
```

### 2. Session Resource Backend (e.g., VM)

Only implements `initialize()` and `cleanup()`, requires Session:

```python
class VMBackend(Backend):
    name = "vm"
    description = "VM Backend"
    version = "1.0.0"

    async def initialize(self, worker_id: str, config: Dict) -> Dict:
        """Create Session - Allocate VM instance"""
        screen_size = config.get("screen_size", [1920, 1080])
        vm = create_vm(screen_size)
        return {"vm": vm, "screen_size": screen_size}

    async def cleanup(self, worker_id: str, session_info: Dict) -> None:
        """Destroy Session - Release VM"""
        vm = session_info.get("data", {}).get("vm")
        if vm:
            vm.close()

    @tool("vm:screenshot")
    async def screenshot(self, session_info: Dict) -> Dict:
        vm = session_info["data"]["vm"]
        image = vm.screenshot()
        return {"code": 0, "data": {"image": image}}

    @tool("vm:click")
    async def click(self, x: int, y: int, session_info: Dict) -> Dict:
        vm = session_info["data"]["vm"]
        vm.click(x, y)
        return {"code": 0, "data": {"clicked": [x, y]}}
```

### 3. Hybrid Backend (e.g., Browser)

Implements all lifecycle methods:

```python
class BrowserBackend(Backend):
    name = "browser"
    description = "Browser Backend"
    version = "1.0.0"

    async def warmup(self) -> None:
        """Warmup: Launch browser process"""
        self._browser = await launch_browser()

    async def shutdown(self) -> None:
        """Shutdown: Stop browser process"""
        await self._browser.close()

    async def initialize(self, worker_id: str, config: Dict) -> Dict:
        """Create Session - Open new page"""
        page = await self._browser.new_page()
        return {"page": page}

    async def cleanup(self, worker_id: str, session_info: Dict) -> None:
        """Destroy Session - Close page"""
        page = session_info.get("data", {}).get("page")
        if page:
            await page.close()

    @tool("browser:goto")
    async def goto(self, url: str, session_info: Dict) -> Dict:
        page = session_info["data"]["page"]
        await page.goto(url)
        return {"code": 0, "data": {"url": url}}
```

## Development Steps

### 1. Create Backend File

```python
# sandbox/server/backends/resources/my_backend.py
from typing import Dict, Any, Optional
from ..base import Backend, BackendConfig
from ...core.decorators import tool

class MyBackend(Backend):
    name = "my"
    description = "My Custom Backend"
    version = "1.0.0"

    def __init__(self, config: Optional[BackendConfig] = None):
        super().__init__(config)
        # Initialization

    # Implement the lifecycle methods you need...

    @tool("my:action")
    async def action(self, param: str, session_info: Dict = None) -> Dict:
        return {"code": 0, "data": {"result": "..."}}
```

### 2. Add Configuration

```json
{
  "resources": {
    "my": {
      "enabled": true,
      "backend_class": "sandbox.server.backends.resources.my_backend.MyBackend",
      "config": {
        "option1": "value1"
      }
    }
  }
}
```

### 3. Use the Backend

```python
async with Sandbox() as sandbox:
    # If Session is needed
    await sandbox.create_session("my", {"option": "value"})

    # Execute tool
    result = await sandbox.execute("my:action", {"param": "value"})

    # Destroy Session
    await sandbox.destroy_session("my")
```

## @tool Decorator

```python
@tool(name: str, resource_type: str = None)
```

| Parameter | Description |
|-----------|-------------|
| `name` | Tool name (e.g., `"vm:screenshot"`) |
| `resource_type` | Resource type (optional, automatically parsed from name) |

## session_info Parameter

If the Backend implements `initialize()`, tool functions can receive the `session_info` parameter:

```python
@tool("my:action")
async def action(self, param: str, session_info: Dict) -> Dict:
    # session_info structure
    # {
    #     "session_id": "xxx",
    #     "worker_id": "sandbox_xxx",
    #     "resource_type": "my",
    #     "data": {...}  # Data returned by initialize()
    # }

    data = session_info["data"]
    resource = data["resource"]
    # Use the resource...
```

## Lifecycle Sequence

```
sandbox.start()
    └── backend.warmup()  # If implemented

sandbox.create_session("my", config)
    └── backend.initialize(worker_id, config)

sandbox.execute("my:action", params)
    └── backend.action(**params, session_info=...)

sandbox.destroy_session("my")
    └── backend.cleanup(worker_id, session_info)

sandbox.shutdown_server()
    └── backend.shutdown()  # If implemented
```

## Best Practices

### 1. Error Handling

```python
@tool("my:action")
async def action(self, param: str, session_info: Dict) -> Dict:
    try:
        result = do_something(param)
        return {"code": 0, "data": result}
    except ValueError as e:
        return {"code": 1002, "message": str(e)}
    except TimeoutError:
        return {"code": 2002, "message": "Timeout"}
    except Exception as e:
        return {"code": 5000, "message": str(e)}
```

### 2. Resource Cleanup

```python
async def cleanup(self, worker_id: str, session_info: Dict) -> None:
    try:
        resource = session_info.get("data", {}).get("resource")
        if resource:
            resource.close()
    except Exception as e:
        logger.warning(f"Cleanup error: {e}")
```

### 3. Logging

```python
import logging
logger = logging.getLogger("MyBackend")

class MyBackend(Backend):
    async def initialize(self, worker_id: str, config: Dict) -> Dict:
        logger.info(f"📦 [{worker_id}] Creating session...")
        # ...
        logger.info(f"✅ [{worker_id}] Session created")
```
