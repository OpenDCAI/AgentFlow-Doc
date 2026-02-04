---
title: Configuration System
createTime: 2025/02/04 10:00:00
icon: mdi:cog
permalink: /en/guide/config/config-system/
---

# Configuration System

This document introduces the configuration system of AgentFlow Sandbox.

## Configuration File Structure

```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 18890,
    "session_ttl": 300
  },
  "resources": {
    "vm": {
      "enabled": true,
      "backend_class": "sandbox.server.backends.resources.vm.VMBackend"
    }
  },
  "apis": {
    "websearch": {
      "api_key": "${SERPER_API_KEY}"
    }
  }
}
```

## Environment Variable Support

Configuration files support environment variable expansion:

- `${VAR}` - Required environment variable
- `${VAR:-default}` - Environment variable with default value
