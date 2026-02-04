---
title: Configuration Profiles
createTime: 2025/02/04 10:00:00
icon: mdi:file-cog
permalink: /en/guide/config/profiles/
---

# Configuration Profiles

AgentFlow supports multiple environment configuration profiles.

## Pre-built Profiles

### dev.json (Development)

```json
{
  "server": {
    "host": "127.0.0.1",
    "port": 18890
  },
  "resources": {
    "bash": {"enabled": true},
    "code": {"enabled": true}
  }
}
```

### production.json (Production)

```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 18890
  },
  "resources": {
    "vm": {"enabled": true},
    "rag": {"enabled": true},
    "bash": {"enabled": true}
  }
}
```

## Using Profiles

```python
sandbox = Sandbox(
    auto_start_server=True,
    server_config_path="configs/profiles/dev.json"
)
```
