---
title: API 工具开发
createTime: 2025/02/04 10:00:00
icon: mdi:api
permalink: /zh/dev_guide/backend/api-tool/
---

# API 工具开发

本文介绍如何开发轻量级 API 工具。

## 特点

- ✅ 使用 `@register_api_tool` 装饰器
- ❌ 不需要继承任何类
- ❌ 不需要 Session 管理
- ✅ 配置从 `config.json` 的 `apis` 部分自动注入
- ✅ 适合调用外部 API 的工具

## 适用场景

- 调用外部 API（Google Search, DeepL, OpenAI）
- 简单计算/转换工具
- 无需初始化重资源的工具

## 存放位置

```
sandbox/server/backends/tools/
├── __init__.py       # 注册入口
├── websearch.py      # WebSearch API
├── translate.py      # 翻译 API（自定义）
└── llm.py            # LLM API（自定义）
```

## 开发步骤

### 1. 创建工具文件

```python
# sandbox/server/backends/tools/translate.py
"""翻译工具"""
import httpx
from typing import Dict, Any
from . import register_api_tool


@register_api_tool("translate", config_key="translate")
async def translate(
    text: str,
    target_lang: str = "EN",
    source_lang: str = None,
    **config  # ← 配置自动注入到这里
) -> Dict[str, Any]:
    """
    翻译文本
    
    Args:
        text: 要翻译的文本
        target_lang: 目标语言 (EN, ZH, JA, ...)
        source_lang: 源语言（可选，自动检测）
        **config: 从 apis.translate 注入的配置
    """
    api_key = config.get("api_key")
    base_url = config.get("base_url", "https://api.deepl.com/v2")
    
    if not api_key:
        return {
            "code": 1002,
            "message": "Translation API key not configured"
        }
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{base_url}/translate",
            headers={"Authorization": f"DeepL-Auth-Key {api_key}"},
            data={
                "text": text,
                "target_lang": target_lang,
                "source_lang": source_lang
            }
        )
        data = resp.json()
    
    return {
        "code": 0,
        "data": {
            "original": text,
            "translated": data["translations"][0]["text"],
            "source_lang": data["translations"][0].get("detected_source_language"),
            "target_lang": target_lang
        }
    }
```

### 2. 添加配置

在配置文件中添加：

```json
{
  "apis": {
    "translate": {
      "api_key": "${DEEPL_API_KEY}",
      "base_url": "https://api.deepl.com/v2"
    }
  }
}
```

### 3. 导入工具

确保在 `__init__.py` 中导入：

```python
# sandbox/server/backends/tools/__init__.py
from .translate import translate
```

### 4. 使用工具

```python
async with Sandbox() as sandbox:
    result = await sandbox.execute("translate", {
        "text": "Hello World",
        "target_lang": "ZH"
    })
    print(result["data"]["translated"])  # 你好世界
```

## 装饰器详解

```python
@register_api_tool(name: str, config_key: str)
```

| 参数 | 说明 |
|------|------|
| `name` | 工具名称（调用时使用） |
| `config_key` | 配置键名（对应 `apis.xxx`） |

## 配置注入机制

1. 装饰器指定 `config_key`（如 `"translate"`）
2. 服务器启动时从 `config.json` 的 `apis.translate` 读取配置
3. 调用工具时，配置自动注入到 `**config` 参数

## 返回格式

### 成功

```python
return {
    "code": 0,
    "data": {
        "result": "..."
    }
}
```

### 失败

```python
return {
    "code": 1002,
    "message": "Error message"
}
```

## 最佳实践

### 1. 错误处理

```python
@register_api_tool("my_tool", config_key="my_config")
async def my_tool(param: str, **config) -> Dict:
    try:
        api_key = config.get("api_key")
        if not api_key:
            return {"code": 1002, "message": "API key not configured"}
        
        result = await call_api(param, api_key)
        return {"code": 0, "data": result}
        
    except httpx.TimeoutException:
        return {"code": 2002, "message": "Request timeout"}
    except Exception as e:
        return {"code": 5000, "message": str(e)}
```

### 2. 参数验证

```python
@register_api_tool("search", config_key="websearch")
async def search(query: str, max_results: int = 10, **config) -> Dict:
    if not query or not query.strip():
        return {"code": 1002, "message": "Query cannot be empty"}
    
    if max_results < 1 or max_results > 100:
        return {"code": 1002, "message": "max_results must be between 1 and 100"}
    
    # ... 执行搜索
```

### 3. 超时设置

```python
async with httpx.AsyncClient(timeout=30) as client:
    resp = await client.get(url)
```

## 完整示例

```python
# sandbox/server/backends/tools/weather.py
"""天气查询工具"""
import httpx
from typing import Dict, Any, Optional
from . import register_api_tool


@register_api_tool("weather", config_key="weather")
async def weather(
    city: str,
    units: str = "metric",
    **config
) -> Dict[str, Any]:
    """
    查询天气
    
    Args:
        city: 城市名称
        units: 单位（metric/imperial）
        **config: 配置
    """
    api_key = config.get("api_key")
    
    if not api_key:
        return {"code": 1002, "message": "Weather API key not configured"}
    
    if not city:
        return {"code": 1002, "message": "City is required"}
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "q": city,
                    "units": units,
                    "appid": api_key
                }
            )
            
            if resp.status_code == 404:
                return {"code": 1002, "message": f"City not found: {city}"}
            
            resp.raise_for_status()
            data = resp.json()
        
        return {
            "code": 0,
            "data": {
                "city": data["name"],
                "country": data["sys"]["country"],
                "temperature": data["main"]["temp"],
                "description": data["weather"][0]["description"],
                "humidity": data["main"]["humidity"]
            }
        }
        
    except httpx.TimeoutException:
        return {"code": 2002, "message": "Request timeout"}
    except httpx.HTTPError as e:
        return {"code": 2001, "message": f"HTTP error: {e}"}
    except Exception as e:
        return {"code": 5000, "message": str(e)}
```
