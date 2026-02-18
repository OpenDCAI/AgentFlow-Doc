---
title: API Tool Development
createTime: 2025/02/04 10:00:00
icon: mdi:api
permalink: /en/dev_guide/backend/api-tool/
---

# API Tool Development

This article introduces how to develop lightweight API tools.

## Features

- ✅ Uses `@register_api_tool` decorator
- ❌ No need to inherit any class
- ❌ No Session management needed
- ✅ Config auto-injected from the `apis` section of `config.json`
- ✅ Suitable for tools that call external APIs

## Use Cases

- Calling external APIs (Google Search, DeepL, OpenAI)
- Simple computation/conversion tools
- Tools that don't need heavy resource initialization

## File Location

```
sandbox/server/backends/tools/
├── __init__.py       # Registration entry
├── websearch.py      # WebSearch API
├── translate.py      # Translation API (custom)
└── llm.py            # LLM API (custom)
```

## Development Steps

### 1. Create Tool File

```python
# sandbox/server/backends/tools/translate.py
"""Translation tool"""
import httpx
from typing import Dict, Any
from . import register_api_tool


@register_api_tool("translate", config_key="translate")
async def translate(
    text: str,
    target_lang: str = "EN",
    source_lang: str = None,
    **config  # <- Config auto-injected here
) -> Dict[str, Any]:
    """
    Translate text

    Args:
        text: Text to translate
        target_lang: Target language (EN, ZH, JA, ...)
        source_lang: Source language (optional, auto-detected)
        **config: Config injected from apis.translate
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

### 2. Add Configuration

Add to the configuration file:

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

### 3. Import the Tool

Make sure to import it in `__init__.py`:

```python
# sandbox/server/backends/tools/__init__.py
from .translate import translate
```

### 4. Use the Tool

```python
async with Sandbox() as sandbox:
    result = await sandbox.execute("translate", {
        "text": "Hello World",
        "target_lang": "ZH"
    })
    print(result["data"]["translated"])  # 你好世界
```

## Decorator Details

```python
@register_api_tool(name: str, config_key: str)
```

| Parameter | Description |
|-----------|-------------|
| `name` | Tool name (used when calling) |
| `config_key` | Config key name (corresponds to `apis.xxx`) |

## Config Injection Mechanism

1. The decorator specifies `config_key` (e.g., `"translate"`)
2. On server startup, the config is read from `apis.translate` in `config.json`
3. When calling the tool, the config is auto-injected into the `**config` parameter

## Return Format

### Success

```python
return {
    "code": 0,
    "data": {
        "result": "..."
    }
}
```

### Failure

```python
return {
    "code": 1002,
    "message": "Error message"
}
```

## Best Practices

### 1. Error Handling

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

### 2. Parameter Validation

```python
@register_api_tool("search", config_key="websearch")
async def search(query: str, max_results: int = 10, **config) -> Dict:
    if not query or not query.strip():
        return {"code": 1002, "message": "Query cannot be empty"}

    if max_results < 1 or max_results > 100:
        return {"code": 1002, "message": "max_results must be between 1 and 100"}

    # ... perform search
```

### 3. Timeout Settings

```python
async with httpx.AsyncClient(timeout=30) as client:
    resp = await client.get(url)
```

## Complete Example

```python
# sandbox/server/backends/tools/weather.py
"""Weather query tool"""
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
    Query weather

    Args:
        city: City name
        units: Units (metric/imperial)
        **config: Config
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
