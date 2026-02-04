# AgentFlow-Doc

这是 [AgentFlow Sandbox](https://github.com/yourorg/agentflow_sandbox) 的官方文档。

## AgentFlow Sandbox

AgentFlow Sandbox 是一个专为 **Agent 数据合成** 设计的统一执行环境。

### 核心能力

- 🤖 **Agent 数据合成**：专为 Agent 轨迹数据合成优化，支持大规模并行执行，自动记录完整的工具调用与环境交互轨迹
- 🖥️ **多资源后端**：支持 VM 桌面自动化、RAG 检索、Bash 命令行、Browser 网页自动化、代码执行等
- 📦 **Session 管理**：灵活的 Session 生命周期管理，支持 Worker 隔离，适配多进程数据合成场景
- 🌐 **标准化接口**：统一的 HTTP API 接口，标准化的响应格式，便于数据收集与后处理

## Install

```sh
npm i
```

## Usage

```sh
# start dev server 一般用这个，可以动态热渲染所有 markdown 的修改
npm run docs:dev

# build for production 这个主要是上传 github 之前测试下有无 bug
npm run docs:build
```

## 基本开发结构介绍

基本都是一式两份，英语一份，汉语一份。

- 上方的导航栏配置主要在这个文件夹下：[navbars](./docs/.vuepress/navbars/)
- 各个文章的侧边栏主要是在这个文件夹下配置：[sidebar](./docs/.vuepress/notes/)

如果开启了 `npm run docs:dev`，在新建 markdown 的时候，会在 markdown 头部有一些配置前缀，这里简要介绍下：

```yaml
---
title: 框架设计 # 这个标题会用来作为 sidebar 的标题
createTime: 2025/06/13 14:59:56 # 不太重要
icon: material-symbols:deployed-code-outline # 可选，侧边栏展示时的小 logo
permalink: /zh/guide/framework/ # 这个自动生成的是8位码，可以自行修改以简明展示
---
```

## Documents

- [vuepress](https://vuepress.vuejs.org/)
- [vuepress-theme-plume](https://theme-plume.vuejs.press/)

