---
title: 后端开发概述
createTime: 2025/02/04 10:00:00
icon: mdi:view-dashboard
permalink: /zh/dev_guide/backend/overview/
---

# 后端开发概述

本文介绍 AgentFlow 后端系统的整体架构和开发模式。

## 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                1. 轻量级 API 工具                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ├── 使用 @register_api_tool 装饰器注册                        │
│   ├── 不需要继承任何类                                          │
│   ├── 配置从 config.json 的 apis 部分自动注入                   │
│   ├── 不需要 Session                                            │
│   └── 示例: WebSearch API, Translate API                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                2. 重量级 Backend                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ├── 继承 Backend 基类                                         │
│   ├── 使用 @tool 装饰器标记工具方法                             │
│   ├── 可选实现 warmup/shutdown（全局资源）                      │
│   ├── 可选实现 initialize/cleanup（Session 资源）              │
│   └── 示例: VM, RAG, Browser, Bash Terminal                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 文件结构

```
sandbox/server/backends/
├── __init__.py           # 导出
├── base.py               # Backend 基类
│
├── resources/            # 重量级后端
│   ├── vm.py             # VM 后端
│   ├── rag.py            # RAG 后端
│   ├── bash.py           # Bash 后端
│   ├── browser.py        # Browser 后端
│   └── code_executor.py  # Code Executor 后端
│
└── tools/                # 轻量级 API 工具
    ├── __init__.py       # 工具注册入口
    └── websearch.py      # WebSearch 工具
```

## Backend 基类

```python
class Backend(ABC):
    """后端基类 - 所有方法都是可选的"""
    
    name: str           # 后端名称
    description: str    # 描述
    version: str        # 版本
    
    # 全局生命周期（可选）
    async def warmup(self) -> None:
        """预热资源（服务器启动时调用）"""
        pass
    
    async def shutdown(self) -> None:
        """关闭资源（服务器关闭时调用）"""
        pass
    
    # Session 生命周期（可选）
    async def initialize(self, worker_id: str, config: Dict) -> Dict:
        """创建 Session（为 worker 创建独立资源）"""
        raise NotImplementedError
    
    async def cleanup(self, worker_id: str, session_info: Dict) -> None:
        """销毁 Session（清理 worker 资源）"""
        raise NotImplementedError
```

## 工具注册机制

### @tool 装饰器（Backend 方法）

```python
from sandbox.server.core.decorators import tool

class MyBackend(Backend):
    @tool("my:action")
    async def action(self, param: str, session_info: Dict) -> Dict:
        return {"result": "..."}
```

### @register_api_tool 装饰器（独立函数）

```python
from sandbox.server.backends.tools import register_api_tool

@register_api_tool("search", config_key="websearch")
async def search(query: str, **config) -> Dict:
    return {"results": [...]}
```

## 工具命名规范

| 格式 | 示例 | 类型 |
|------|------|------|
| `action` | `search`, `translate` | 轻量级 API 工具 |
| `resource:action` | `vm:screenshot`, `rag:search` | 重量级 Backend |

## 配置系统

### Backend 配置

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

### API 工具配置

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

## 下一步

- [API 工具开发](./api_tool_development.md) - 开发轻量级工具
- [资源后端开发](./resource_backend_development.md) - 开发重量级后端
- [注册指南](./registration_guide.md) - 详细的注册决策树
