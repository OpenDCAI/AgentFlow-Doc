---
title: Browser 后端
createTime: 2025/02/04 10:00:00
icon: mdi:web
permalink: /zh/guide/resources/browser/
---

# Browser 后端

Browser 后端提供网页自动化功能，支持导航、截图、交互等操作。

## 概述

- **类型**: 混合后端（共享 + Session）
- **需要 Session**: ✅ 是
- **工具前缀**: `browser:`

## 可用工具

| 工具 | 说明 | 参数 |
|------|------|------|
| `browser:goto` | 导航到 URL | `url` |
| `browser:screenshot` | 页面截图 | 无 |
| `browser:click` | 点击元素 | `selector` |
| `browser:type` | 输入文本 | `selector`, `text` |
| `browser:evaluate` | 执行 JS | `script` |

## 使用示例

### 基本使用

```python
async with Sandbox() as sandbox:
    # 创建 Browser Session
    await sandbox.create_session("browser", {
        "headless": True
    })
    
    # 导航到网页
    await sandbox.execute("browser:goto", {
        "url": "https://example.com"
    })
    
    # 截图
    result = await sandbox.execute("browser:screenshot", {})
    image_base64 = result["data"]["image"]
    
    # 点击元素
    await sandbox.execute("browser:click", {
        "selector": "button#submit"
    })
    
    # 输入文本
    await sandbox.execute("browser:type", {
        "selector": "input#search",
        "text": "Hello World"
    })
    
    await sandbox.destroy_session("browser")
```

### 配置选项

```python
await sandbox.create_session("browser", {
    "headless": True,           # 无头模式
    "viewport": [1920, 1080],   # 视口大小
})
```

## 配置文件

```json
{
  "resources": {
    "browser": {
      "enabled": true,
      "backend_class": "sandbox.server.backends.resources.browser.BrowserBackend",
      "config": {
        "headless": true,
        "default_viewport": [1920, 1080]
      }
    }
  }
}
```

## 架构说明

Browser 后端是混合后端：

- **warmup()**: 启动浏览器进程（共享）
- **initialize()**: 创建新页面（Session）
- **cleanup()**: 关闭页面
- **shutdown()**: 关闭浏览器进程
