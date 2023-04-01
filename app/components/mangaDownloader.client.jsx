import { db } from '~/db.client'

export async function MangaDownloaderView({ chapters }) {
  const oldFriends = await db.chapters.toArray()

  const unreads = chapters.filter(ch => !ch.hidden && !ch.read)
  return (
    <div>
      0 / {unreads.length} chapters downloaded ({oldFriends.length})
    </div>
  )
}
