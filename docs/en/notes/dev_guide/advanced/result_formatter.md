---
title: Result Formatting
createTime: 2025/02/04 10:00:00
icon: mdi:format-list-bulleted
permalink: /en/dev_guide/advanced/result-formatter/
---

# Result Formatting

This article introduces the tool result formatting mechanism in AgentFlow.

## Standard Response Format

All tools return a unified response format:

```json
{
  "code": 0,
  "message": "success",
  "data": {...},
  "meta": {
    "execution_time_ms": 150,
    "tool": "screenshot",
    "resource_type": "vm",
    "session_id": "vm_xxx_001",
    "temporary_session": false
  }
}
```

## Response Field Description

| Field | Type | Description |
|-------|------|-------------|
| `code` | int | Error code, 0 indicates success |
| `message` | string | Description message |
| `data` | object | Return data |
| `meta` | object | Metadata |

### meta Fields

| Field | Type | Description |
|-------|------|-------------|
| `execution_time_ms` | float | Execution time (milliseconds) |
| `tool` | string | Tool name |
| `resource_type` | string | Resource type (if applicable) |
| `session_id` | string | Session ID (if applicable) |
| `temporary_session` | bool | Whether it is a temporary Session |

## Tool Return Format

### Success Return

```python
@tool("my:action")
async def action(self, param: str) -> Dict:
    result = do_something(param)
    return {
        "code": 0,
        "data": {
            "result": result
        }
    }
```

### Error Return

```python
@tool("my:action")
async def action(self, param: str) -> Dict:
    if not param:
        return {
            "code": 1002,
            "message": "Parameter 'param' is required"
        }

    try:
        result = do_something(param)
        return {"code": 0, "data": {"result": result}}
    except TimeoutError:
        return {
            "code": 2002,
            "message": "Execution timeout"
        }
```

## Using ResultFormatter

AgentFlow provides the `ResultFormatter` helper class:

```python
from sandbox.result_formatter import build_success_response, build_error_response

@tool("my:action")
async def action(self, param: str) -> Dict:
    if not param:
        return build_error_response(
            code=1002,
            message="Parameter required"
        )

    try:
        result = do_something(param)
        return build_success_response(data={"result": result})
    except Exception as e:
        return build_error_response(
            code=5000,
            message=str(e)
        )
```

### Helper Functions

```python
def build_success_response(
    data: Any = None,
    message: str = "success"
) -> Dict[str, Any]:
    """Build a success response"""
    return {
        "code": 0,
        "message": message,
        "data": data
    }

def build_error_response(
    code: int,
    message: str,
    data: Any = None
) -> Dict[str, Any]:
    """Build an error response"""
    return {
        "code": code,
        "message": message,
        "data": data
    }
```

## Automatic Formatting

ToolExecutor automatically adds meta information:

```python
# Tool return
{"code": 0, "data": {"image": "..."}}

# Final response (meta automatically added)
{
    "code": 0,
    "message": "success",
    "data": {"image": "..."},
    "meta": {
        "execution_time_ms": 150,
        "tool": "screenshot",
        "resource_type": "vm",
        "session_id": "vm_xxx_001"
    }
}
```

## Error Code Specification

| Range | Type |
|-------|------|
| 0 | Success |
| 1xxx | Client error |
| 2xxx | Server error |
| 5xxx | System error |

For detailed error codes, please refer to the [Error Codes Documentation](../../api/server/error_codes.md).

## Best Practices

### 1. Always Return a Code

```python
# Good practice
return {"code": 0, "data": result}

# Bad practice (missing code)
return {"result": result}
```

### 2. Provide Meaningful Error Messages

```python
# Good practice
return {
    "code": 1002,
    "message": f"Invalid parameter 'size': expected positive integer, got {size}"
}

# Bad practice
return {"code": 1002, "message": "Invalid parameter"}
```

### 3. Use Appropriate Error Codes

```python
# Parameter error use 1002
if not query:
    return {"code": 1002, "message": "Query is required"}

# Timeout use 2002
except TimeoutError:
    return {"code": 2002, "message": "Request timeout"}

# Unknown error use 5000
except Exception as e:
    return {"code": 5000, "message": str(e)}
```
