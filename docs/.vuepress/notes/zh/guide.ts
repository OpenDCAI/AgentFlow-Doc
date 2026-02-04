import type { ThemeNote } from 'vuepress-theme-plume'
import { defineNoteConfig } from 'vuepress-theme-plume'

export const Guide: ThemeNote = defineNoteConfig({
    dir: 'guide',
    link: '/guide/',
    sidebar: [
        {
            text: '基本信息',
            collapsed: false,
            icon: 'carbon:idea',
            prefix: 'basicinfo',
            items: [
                'intro',
                'architecture',
            ],
        },
        {
            text: '快速开始',
            collapsed: false,
            icon: 'carbon:rocket',
            prefix: 'quickstart',
            items: [
                'install',
                'first_sandbox',
                'session_management',
            ],
        },
        {
            text: '资源后端',
            collapsed: false,
            icon: 'carbon:cube',
            prefix: 'resources',
            items: [
                'vm',
                'rag',
                'bash',
                'browser',
                'code_executor',
            ],
        },
        {
            text: 'API 工具',
            collapsed: false,
            icon: 'carbon:api',
            prefix: 'tools',
            items: [
                'websearch',
            ],
        },
        {
            text: '配置系统',
            collapsed: false,
            icon: 'carbon:settings',
            prefix: 'config',
            items: [
                'config_system',
                'profiles',
            ],
        },
    ],
})
