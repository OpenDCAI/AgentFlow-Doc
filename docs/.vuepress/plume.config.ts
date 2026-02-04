/**
 * 查看以下文档了解主题配置
 * - @see https://theme-plume.vuejs.press/config/intro/ 配置说明
 * - @see https://theme-plume.vuejs.press/config/theme/ 主题配置项
 */

import { defineThemeConfig } from 'vuepress-theme-plume'
import { enNavbar, zhNavbar } from './navbars/index.js'
import { enNotes, zhNotes } from './notes/index.js'

export default defineThemeConfig({
  // logo: '/AgentFlow-01.png',
  // logoDark: '/AgentFlow-02.png',
  appearance: true,

  social: [
    { icon: 'github', link: 'https://github.com/yourorg/agentflow_sandbox' },
  ],

  locales: {
    '/en/': {
      profile: {
        avatar: '/AgentFlow-01.png',
        name: 'AgentFlow Documentation',
        description: 'A unified agent execution environment.',
      },

      navbar: enNavbar,
      notes: enNotes,
    },
    '/zh/': {
      profile: {
        avatar: '/AgentFlow-01.png',
        name: 'AgentFlow 中文文档',
        description: '统一的 Agent 执行环境',
      },

      navbar: zhNavbar,
      notes: zhNotes,
    },
  },
})
