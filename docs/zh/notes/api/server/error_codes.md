---
title: 错误码
createTime: 2025/02/04 10:00:00
icon: mdi:alert-circle
permalink: /zh/api/server/error-codes/
---

# 错误码

本文档介绍 AgentFlow 的错误码定义。

## 错误码分类

### 成功 (0)

| 错误码 | 说明 |
|-------|------|
| 0 | 成功 |

### 客户端错误 (1xxx)

| 错误码 | 说明 |
|-------|------|
| 1001 | 工具未找到 |
| 1002 | 参数错误 |
| 1003 | Session 错误 |
| 1004 | Worker 未找到 |
| 1005 | 资源类型未找到 |
| 1006 | 权限不足 |

### 服务端错误 (2xxx)

| 错误码 | 说明 |
|-------|------|
| 2001 | 后端错误 |
| 2002 | 执行超时 |
| 2003 | 后端未预热 |
| 2004 | 资源不可用 |

### 系统错误 (5xxx)

| 错误码 | 说明 |
|-------|------|
| 5000 | 内部错误 |
| 5001 | 配置错误 |
| 5002 | 服务不可用 |

## 错误响应格式

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

## 错误处理示例

### Python 客户端

```python
from sandbox import Sandbox, SandboxError

async def main():
    async with Sandbox() as sandbox:
        result = await sandbox.execute("vm:screenshot", {})
        
        if result.get("code") != 0:
            code = result.get("code")
            message = result.get("message")
            
            if code == 1001:
                print(f"工具未找到: {message}")
            elif code == 1003:
                print(f"Session 错误: {message}")
            elif code == 2002:
                print(f"执行超时: {message}")
            else:
                print(f"错误 {code}: {message}")
        else:
            print(f"成功: {result['data']}")
```

### 错误重试策略

```python
async def execute_with_retry(sandbox, action, params, max_retries=3):
    for i in range(max_retries):
        result = await sandbox.execute(action, params)
        
        code = result.get("code", 0)
        
        # 成功
        if code == 0:
            return result
        
        # 不可重试的错误
        if code in [1001, 1002, 1006]:
            raise Exception(f"Fatal error: {result['message']}")
        
        # 可重试的错误
        if code in [2002, 5002]:
            if i < max_retries - 1:
                await asyncio.sleep(2 ** i)  # 指数退避
                continue
        
        break
    
    raise Exception(f"Failed after {max_retries} retries")
```

## 自定义错误码

开发后端时可以返回自定义错误码：

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
