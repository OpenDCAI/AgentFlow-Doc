import type { ThemeNoteListOptions } from 'vuepress-theme-plume'
import { defineNotesConfig } from 'vuepress-theme-plume'
import { Guide } from './guide.js'
import { DevGuide } from './dev_guide.js'
import { APIGuide } from './api.js'

export const enNotes: ThemeNoteListOptions = defineNotesConfig({
    dir: 'en/notes',
    link: '/en/',
    notes: [
        Guide,
        DevGuide,
        APIGuide,
    ],
})
