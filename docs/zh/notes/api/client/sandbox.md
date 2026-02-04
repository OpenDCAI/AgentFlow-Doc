---
title: Sandbox 类
createTime: 2025/02/04 10:00:00
icon: mdi:package-variant
permalink: /zh/api/client/sandbox/
---

# Sandbox 类

`Sandbox` 是 AgentFlow 的用户门面类，提供统一的接口与 HTTP 服务交互。

## 类定义

```python
class Sandbox:
    def __init__(
        self,
        server_url: str = "http://localhost:18890",
        worker_id: Optional[str] = None,
        config: Optional[SandboxConfig] = None,
        warmup_resources: Optional[List[str]] = None,
        **kwargs
    ):
        ...
```

## 构造函数参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `server_url` | str | "http://localhost:18890" | 服务器地址 |
| `worker_id` | str | 自动生成 | Worker ID |
| `config` | SandboxConfig | None | 完整配置对象 |
| `warmup_resources` | List[str] | None | 启动时预热的资源列表 |
| `auto_start_server` | bool | False | 是否自动启动服务器 |
| `server_config_path` | str | None | 服务器配置文件路径 |
| `timeout` | float | 60.0 | 超时时间 |
| `retry_count` | int | 3 | 重试次数 |

## 方法

### start

启动 Sandbox。

```python
async def start(
    self,
    warmup_resources: Optional[List[str]] = None
) -> "Sandbox":
    ...
```

**示例**:

```python
sandbox = Sandbox()
await sandbox.start(warmup_resources=["rag", "vm"])
```

### close

关闭连接。

```python
async def close(self) -> None:
    ...
```

### warmup

预热后端资源。

```python
async def warmup(
    self,
    resources: Optional[Union[str, List[str]]] = None
) -> Dict[str, Any]:
    ...
```

**示例**:

```python
# 预热所有后端
await sandbox.warmup()

# 预热指定后端
await sandbox.warmup(["rag", "vm"])

# 预热单个后端
await sandbox.warmup("rag")
```

### create_session

创建 Session。

```python
async def create_session(
    self,
    resources: Union[str, List[str], Dict[str, Dict[str, Any]]],
    config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    ...
```

**示例**:

```python
# 单个资源
await sandbox.create_session("vm")

# 单个资源带配置
await sandbox.create_session("vm", {"screen_size": [1920, 1080]})

# 多个资源
await sandbox.create_session(["vm", "bash"])

# 多个资源带配置
await sandbox.create_session({
    "vm": {"screen_size": [1920, 1080]},
    "bash": {"cwd": "/tmp"}
})
```

### destroy_session

销毁 Session。

```python
async def destroy_session(
    self,
    resources: Optional[Union[str, List[str]]] = None
) -> Dict[str, Any]:
    ...
```

**示例**:

```python
# 销毁单个
await sandbox.destroy_session("vm")

# 销毁多个
await sandbox.destroy_session(["vm", "bash"])

# 销毁所有
await sandbox.destroy_session()
```

### execute

执行工具。

```python
async def execute(
    self, 
    action: str, 
    params: Optional[Dict[str, Any]] = None,
    timeout: Optional[int] = None
) -> Dict[str, Any]:
    ...
```

**示例**:

```python
# 执行截图
result = await sandbox.execute("vm:screenshot", {})

# 执行点击
result = await sandbox.execute("vm:click", {"x": 100, "y": 200})

# 执行搜索
result = await sandbox.execute("search", {"query": "hello"})
```

### list_sessions

列出当前 Session。

```python
async def list_sessions(self) -> Dict[str, Any]:
    ...
```

### get_status

获取服务器状态。

```python
async def get_status(self) -> Dict[str, Any]:
    ...
```

### get_tools

获取可用工具列表。

```python
async def get_tools(
    self,
    include_hidden: bool = False
) -> List[Dict[str, Any]]:
    ...
```

### reinitialize

重新初始化资源。

```python
async def reinitialize(
    self,
    resource_type: str,
    new_config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    ...
```

### refresh_sessions

刷新 Session 存活时间。

```python
async def refresh_sessions(
    self,
    resource_type: Optional[str] = None
) -> Dict[str, Any]:
    ...
```

### shutdown_server

关闭服务器。

```python
async def shutdown_server(
    self, 
    force: bool = False,
    cleanup_sessions: bool = True
) -> Dict[str, Any]:
    ...
```

## 同步方法

每个异步方法都有对应的同步版本（后缀 `_sync`）：

```python
sandbox.start_sync()
sandbox.execute_sync("vm:screenshot", {})
sandbox.create_session_sync("vm")
sandbox.close_sync()
```

## 上下文管理器

### 异步

```python
async with Sandbox() as sandbox:
    await sandbox.execute("vm:screenshot", {})
```

### 同步

```python
with Sandbox() as sandbox:
    sandbox.execute_sync("vm:screenshot", {})
```

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `worker_id` | str | Worker ID |
| `is_connected` | bool | 是否已连接 |
| `is_started` | bool | 是否已启动 |
| `server_url` | str | 服务器地址 |
| `client` | HTTPServiceClient | 底层客户端 |
