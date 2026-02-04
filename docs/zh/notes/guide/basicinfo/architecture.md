---
title: 架构设计
createTime: 2025/02/04 10:00:00
icon: material-symbols:auto-transmission-sharp
permalink: /zh/guide/architecture/
---

# 架构设计

本文介绍 AgentFlow Sandbox 的整体架构设计。

## 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          用户层 (User Layer)                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Sandbox (Facade)                              │   │
│  │  - 统一入口，简化用户交互                                          │   │
│  │  - 自动服务器启动/检测                                             │   │
│  │  - 支持同步/异步双模式                                             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│                              ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              HTTPServiceClient (HTTP Client)                     │   │
│  │  - HTTP 请求封装                                                 │   │
│  │  - Worker ID 管理                                                │   │
│  │  - 自动重试/错误处理                                             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│                              │ HTTP/JSON                                  │
└─────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────────┐
│                        服务层 (Server Layer)                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              HTTPServiceServer (FastAPI)                          │   │
│  │  - 持有工具数据结构（三层映射）                                    │   │
│  │  - 持有 Backend 实例                                              │   │
│  │  - 反射扫描 @tool 标记并注册                                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│        ┌─────────────────────┴─────────────────────┐                   │
│        ▼                                             ▼                   │
│  ┌──────────────────┐                    ┌──────────────────┐          │
│  │  ToolExecutor    │                    │ ResourceRouter   │          │
│  │  - 工具执行      │                    │  - Session 管理   │          │
│  │  - 路由解析      │                    │  - 资源路由       │          │
│  └──────────────────┘                    └──────────────────┘          │
│                              │                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Backend System                                │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   │
│  │  │ VMBackend    │  │ RAGBackend   │  │ API Tools    │          │   │
│  │  │ (Session)    │  │ (共享资源)   │  │ (轻量级)     │          │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. Sandbox (用户门面)

**位置**: `sandbox/sandbox.py`

**职责**:
- 提供统一的用户接口
- 封装 `HTTPServiceClient`
- 自动服务器启动/检测
- Session 批量创建管理
- 支持同步/异步双模式

**关键方法**:

| 方法 | 说明 |
|------|------|
| `start()` | 启动服务器 |
| `warmup()` | 预热后端资源 |
| `create_session()` | 创建 Session |
| `execute()` | 执行工具 |
| `destroy_session()` | 销毁 Session |
| `close()` | 关闭连接 |

### 2. HTTPServiceServer (HTTP 服务器)

**位置**: `sandbox/server/app.py`

**职责**:
- 持有工具数据结构（三层映射）
- 持有 Backend 实例
- 反射扫描 @tool 标记并注册
- 调度请求到对应的工具函数

### 3. ToolExecutor (工具执行器)

**位置**: `sandbox/server/core/tool_executor.py`

**职责**:
- 工具执行逻辑
- 资源类型前缀解析
- Session 自动注入
- 临时 Session 管理

### 4. ResourceRouter (资源路由器)

**位置**: `sandbox/server/core/resource_router.py`

**职责**:
- Session 生命周期管理
- Worker 资源隔离
- 注册 Backend 的 initialize/cleanup 函数

## 数据流

### 执行命令流程

```
用户代码
  │
  │ sandbox.execute("vm:screenshot", {})
  ▼
Sandbox.execute()
  │
  │ await client.execute()
  ▼
HTTPServiceClient
  │
  │ POST /execute
  ▼
HTTPServiceServer (routes.py)
  │
  │ await server.execute()
  ▼
ToolExecutor.execute()
  │
  │ 1. 解析: "vm:screenshot" → resource_type="vm"
  │ 2. 查找工具函数
  │ 3. 获取/创建 Session
  │ 4. 注入参数
  │ 5. 执行工具
  │ 6. 临时 Session 自动销毁
  ▼
返回结果
```

## 生命周期管理

### Backend 生命周期方法

| 方法 | 调用时机 | 作用 |
|------|---------|------|
| `warmup()` | 服务器启动或显式调用 | 预热共享资源 |
| `initialize()` | 创建 Session | 分配 worker 专属资源 |
| `cleanup()` | 销毁 Session | 回收 worker 资源 |
| `shutdown()` | 服务器关闭 | 释放所有共享资源 |

### Sandbox API 与 Backend 生命周期对应

| Sandbox API | Backend 方法 | 说明 |
|-------------|-------------|------|
| `start()` | `warmup()` | 启动服务器，可选预热 |
| `warmup(resources)` | `warmup()` | 显式预热后端 |
| `create_session(type, config)` | `initialize()` | 创建 Session |
| `execute(action, params)` | 工具函数 | 执行工具 |
| `destroy_session(type)` | `cleanup()` | 销毁 Session |
| `shutdown_server()` | `shutdown()` | 关闭服务器 |

## 项目结构

```
sandbox/
├── __init__.py              # 模块导出
├── sandbox.py               # 用户门面类
├── client.py                # HTTP 客户端
│
├── server/                  # 服务器模块
│   ├── app.py               # HTTPServiceServer
│   ├── routes.py            # HTTP 路由定义
│   ├── config_loader.py     # 配置加载器
│   │
│   ├── core/                # 核心组件
│   │   ├── decorators.py    # @tool 装饰器
│   │   ├── tool_executor.py # 工具执行器
│   │   └── resource_router.py # 资源路由器
│   │
│   └── backends/            # 后端实现
│       ├── base.py          # Backend 基类
│       ├── resources/       # 重量级后端
│       └── tools/           # 轻量级 API 工具
│
└── configs/                 # 配置文件
```
