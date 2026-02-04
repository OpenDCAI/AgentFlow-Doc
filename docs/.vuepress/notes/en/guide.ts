import type { ThemeNote } from 'vuepress-theme-plume'
import { defineNoteConfig } from 'vuepress-theme-plume'

export const Guide: ThemeNote = defineNoteConfig({
    dir: 'guide',
    link: '/guide/',
    sidebar: [
        {
            text: 'Basic Info',
            collapsed: false,
            icon: 'carbon:idea',
            prefix: 'basicinfo',
            items: [
                'intro',
                'architecture',
            ],
        },
        {
            text: 'Quick Start',
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
            text: 'Resources',
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
            text: 'API Tools',
            collapsed: false,
            icon: 'carbon:api',
            prefix: 'tools',
            items: [
                'websearch',
            ],
        },
        {
            text: 'Configuration',
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
