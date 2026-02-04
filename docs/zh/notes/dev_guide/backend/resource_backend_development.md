---
title: 资源后端开发
createTime: 2025/02/04 10:00:00
icon: mdi:cube
permalink: /zh/dev_guide/backend/resource-backend/
---

# 资源后端开发

本文介绍如何开发重量级 Backend 后端。

## 特点

- ✅ 继承 `Backend` 基类
- ✅ 使用 `@tool` 装饰器标记工具方法
- ✅ 可选实现生命周期方法
- ✅ 支持 Session 管理

## Backend 类型

### 1. 共享资源后端（如 RAG）

只实现 `warmup()` 和 `shutdown()`，不需要 Session：

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
        """预热：加载 Embedding 模型"""
        self._model = load_model()
    
    async def shutdown(self) -> None:
        """关闭：释放模型"""
        self._model = None
    
    @tool("rag:search")
    async def search(self, query: str, top_k: int = 10) -> Dict:
        results = self._model.search(query, top_k)
        return {"code": 0, "data": {"results": results}}
```

### 2. Session 资源后端（如 VM）

只实现 `initialize()` 和 `cleanup()`，需要 Session：

```python
class VMBackend(Backend):
    name = "vm"
    description = "VM Backend"
    version = "1.0.0"
    
    async def initialize(self, worker_id: str, config: Dict) -> Dict:
        """创建 Session - 分配 VM 实例"""
        screen_size = config.get("screen_size", [1920, 1080])
        vm = create_vm(screen_size)
        return {"vm": vm, "screen_size": screen_size}
    
    async def cleanup(self, worker_id: str, session_info: Dict) -> None:
        """销毁 Session - 释放 VM"""
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

### 3. 混合后端（如 Browser）

同时实现所有生命周期方法：

```python
class BrowserBackend(Backend):
    name = "browser"
    description = "Browser Backend"
    version = "1.0.0"
    
    async def warmup(self) -> None:
        """预热：启动浏览器进程"""
        self._browser = await launch_browser()
    
    async def shutdown(self) -> None:
        """关闭：停止浏览器进程"""
        await self._browser.close()
    
    async def initialize(self, worker_id: str, config: Dict) -> Dict:
        """创建 Session - 新建页面"""
        page = await self._browser.new_page()
        return {"page": page}
    
    async def cleanup(self, worker_id: str, session_info: Dict) -> None:
        """销毁 Session - 关闭页面"""
        page = session_info.get("data", {}).get("page")
        if page:
            await page.close()
    
    @tool("browser:goto")
    async def goto(self, url: str, session_info: Dict) -> Dict:
        page = session_info["data"]["page"]
        await page.goto(url)
        return {"code": 0, "data": {"url": url}}
```

## 开发步骤

### 1. 创建 Backend 文件

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
        # 初始化
    
    # 实现需要的生命周期方法...
    
    @tool("my:action")
    async def action(self, param: str, session_info: Dict = None) -> Dict:
        return {"code": 0, "data": {"result": "..."}}
```

### 2. 添加配置

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

### 3. 使用后端

```python
async with Sandbox() as sandbox:
    # 如果需要 Session
    await sandbox.create_session("my", {"option": "value"})
    
    # 执行工具
    result = await sandbox.execute("my:action", {"param": "value"})
    
    # 销毁 Session
    await sandbox.destroy_session("my")
```

## @tool 装饰器

```python
@tool(name: str, resource_type: str = None)
```

| 参数 | 说明 |
|------|------|
| `name` | 工具名称（如 `"vm:screenshot"`） |
| `resource_type` | 资源类型（可选，自动从名称解析） |

## session_info 参数

如果 Backend 实现了 `initialize()`，工具函数可以接收 `session_info` 参数：

```python
@tool("my:action")
async def action(self, param: str, session_info: Dict) -> Dict:
    # session_info 结构
    # {
    #     "session_id": "xxx",
    #     "worker_id": "sandbox_xxx",
    #     "resource_type": "my",
    #     "data": {...}  # initialize() 返回的数据
    # }
    
    data = session_info["data"]
    resource = data["resource"]
    # 使用资源...
```

## 生命周期时序

```
sandbox.start()
    └── backend.warmup()  # 如果实现了

sandbox.create_session("my", config)
    └── backend.initialize(worker_id, config)

sandbox.execute("my:action", params)
    └── backend.action(**params, session_info=...)

sandbox.destroy_session("my")
    └── backend.cleanup(worker_id, session_info)

sandbox.shutdown_server()
    └── backend.shutdown()  # 如果实现了
```

## 最佳实践

### 1. 错误处理

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

### 2. 资源清理

```python
async def cleanup(self, worker_id: str, session_info: Dict) -> None:
    try:
        resource = session_info.get("data", {}).get("resource")
        if resource:
            resource.close()
    except Exception as e:
        logger.warning(f"Cleanup error: {e}")
```

### 3. 日志记录

```python
import logging
logger = logging.getLogger("MyBackend")

class MyBackend(Backend):
    async def initialize(self, worker_id: str, config: Dict) -> Dict:
        logger.info(f"📦 [{worker_id}] Creating session...")
        # ...
        logger.info(f"✅ [{worker_id}] Session created")
```
