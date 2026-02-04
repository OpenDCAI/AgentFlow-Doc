---
title: Code Executor 后端
createTime: 2025/02/04 10:00:00
icon: mdi:code-braces
permalink: /zh/guide/resources/code-executor/
---

# Code Executor 后端

Code Executor 后端提供代码沙箱执行功能，支持多种编程语言。

## 概述

- **类型**: Session 资源后端
- **需要 Session**: ✅ 是
- **工具前缀**: `code:`

## 可用工具

| 工具 | 说明 | 参数 |
|------|------|------|
| `code:execute` | 执行代码 | `code`, `language`, `timeout` |

## 使用示例

### 基本使用

```python
async with Sandbox() as sandbox:
    # 创建 Code Executor Session
    await sandbox.create_session("code")
    
    # 执行 Python 代码
    result = await sandbox.execute("code:execute", {
        "code": """
import math
print(f"Pi = {math.pi}")
result = sum(range(100))
print(f"Sum = {result}")
        """,
        "language": "python",
        "timeout": 30
    })
    
    print(result["data"]["stdout"])
    print(f"Exit code: {result['data']['exit_code']}")
    
    await sandbox.destroy_session("code")
```

### 执行 JavaScript

```python
result = await sandbox.execute("code:execute", {
    "code": """
const arr = [1, 2, 3, 4, 5];
const sum = arr.reduce((a, b) => a + b, 0);
console.log(`Sum: ${sum}`);
    """,
    "language": "javascript"
})
```

### 配置选项

```python
await sandbox.create_session("code", {
    "default_language": "python",
    "memory_limit": "256m",
    "cpu_limit": 1
})
```

## 配置文件

```json
{
  "resources": {
    "code": {
      "enabled": true,
      "backend_class": "sandbox.server.backends.resources.code_executor.CodeExecutorBackend",
      "config": {
        "default_timeout": 30,
        "supported_languages": ["python", "javascript", "bash"]
      }
    }
  }
}
```

## 支持的语言

- Python 3.x
- JavaScript (Node.js)
- Bash

## 安全注意事项

- 代码在隔离沙箱中执行
- 有资源限制（CPU、内存、时间）
- 无网络访问（可配置）
