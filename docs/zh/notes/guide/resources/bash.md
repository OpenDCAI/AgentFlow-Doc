---
title: Bash 后端
createTime: 2025/02/04 10:00:00
icon: mdi:console
permalink: /zh/guide/resources/bash/
---

# Bash 后端

Bash 后端提供命令行交互功能，每个 Session 是一个独立的 shell 进程。

## 概述

- **类型**: Session 资源后端
- **需要 Session**: ✅ 是
- **工具前缀**: `bash:`

## 可用工具

| 工具 | 说明 | 参数 |
|------|------|------|
| `bash:run` | 执行命令 | `command`, `timeout` |

## 使用示例

### 基本使用

```python
async with Sandbox() as sandbox:
    # 创建 Bash Session
    await sandbox.create_session("bash", {"cwd": "/home/user"})
    
    # 执行命令
    result = await sandbox.execute("bash:run", {
        "command": "ls -la",
        "timeout": 30
    })
    
    print(result["data"]["stdout"])
    print(f"Exit code: {result['data']['exit_code']}")
    
    # 执行多条命令（在同一 Session 中）
    await sandbox.execute("bash:run", {"command": "cd /tmp"})
    await sandbox.execute("bash:run", {"command": "pwd"})  # 输出 /tmp
    
    await sandbox.destroy_session("bash")
```

### 配置选项

```python
await sandbox.create_session("bash", {
    "cwd": "/home/user",      # 工作目录
    "env": {                  # 环境变量
        "MY_VAR": "value"
    }
})
```

## 配置文件

```json
{
  "resources": {
    "bash": {
      "enabled": true,
      "backend_class": "sandbox.server.backends.resources.bash.BashBackend",
      "config": {
        "default_timeout": 30,
        "default_cwd": "/tmp"
      }
    }
  }
}
```

## 注意事项

- 每个 Session 是独立的 shell 进程
- 工作目录和环境变量在 Session 内持久
- 超时的命令会被终止
