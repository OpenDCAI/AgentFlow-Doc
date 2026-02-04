import type { ThemeNote } from 'vuepress-theme-plume'
import { defineNoteConfig } from 'vuepress-theme-plume'

export const DevGuide: ThemeNote = defineNoteConfig({
    dir: 'dev_guide',
    link: '/dev_guide/',
    sidebar: [
        {
            text: 'Development Guide',
            collapsed: false,
            icon: 'carbon:development',
            items: [
                '1.index_guide',
            ],
        },
        {
            text: 'Backend Development',
            collapsed: false,
            icon: 'carbon:cube',
            prefix: 'backend',
            items: [
                'backend_overview',
                'api_tool_development',
                'resource_backend_development',
                'registration_guide',
            ],
        },
        {
            text: 'Advanced Topics',
            collapsed: false,
            icon: 'carbon:analytics',
            prefix: 'advanced',
            items: [
                'session_lifecycle',
                'result_formatter',
            ],
        },
    ],
})
