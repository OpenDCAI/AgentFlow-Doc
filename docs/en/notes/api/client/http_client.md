---
title: HTTPServiceClient Class
createTime: 2025/02/04 10:00:00
icon: mdi:web
permalink: /en/api/client/http-client/
---

# HTTPServiceClient Class

The `HTTPServiceClient` is the underlying HTTP client used for communicating with the server.

## Class Definition

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

## Methods

### connect

Connect to the server.

```python
async def connect(self) -> None:
    ...
```

### close

Close the connection.

```python
async def close(self) -> None:
    ...
```

### execute

Execute a tool.

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

Create a Session.

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

Destroy a Session.

```python
async def destroy_session(
    self,
    resource_type: str
) -> Dict[str, Any]:
    ...
```

### list_sessions

List Sessions.

```python
async def list_sessions(self) -> Dict[str, Any]:
    ...
```

### list_tools

List tools.

```python
async def list_tools(
    self,
    include_hidden: bool = False
) -> List[Dict[str, Any]]:
    ...
```

### get_status

Get status.

```python
async def get_status(self) -> Dict[str, Any]:
    ...
```

### refresh_session

Refresh Session.

```python
async def refresh_session(
    self,
    resource_type: str = None
) -> Dict[str, Any]:
    ...
```

### shutdown_server

Shutdown the server.

```python
async def shutdown_server(
    self,
    force: bool = False,
    cleanup_sessions: bool = True
) -> Dict[str, Any]:
    ...
```

## Usage Example

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
        # Execute tool
        result = await client.execute("vm:screenshot", {})
        print(result)
    finally:
        await client.close()
```

## Exceptions

### HTTPClientError

HTTP client error base class.

```python
class HTTPClientError(Exception):
    pass
```

Subclasses:
- `ConnectionError` - Connection error
- `TimeoutError` - Timeout error
- `RequestError` - Request error