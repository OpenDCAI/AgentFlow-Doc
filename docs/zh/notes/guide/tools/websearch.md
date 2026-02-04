---
title: WebSearch 工具
createTime: 2025/02/04 10:00:00
icon: mdi:magnify
permalink: /zh/guide/tools/websearch/
---

# WebSearch 工具

WebSearch 是一个轻量级 API 工具，提供网络搜索功能。

## 概述

- **类型**: 轻量级 API 工具
- **需要 Session**: ❌ 否
- **配置键**: `websearch`

## 可用工具

| 工具 | 说明 | 参数 |
|------|------|------|
| `search` | 网络搜索 | `query`, `max_results` |
| `visit` | 访问网页 | `url` |

## 使用示例

### 网络搜索

```python
async with Sandbox() as sandbox:
    # 搜索
    result = await sandbox.execute("search", {
        "query": "Python tutorial",
        "max_results": 10
    })
    
    for item in result["data"]["results"]:
        print(f"Title: {item['title']}")
        print(f"URL: {item['url']}")
        print(f"Snippet: {item['snippet']}")
        print("---")
```

### 访问网页

```python
async with Sandbox() as sandbox:
    # 访问网页
    result = await sandbox.execute("visit", {
        "url": "https://example.com"
    })
    
    print(f"Status: {result['data']['status']}")
    print(f"Content: {result['data']['content'][:500]}")
```

## 配置文件

```json
{
  "apis": {
    "websearch": {
      "serper_api_key": "${SERPER_API_KEY}",
      "max_results": 10,
      "timeout": 30
    }
  }
}
```

## 环境变量

需要设置以下环境变量：

```bash
export SERPER_API_KEY="your-api-key"
```

## 返回格式

### search 返回格式

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "query": "Python tutorial",
    "results": [
      {
        "title": "Python Tutorial",
        "url": "https://example.com/python",
        "snippet": "Learn Python programming..."
      }
    ],
    "total": 10
  }
}
```

### visit 返回格式

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "url": "https://example.com",
    "status": 200,
    "content": "..."
  }
}
```
