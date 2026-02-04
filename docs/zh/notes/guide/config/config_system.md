---
title: 配置系统
createTime: 2025/02/04 10:00:00
icon: mdi:cog
permalink: /zh/guide/config/config-system/
---

# 配置系统

本文介绍 AgentFlow Sandbox 的配置系统。

## 配置文件结构

```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 18890,
    "title": "Sandbox HTTP Service",
    "session_ttl": 300
  },

  "resources": {
    "vm": {
      "enabled": true,
      "backend_class": "sandbox.server.backends.resources.vm.VMBackend",
      "config": {...}
    },
    "rag": {...},
    "bash": {...}
  },

  "apis": {
    "websearch": {
      "api_key": "${SERPER_API_KEY}",
      "max_results": 10
    }
  }
}
```

## 配置项说明

### server 配置

| 配置项 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| `host` | string | "0.0.0.0" | 服务器监听地址 |
| `port` | int | 18890 | 服务器端口 |
| `title` | string | "Sandbox HTTP Service" | 服务标题 |
| `session_ttl` | int | 300 | Session 超时时间（秒） |

### resources 配置

每个资源后端的配置：

| 配置项 | 类型 | 说明 |
|-------|------|------|
| `enabled` | bool | 是否启用 |
| `backend_class` | string | 后端类路径 |
| `config` | object | 后端特定配置 |
| `description` | string | 描述信息 |

### apis 配置

轻量级 API 工具的配置，配置会自动注入到工具函数。

## 环境变量支持

配置文件支持环境变量展开：

```json
{
  "apis": {
    "websearch": {
      "api_key": "${SERPER_API_KEY}",
      "base_url": "${API_BASE_URL:-https://api.serper.dev}"
    }
  }
}
```

- `${VAR}` - 必需的环境变量
- `${VAR:-default}` - 带默认值的环境变量

## 配置加载

### 使用配置文件启动

```python
from sandbox import Sandbox

sandbox = Sandbox(
    server_url="http://127.0.0.1:18890",
    auto_start_server=True,
    server_config_path="configs/profiles/dev.json"
)
```

### 从配置创建服务器

```python
from sandbox.server.config_loader import create_server_from_config

server = create_server_from_config("configs/profiles/dev.json")
server.run()
```

## 配置验证

验证配置文件是否正确：

```bash
python -m sandbox validate --config configs/profiles/production.json --strict
```

验证内容：

| 检查项 | 说明 |
|-------|------|
| `backend_class` 路径 | 验证类路径可导入 |
| @tool 装饰器 | 验证工具方法存在 |
| 环境变量 | 验证必需的环境变量已设置 |
| 配置完整性 | 验证必需配置项存在 |
