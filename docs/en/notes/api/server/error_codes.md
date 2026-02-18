---
title: Error Codes
createTime: 2025/02/04 10:00:00
icon: mdi:alert-circle
permalink: /en/api/server/error-codes/
---

# Error Codes

This document describes the error code definitions for AgentFlow.

## Error Code Categories

### Success (0)

| Code | Description |
|------|-------------|
| 0 | Success |

### Client Errors (1xxx)

| Code | Description |
|------|-------------|
| 1001 | Tool not found |
| 1002 | Parameter error |
| 1003 | Session error |
| 1004 | Worker not found |
| 1005 | Resource type not found |
| 1006 | Insufficient permissions |

### Server Errors (2xxx)

| Code | Description |
|------|-------------|
| 2001 | Backend error |
| 2002 | Execution timeout |
| 2003 | Backend not warmed up |
| 2004 | Resource unavailable |

### System Errors (5xxx)

| Code | Description |
|------|-------------|
| 5000 | Internal error |
| 5001 | Configuration error |
| 5002 | Service unavailable |

## Error Response Format

```json
{
  "code": 1001,
  "message": "Tool not found: invalid_tool",
  "data": null,
  "meta": {
    "error_type": "ToolNotFoundError",
    "request_id": "xxx"
  }
}
```

## Error Handling Examples

### Python Client

```python
from sandbox import Sandbox, SandboxError

async def main():
    async with Sandbox() as sandbox:
        result = await sandbox.execute("vm:screenshot", {})

        if result.get("code") != 0:
            code = result.get("code")
            message = result.get("message")

            if code == 1001:
                print(f"Tool not found: {message}")
            elif code == 1003:
                print(f"Session error: {message}")
            elif code == 2002:
                print(f"Execution timeout: {message}")
            else:
                print(f"Error {code}: {message}")
        else:
            print(f"Success: {result['data']}")
```

### Error Retry Strategy

```python
async def execute_with_retry(sandbox, action, params, max_retries=3):
    for i in range(max_retries):
        result = await sandbox.execute(action, params)

        code = result.get("code", 0)

        # Success
        if code == 0:
            return result

        # Non-retryable errors
        if code in [1001, 1002, 1006]:
            raise Exception(f"Fatal error: {result['message']}")

        # Retryable errors
        if code in [2002, 5002]:
            if i < max_retries - 1:
                await asyncio.sleep(2 ** i)  # Exponential backoff
                continue

        break

    raise Exception(f"Failed after {max_retries} retries")
```

## Custom Error Codes

When developing backends, you can return custom error codes:

```python
from sandbox.server.backends.error_codes import ErrorCode

class MyBackend(Backend):
    @tool("my:action")
    async def action(self, param: str) -> Dict:
        if not param:
            return {
                "code": 1002,
                "message": "Parameter 'param' is required"
            }

        try:
            result = await do_something(param)
            return {"code": 0, "data": result}
        except TimeoutError:
            return {
                "code": 2002,
                "message": "Execution timeout"
            }
```
