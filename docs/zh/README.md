---
pageLayout: home
externalLinkIcon: false
config:
  -
    type: hero
    full: true
    background: bg-gradient
    hero:
      name: AgentFlow
      tagline: Agent 数据合成的统一执行环境
      text: 为大规模 Agent 数据合成提供标准化的工具调用与环境交互能力
      actions:
        -
          theme: brand
          text: 简介
          link: /zh/notes/guide/basicinfo/intro.md
        -
          theme: brand
          text: 快速开始
          link: /zh/notes/guide/quickstart/install.md
        -
          theme: alt
          text: Github →
          link: https://github.com/yourorg/agentflow_sandbox
  -
    type: features
    features:
      -
        title: Agent 数据合成
        icon: 🤖
        details: 专为 Agent 轨迹数据合成设计，支持大规模并行执行，自动记录完整的工具调用与环境交互轨迹
      -
        title: 多资源后端
        icon: 🖥️
        details: 支持 VM 桌面自动化、RAG 检索、Bash 命令行、Browser 网页自动化、代码执行等多种后端资源
      -
        title: Session 管理
        icon: 📦
        details: 灵活的 Session 生命周期管理，支持 Worker 隔离，适配多进程数据合成场景
      -
        title: 标准化接口
        icon: 🌐
        details: 统一的 HTTP API 接口，标准化的响应格式，便于数据收集与后处理
      -
        title: 可扩展架构
        icon: 🔌
        details: 轻松开发新的后端和工具，支持热插拔，快速适配不同的数据合成需求
      -
        title: 高可靠性
        icon: 🛡️
        details: 完善的错误处理、自动重试、资源清理机制，确保大规模合成任务稳定运行
---
