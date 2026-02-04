---
title: HTTPServiceClient 类
createTime: 2025/02/04 10:00:00
icon: mdi:web
permalink: /zh/api/client/http-client/
---

# HTTPServiceClient 类

`HTTPServiceClient` 是底层 HTTP 客户端，用于与服务器通信。

## 类定义

```python
class HTTPServiceClient:
    def __init__(
        self,
        base_url: str = "http://localhost:18890",
        worker_id: str = None,
        config: HTTPClientConfig = None
    ):
        ...
```

## HTTPClientConfig

```python
@dataclass
class HTTPClientConfig:
    base_url: str = "http://localhost:18890"
    timeout: float = 60.0
    max_retries: int = 3
    worker_id: str = None
    auto_heartbeat: bool = False
```

## 方法

### connect

连接到服务器。

```python
async def connect(self) -> None:
    ...
```

### close

关闭连接。

```python
async def close(self) -> None:
    ...
```

### execute

执行工具。

```python
async def execute(
    self,
    action: str,
    params: Dict[str, Any] = None,
    timeout: int = None
) -> Dict[str, Any]:
    ...
```

### create_session

创建 Session。

```python
async def create_session(
    self,
    resource_type: str,
    config: Dict[str, Any] = None,
    custom_name: str = None
) -> Dict[str, Any]:
    ...
```

### destroy_session

销毁 Session。

```python
async def destroy_session(
    self,
    resource_type: str
) -> Dict[str, Any]:
    ...
```

### list_sessions

列出 Session。

```python
async def list_sessions(self) -> Dict[str, Any]:
    ...
```

### list_tools

列出工具。

```python
async def list_tools(
    self,
    include_hidden: bool = False
) -> List[Dict[str, Any]]:
    ...
```

### get_status

获取状态。

```python
async def get_status(self) -> Dict[str, Any]:
    ...
```

### refresh_session

刷新 Session。

```python
async def refresh_session(
    self,
    resource_type: str = None
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

## 使用示例

```python
from sandbox.client import HTTPServiceClient, HTTPClientConfig

async def main():
    config = HTTPClientConfig(
        base_url="http://127.0.0.1:18890",
        timeout=60.0,
        max_retries=3,
        worker_id="my_worker"
    )
    
    client = HTTPServiceClient(config=config)
    await client.connect()
    
    try:
        # 执行工具
        result = await client.execute("vm:screenshot", {})
        print(result)
    finally:
        await client.close()
```

## 异常

### HTTPClientError

HTTP 客户端错误基类。

```python
class HTTPClientError(Exception):
    pass
```

子类：
- `ConnectionError` - 连接错误
- `TimeoutError` - 超时错误
- `RequestError` - 请求错误
