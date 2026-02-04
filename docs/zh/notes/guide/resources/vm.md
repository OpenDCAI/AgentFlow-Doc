---
title: VM 后端
createTime: 2025/02/04 10:00:00
icon: mdi:desktop-classic
permalink: /zh/guide/resources/vm/
---

# VM 后端

VM 后端提供虚拟机桌面自动化功能，支持截图、点击、输入等操作。

## 概述

- **类型**: Session 资源后端
- **需要 Session**: ✅ 是
- **工具前缀**: `vm:`

## 可用工具

| 工具 | 说明 | 参数 |
|------|------|------|
| `vm:screenshot` | 截取屏幕 | 无 |
| `vm:click` | 点击坐标 | `x`, `y` |
| `vm:type` | 输入文本 | `text` |
| `vm:hotkey` | 发送快捷键 | `keys` |

## 使用示例

### 基本使用

```python
async with Sandbox() as sandbox:
    # 创建 VM Session
    await sandbox.create_session("vm", {
        "screen_size": [1920, 1080]
    })
    
    # 截图
    result = await sandbox.execute("vm:screenshot", {})
    image_base64 = result["data"]["image"]
    
    # 点击
    await sandbox.execute("vm:click", {"x": 500, "y": 300})
    
    # 输入文本
    await sandbox.execute("vm:type", {"text": "Hello World"})
    
    # 发送快捷键
    await sandbox.execute("vm:hotkey", {"keys": ["ctrl", "s"]})
    
    await sandbox.destroy_session("vm")
```

### 配置选项

```python
await sandbox.create_session("vm", {
    "screen_size": [1920, 1080],  # 屏幕分辨率
    "custom_name": "my_vm",       # 自定义名称
})
```

## 配置文件

```json
{
  "resources": {
    "vm": {
      "enabled": true,
      "backend_class": "sandbox.server.backends.resources.vm.VMBackend",
      "config": {
        "default_screen_size": [1920, 1080]
      }
    }
  }
}
```
