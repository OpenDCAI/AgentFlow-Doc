import type { ThemeNote } from 'vuepress-theme-plume'
import { defineNoteConfig } from 'vuepress-theme-plume'

export const APIGuide: ThemeNote = defineNoteConfig({
    dir: 'api',
    link: '/api/',
    sidebar: [
        {
            text: 'API 概览',
            collapsed: false,
            icon: 'carbon:api',
            items: [
                '1.home',
            ],
        },
        {
            text: '客户端 API',
            collapsed: false,
            icon: 'carbon:application',
            prefix: 'client',
            items: [
                'sandbox',
                'http_client',
            ],
        },
        {
            text: '服务端 API',
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
