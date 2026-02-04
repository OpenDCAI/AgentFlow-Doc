/**
 * 查看以下文档了解主题配置
 * - @see https://theme-plume.vuejs.press/config/intro/ 配置说明
 * - @see https://theme-plume.vuejs.press/config/theme/ 主题配置项
 */

import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { plumeTheme } from 'vuepress-theme-plume'
import { redirectPlugin } from '@vuepress/plugin-redirect'

export default defineUserConfig({
  base: '/AgentFlow-Doc/',
  lang: 'en-US',
  locales: {
    '/en/': {
      title: 'AgentFlow Documentation',
      lang: 'en-US',
      description: 'Documentation for AgentFlow Sandbox - A unified agent execution environment.',
    },
    '/zh/': {
      title: 'AgentFlow 中文文档',
      lang: 'zh-CN',
      description: 'AgentFlow Sandbox 文档 - 统一的 Agent 执行环境。',
    },
  },

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/AgentFlow-Doc/AgentFlow-01.png' }],
  ],

  bundler: viteBundler(),
  shouldPrefetch: false,

  theme: plumeTheme({
    article: '/article/',
    cache: 'filesystem',
    search: { provider: 'local' },
    codeHighlighter: {
      lineNumbers: true,
    },
  }),
  
  plugins: [
    redirectPlugin({
      autoLocale: true,
    }),
  ]
})
