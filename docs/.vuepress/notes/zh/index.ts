import type { ThemeNoteListOptions } from 'vuepress-theme-plume'
import { defineNotesConfig } from 'vuepress-theme-plume'
import { Guide } from './guide.js'
import { DevGuide } from './dev_guide.js'
import { APIGuide } from './api.js'

export const zhNotes: ThemeNoteListOptions = defineNotesConfig({
    dir: 'zh/notes',
    link: '/zh/',
    notes: [
        Guide,
        DevGuide,
        APIGuide,
    ],
})
