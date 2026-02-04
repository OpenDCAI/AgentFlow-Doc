/**
 * 查看以下文档了解主题配置
 * - @see https://theme-plume.vuejs.press/config/intro/ 配置说明
 * - @see https://theme-plume.vuejs.press/config/theme/ 主题配置项
 *
 * 注意：logo/avatar 使用带 base 的路径，以便在 GitHub Pages（/AgentFlow-Doc/）下正确加载。
 * 静态文件需放在 docs/public/ 下（如 AgentFlow-01.png、AgentFlow-02.png）。
 */

import { defineThemeConfig } from 'vuepress-theme-plume'
import { enNavbar, zhNavbar } from './navbars/index.js'
import { enNotes, zhNotes } from './notes/index.js'

const base = '/AgentFlow-Doc/'

export default defineThemeConfig({
  logo: `${base}AgentFlow-01.png`,
  logoDark: `${base}AgentFlow-02.png`,
  appearance: true,

  social: [
    { icon: 'github', link: 'https://github.com/yourorg/agentflow_sandbox' },
  ],

  locales: {
    '/en/': {
      profile: {
        avatar: `${base}AgentFlow-01.png`,
        name: 'AgentFlow Documentation',
        description: 'A unified agent execution environment.',
      },

      navbar: enNavbar,
      notes: enNotes,
    },
    '/zh/': {
      profile: {
        avatar: `${base}AgentFlow-01.png`,
        name: 'AgentFlow 中文文档',
        description: '统一的 Agent 执行环境',
      },

      navbar: zhNavbar,
      notes: zhNotes,
    },
  },
})
