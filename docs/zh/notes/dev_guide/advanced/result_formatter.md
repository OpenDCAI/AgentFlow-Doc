---
title: 结果格式化
createTime: 2025/02/04 10:00:00
icon: mdi:format-list-bulleted
permalink: /zh/dev_guide/advanced/result-formatter/
---

# 结果格式化

本文介绍 AgentFlow 的工具结果格式化机制。

## 标准响应格式

所有工具返回统一的响应格式：

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

## 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | int | 错误码，0 表示成功 |
| `message` | string | 描述信息 |
| `data` | object | 返回数据 |
| `meta` | object | 元数据 |

### meta 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `execution_time_ms` | float | 执行时间（毫秒） |
| `tool` | string | 工具名称 |
| `resource_type` | string | 资源类型（如果适用） |
| `session_id` | string | Session ID（如果适用） |
| `temporary_session` | bool | 是否为临时 Session |

## 工具返回格式

### 成功返回

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

### 错误返回

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

## 使用 ResultFormatter

AgentFlow 提供 `ResultFormatter` 辅助类：

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

### 辅助函数

```python
def build_success_response(
    data: Any = None,
    message: str = "success"
) -> Dict[str, Any]:
    """构建成功响应"""
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
    """构建错误响应"""
    return {
        "code": code,
        "message": message,
        "data": data
    }
```

## 自动格式化

ToolExecutor 会自动添加 meta 信息：

```python
# 工具返回
{"code": 0, "data": {"image": "..."}}

# 最终响应（自动添加 meta）
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

## 错误码规范

| 范围 | 类型 |
|------|------|
| 0 | 成功 |
| 1xxx | 客户端错误 |
| 2xxx | 服务端错误 |
| 5xxx | 系统错误 |

详细错误码请参考 [错误码文档](../../api/server/error_codes.md)。

## 最佳实践

### 1. 始终返回 code

```python
# 好的做法
return {"code": 0, "data": result}

# 不好的做法（缺少 code）
return {"result": result}
```

### 2. 提供有意义的错误信息

```python
# 好的做法
return {
    "code": 1002,
    "message": f"Invalid parameter 'size': expected positive integer, got {size}"
}

# 不好的做法
return {"code": 1002, "message": "Invalid parameter"}
```

### 3. 使用适当的错误码

```python
# 参数错误用 1002
if not query:
    return {"code": 1002, "message": "Query is required"}

# 超时用 2002
except TimeoutError:
    return {"code": 2002, "message": "Request timeout"}

# 未知错误用 5000
except Exception as e:
    return {"code": 5000, "message": str(e)}
```
