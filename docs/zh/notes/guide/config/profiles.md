---
title: 配置 Profiles
createTime: 2025/02/04 10:00:00
icon: mdi:file-cog
permalink: /zh/guide/config/profiles/
---

# 配置 Profiles

AgentFlow 支持多环境配置 profiles。

## 预置 Profiles

### dev.json（开发环境）

```json
{
  "server": {
    "host": "127.0.0.1",
    "port": 18890,
    "session_ttl": 600
  },
  "resources": {
    "bash": {"enabled": true},
    "code": {"enabled": true}
  },
  "apis": {
    "websearch": {}
  }
}
```

### production.json（生产环境）

```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 18890,
    "session_ttl": 300
  },
  "resources": {
    "vm": {"enabled": true},
    "rag": {"enabled": true},
    "bash": {"enabled": true},
    "browser": {"enabled": true},
    "code": {"enabled": true}
  },
  "apis": {
    "websearch": {
      "api_key": "${SERPER_API_KEY}"
    }
  }
}
```

### minimal.json（最小配置）

```json
{
  "server": {
    "host": "127.0.0.1",
    "port": 18890
  },
  "resources": {
    "bash": {"enabled": true}
  }
}
```

## 使用 Profile

```python
# 开发环境
sandbox = Sandbox(
    auto_start_server=True,
    server_config_path="configs/profiles/dev.json"
)

# 生产环境
sandbox = Sandbox(
    auto_start_server=True,
    server_config_path="configs/profiles/production.json"
)
```

## 配置目录结构

```
configs/
├── profiles/           # 环境配置
│   ├── dev.json
│   ├── production.json
│   └── minimal.json
├── resources/          # 资源后端配置
│   ├── vm/
│   │   └── default.json
│   ├── rag/
│   │   ├── default.json
│   │   └── hybrid.json
│   └── ...
└── server/             # 服务器配置
    ├── default.json
    └── production.json
```

## 自定义 Profile

创建自定义配置文件：

```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 8080,
    "session_ttl": 600
  },
  "resources": {
    "rag": {
      "enabled": true,
      "backend_class": "sandbox.server.backends.resources.rag.RAGBackend",
      "config": {
        "model_name": "intfloat/e5-large-v2",
        "device": "cuda:0"
      }
    }
  }
}
```
