---
title: RAG 后端
createTime: 2025/02/04 10:00:00
icon: mdi:database-search
permalink: /zh/guide/resources/rag/
---

# RAG 后端

RAG 后端提供文档检索功能，支持向量检索和混合检索。

## 概述

- **类型**: 共享资源后端
- **需要 Session**: ❌ 否
- **工具前缀**: `rag:`

## 可用工具

| 工具 | 说明 | 参数 |
|------|------|------|
| `rag:search` | 检索文档 | `query`, `top_k` |
| `rag:index` | 索引文档 | `documents` |

## 使用示例

### 基本使用

```python
async with Sandbox() as sandbox:
    # RAG 不需要创建 Session（共享资源）
    
    # 检索文档
    result = await sandbox.execute("rag:search", {
        "query": "什么是机器学习？",
        "top_k": 5
    })
    
    for doc in result["data"]["results"]:
        print(f"Score: {doc['score']}, Content: {doc['content'][:100]}")
```

### 预热

```python
async with Sandbox() as sandbox:
    # 预热 RAG 后端（加载模型）
    await sandbox.warmup(["rag"])
    
    # 执行检索
    result = await sandbox.execute("rag:search", {"query": "..."})
```

## 配置文件

```json
{
  "resources": {
    "rag": {
      "enabled": true,
      "backend_class": "sandbox.server.backends.resources.rag.RAGBackend",
      "config": {
        "model_name": "intfloat/e5-base-v2",
        "device": "cuda",
        "default_top_k": 10,
        "index_path": "/data/indices"
      }
    }
  }
}
```

## 高级配置

### 使用 GPU 加速

```json
{
  "resources": {
    "rag": {
      "config": {
        "device": "cuda",
        "batch_size": 32
      }
    }
  }
}
```

### 混合检索

```json
{
  "resources": {
    "rag": {
      "config": {
        "retrieval_mode": "hybrid",
        "dense_weight": 0.7,
        "sparse_weight": 0.3
      }
    }
  }
}
```
