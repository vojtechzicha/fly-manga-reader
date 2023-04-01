// db.js
import Dexie from 'dexie'

export const db = new Dexie('fly-manga-reader/devPrototype')
db.version(1).stores({
  chapters: '++id, &[mangaPath+chapterPath], finished',
  images: '++id, &[mangaPath+chapterPath+imageKey]'
})
