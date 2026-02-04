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

## GitHub Pages 部署与首页动效说明

文档站部署到 GitHub Pages 后，首页的**彩色动态背景**（tint-plate）是由主题在浏览器里用 Canvas 绘制的，只有访问**首页**时才会显示（例如 `https://<你的用户名>.github.io/AgentFlow-Doc/zh/` 或 `/en/`），进入具体文档页不会有该背景。

若部署后首页也看不到动效，可按下面排查：

### ⚠️ 最常见问题：缺少 logo 图片文件

**现象：** 首页没有彩色背景动效，或者控制台有错误

**原因：** 项目配置文件引用了 logo 图片，但 `docs/public/` 目录下缺少这些文件

**解决方法：**

1. 准备两个 logo 图片文件：
   - `AgentFlow-01.png`（浅色模式，建议 200x200px 以上）
   - `AgentFlow-02.png`（深色模式，建议 200x200px 以上）

2. 将图片放入 `docs/public/` 目录

3. 重新构建并部署：
   ```bash
   npm run docs:build
   git add docs/public/
   git commit -m "Add logo images"
   git push
   ```

**临时解决方案（如果暂时没有 logo 图片）：**

可以暂时注释掉配置文件中的 logo 引用：
- 编辑 `docs/.vuepress/plume.config.ts`，注释掉第 12-13 行的 `logo` 和 `logoDark`
- 编辑 `docs/.vuepress/config.ts`，注释掉第 28-30 行的 `head` 配置

### 其他排查步骤

1. **确认访问的是首页**  
   打开 `https://<你的用户名>.github.io/AgentFlow-Doc/`，会自动跳到 `/zh/` 或 `/en/`，该页即为带动态背景的首页。

2. **确认 GitHub Pages 来源**  
   仓库 **Settings → Pages → Build and deployment**：Source 选 **Deploy from a branch**，Branch 选 **gh-pages**，目录选 **/ (root)**。

3. **检查浏览器控制台是否有报错或 404**  
   用浏览器打开首页 → F12 打开开发者工具 → 看 **Console** 是否有报错，**Network** 里是否有红色的 404（尤其是 `.js` 和 `.png` 文件）。

4. **清缓存再试**  
   使用无痕/隐私模式打开首页，或强制刷新（Ctrl+Shift+R / Cmd+Shift+R）。

**若控制台出现 `TypeError: Cannot read properties of undefined (reading 'value')`：**

- 多为主题在 hydration 时访问了尚未就绪的数据。请先确保 **logo 图片** 已放入 `docs/public/`（`AgentFlow-01.png`、`AgentFlow-02.png`），否则 404 可能影响后续脚本执行。
- 将主题升级到最新后再构建：`npm update vuepress-theme-plume`，然后 `npm run docs:build` 并重新部署。
- 若仍报错，可到 [vuepress-theme-plume](https://github.com/vuepress/theme-plume) 提 issue，并附上完整报错栈与复现步骤。

当前仓库已配置 `base: '/AgentFlow-Doc/'`，构建出的资源路径均带此前缀，在项目页 `.../AgentFlow-Doc/` 下部署是正确的。

## Documents

- [vuepress](https://vuepress.vuejs.org/)
- [vuepress-theme-plume](https://theme-plume.vuejs.press/)