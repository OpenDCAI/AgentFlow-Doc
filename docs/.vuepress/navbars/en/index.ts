/**
 * @see https://theme-plume.vuejs.press/config/navigation/
 */

import { defineNavbarConfig } from 'vuepress-theme-plume'

export const enNavbar = defineNavbarConfig([
    {
        text: 'Guide',
        icon: 'icon-park-outline:guide-board',
        link: '/en/notes/guide/basicinfo/intro.md',
    },
    {
        text: 'API Reference',
        link: '/en/notes/api/1.home.md',
        icon: 'material-symbols:article-outline'
    },
    {
        text: 'Developer Guide',
        icon: 'material-symbols:build-outline-sharp',
        link: '/en/notes/dev_guide/1.index_guide.md',
    },
])
