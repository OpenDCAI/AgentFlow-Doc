import type { ThemeNote } from 'vuepress-theme-plume'
import { defineNoteConfig } from 'vuepress-theme-plume'

export const APIGuide: ThemeNote = defineNoteConfig({
    dir: 'api',
    link: '/api/',
    sidebar: [
        {
            text: 'API Overview',
            collapsed: false,
            icon: 'carbon:api',
            items: [
                '1.home',
            ],
        },
        {
            text: 'Client API',
            collapsed: false,
            icon: 'carbon:application',
            prefix: 'client',
            items: [
                'sandbox',
                'http_client',
            ],
        },
        {
            text: 'Server API',
            collapsed: false,
            icon: 'carbon:server-proxy',
            prefix: 'server',
            items: [
                'http_endpoints',
                'error_codes',
            ],
        },
    ],
})
