---
title: Sandbox Class
createTime: 2025/02/04 10:00:00
icon: mdi:package-variant
permalink: /en/api/client/sandbox/
---

# Sandbox Class

The `Sandbox` class is AgentFlow's user-facing class that provides a unified interface for interacting with the HTTP service.

## Class Definition

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

## Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `server_url` | str | "http://localhost:18890" | Server address |
| `worker_id` | str | Auto-generated | Worker ID |
| `config` | SandboxConfig | None | Full configuration object |
| `warmup_resources` | List[str] | None | List of resources to warm up on startup |
| `auto_start_server` | bool | False | Whether to auto-start the server |
| `server_config_path` | str | None | Server configuration file path |
| `timeout` | float | 60.0 | Timeout duration |
| `retry_count` | int | 3 | Retry count |

## Methods

### start

Start the Sandbox.

```python
async def start(
    self,
    warmup_resources: Optional[List[str]] = None
) -> "Sandbox":
    ...
```

**Example**:

```python
sandbox = Sandbox()
await sandbox.start(warmup_resources=["rag", "vm"])
```

### close

Close the connection.

```python
async def close(self) -> None:
    ...
```

### warmup

Warm up backend resources.

```python
async def warmup(
    self,
    resources: Optional[Union[str, List[str]]] = None
) -> Dict[str, Any]:
    ...
```

**Example**:

```python
# Warm up all backends
await sandbox.warmup()

# Warm up specific backends
await sandbox.warmup(["rag", "vm"])

# Warm up single backend
await sandbox.warmup("rag")
```

### create_session

Create a Session.

```python
async def create_session(
    self,
    resources: Union[str, List[str], Dict[str, Dict[str, Any]]],
    config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    ...
```

**Example**:

```python
# Single resource
await sandbox.create_session("vm")

# Single resource with config
await sandbox.create_session("vm", {"screen_size": [1920, 1080]})

# Multiple resources
await sandbox.create_session(["vm", "bash"])

# Multiple resources with config
await sandbox.create_session({
    "vm": {"screen_size": [1920, 1080]},
    "bash": {"cwd": "/tmp"}
})
```

### destroy_session

Destroy a Session.

```python
async def destroy_session(
    self,
    resources: Optional[Union[str, List[str]]] = None
) -> Dict[str, Any]:
    ...
```

**Example**:

```python
# Destroy single
await sandbox.destroy_session("vm")

# Destroy multiple
await sandbox.destroy_session(["vm", "bash"])

# Destroy all
await sandbox.destroy_session()
```

### execute

Execute a tool.

```python
async def execute(
    self,
    action: str,
    params: Optional[Dict[str, Any]] = None,
    timeout: Optional[int] = None
) -> Dict[str, Any]:
    ...
```

**Example**:

```python
# Execute screenshot
result = await sandbox.execute("vm:screenshot", {})

# Execute click
result = await sandbox.execute("vm:click", {"x": 100, "y": 200})

# Execute search
result = await sandbox.execute("search", {"query": "hello"})
```

### list_sessions

List current Sessions.

```python
async def list_sessions(self) -> Dict[str, Any]:
    ...
```

### get_status

Get server status.

```python
async def get_status(self) -> Dict[str, Any]:
    ...
```

### get_tools

Get available tools list.

```python
async def get_tools(
    self,
    include_hidden: bool = False
) -> List[Dict[str, Any]]:
    ...
```

### reinitialize

Reinitialize resources.

```python
async def reinitialize(
    self,
    resource_type: str,
    new_config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    ...
```

### refresh_sessions

Refresh Session lifetime.

```python
async def refresh_sessions(
    self,
    resource_type: Optional[str] = None
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

## Synchronous Methods

Each async method has a corresponding synchronous version (with `_sync` suffix):

```python
sandbox.start_sync()
sandbox.execute_sync("vm:screenshot", {})
sandbox.create_session_sync("vm")
sandbox.close_sync()
```

## Context Managers

### Asynchronous

```python
async with Sandbox() as sandbox:
    await sandbox.execute("vm:screenshot", {})
```

### Synchronous

```python
with Sandbox() as sandbox:
    sandbox.execute_sync("vm:screenshot", {})
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `worker_id` | str | Worker ID |
| `is_connected` | bool | Whether connected |
| `is_started` | bool | Whether started |
| `server_url` | str | Server address |
| `client` | HTTPServiceClient | Underlying client |