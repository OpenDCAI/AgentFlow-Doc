/**
 * @see https://theme-plume.vuejs.press/config/navigation/
 */

import { defineNavbarConfig } from 'vuepress-theme-plume'

export const zhNavbar = defineNavbarConfig([
    {
        text: '指南',
        icon: 'icon-park-outline:guide-board',
        link: '/zh/notes/guide/basicinfo/intro.md',
    },
    {
        text: 'API 文档',
        link: '/zh/notes/api/1.home.md',
        icon: 'material-symbols:article-outline',
    },
    {
        text: '开发者指南',
        icon: 'material-symbols:build-outline-sharp',
        link: '/zh/notes/dev_guide/1.index_guide.md',
    },
])
