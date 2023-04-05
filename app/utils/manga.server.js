import { chaptersCollection, mangasCollection, session } from '../db.server'
import { ObjectId } from 'mongodb'
import { max } from 'date-fns'

const { ONEDRIVE_ROOT_PATH } = process.env

if (!ONEDRIVE_ROOT_PATH) throw new Error('Missing OneDrive client ID in environment variables.')
const rootPath = ONEDRIVE_ROOT_PATH

async function fetchOnedrive(path, token) {
  const response = await fetch(`${rootPath}/${path}`, {
    method: 'GET',
    headers: new Headers([['Authorization', `Bearer ${token}`]])
  }).then(r => r.json())

  if (response.error !== undefined) {
    throw response.error
  }
  return response
}

export async function getAllMangaSeries() {
  return await mangasCollection
    .find(
      {},
      {
        sort: { 'meta.name': 1 },
        projection: { 'meta.name': 1, 'request.slug': 1, rating: 1 },
        session
      }
    )
    .toArray()
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

export async function getMangaSeriesByGenre() {
  const readMangalist = (
    await chaptersCollection
      .aggregate([
        { $match: { read: true, hidden: false } },
        {
          $group: {
            _id: { mangaPath: '$mangaPath' }
          }
        }
      ])
      .toArray()
  ).map(gr => gr._id.mangaPath)

  let genres = (
    await mangasCollection
      .find(
        { 'request.slug': { $nin: readMangalist } },
        { projection: { 'request.slug': 1, 'meta.name': 1, 'meta.genres': 1 } }
      )
      .toArray()
  )
    .reduce((pr, manga) => [...pr, ...manga.meta.genres.map(genre => [genre, manga])], [])
    .reduce((pr, cu) => ({ ...pr, [cu[0]]: [...(pr[cu[0]] === undefined ? [] : pr[cu[0]]), cu[1]] }), {})

  let ret = {},
    genreKeys = Object.keys(genres),
    i = 0
  shuffleArray(genreKeys)

  for (let genre of genreKeys) {
    if (genres[genre].length < 2) continue

    ret[genre] = genres[genre]
    shuffleArray(ret[genre])

    i += 1
    if (i > 7) break
  }
  return ret
}

export async function getRelatedMangasByGenre(mangaPath) {
  const genres = (
    await mangasCollection.findOne({ 'request.slug': mangaPath }, { projection: { 'meta.genres': 1, _id: 0 } })
  ).meta.genres

  let ret = {},
    i = 0
  shuffleArray(genres)

  for (let genre of genres) {
    ret[genre] = await mangasCollection
      .find(
        { 'meta.genres': genre, 'request.slug': { $ne: mangaPath } },
        { projection: { 'request.slug': 1, 'meta.name': 1, rating: 1 } }
      )
      .toArray()
    shuffleArray(ret[genre])

    i += 1
    if (i > 7) break
  }
  return ret
}

export async function getRelatedMangasByAuthor(mangaPath) {
  const author = (
    await mangasCollection.findOne({ 'request.slug': mangaPath }, { projection: { 'meta.author': 1, _id: 0 } })
  ).meta.author

  let ret = await mangasCollection
    .find(
      { 'meta.author': author, 'request.slug': { $ne: mangaPath } },
      { projection: { 'request.slug': 1, 'meta.name': 1, rating: 1 } }
    )
    .toArray()
  shuffleArray(ret)
  return ret
}

export async function getReadAgainSeries() {
  const mangaList = await chaptersCollection
    .aggregate([
      { $match: { hidden: false } },
      {
        $group: {
          _id: { mangaPath: '$mangaPath', read: '$read' },
          count: { $count: {} },
          newestRead: { $max: '$readAt' }
        }
      }
    ])
    .toArray()
  const filteredList = [...new Set(mangaList.map(group => group._id.mangaPath))]
    .map(mangaPath => ({
      mangaPath,
      readCount: mangaList.find(g => g._id.mangaPath === mangaPath && g._id.read)?.count ?? null,
      unreadCount: mangaList.find(g => g._id.mangaPath === mangaPath && !g._id.read)?.count ?? null,
      newestRead: mangaList.find(g => g._id.mangaPath === mangaPath && g._id.read)?.newestRead ?? null
    }))
    .filter(manga => manga.readCount !== null && manga.unreadCount === null)
  filteredList.sort((a, b) => a.newestRead - b.newestRead)

  const mangasList = await mangasCollection
    .find(
      { 'request.slug': { $in: filteredList.map(i => i.mangaPath) } },
      {
        sort: { 'meta.name': 1 },
        projection: { 'meta.name': 1, 'request.slug': 1, rating: 1 }
      }
    )
    .toArray()

  return filteredList.map(fli => mangasList.find(mli => mli.request.slug === fli.mangaPath))
}

export async function getMangaSeriesOnDeck() {
  const mangaList = await chaptersCollection
    .aggregate([
      { $match: { hidden: false } },
      {
        $group: {
          _id: { mangaPath: '$mangaPath', read: '$read' },
          count: { $count: {} },
          newestRead: { $max: '$readAt' },
          newestUpdate: { $max: '$lastUpdated' }
        }
      }
    ])
    .toArray()
  let filteredList = mangaList
    .map(group => {
      if (group._id.read) return null
      const readPart = mangaList.find(gr => gr._id.mangaPath === group._id.mangaPath && gr._id.read)
      if (readPart === undefined) return null

      return {
        mangaPath: group._id.mangaPath,
        date: max([new Date(group.newestUpdate), new Date(readPart.newestUpdate), new Date(readPart.newestRead)])
      }
    })
    .filter(group => group !== null)
  filteredList.sort((a, b) => b.date - a.date)

  const mangasList = await mangasCollection
    .find(
      { 'request.slug': { $in: filteredList.map(i => i.mangaPath) } },
      {
        sort: { 'meta.name': 1 },
        projection: { 'meta.name': 1, 'request.slug': 1, rating: 1, thumbnail: 1 }
      }
    )
    .toArray()

  return filteredList.map(fli => ({
    ...mangasList.find(mli => mli.request.slug === fli.mangaPath),
    newestRead: new Date(fli.date)
  }))
}

export async function getLastUpdatedSeries() {
  let date30DaysBefore = new Date()
  date30DaysBefore.setDate(date30DaysBefore.getDate() - 30)

  const mangaList = await chaptersCollection
    .aggregate([
      { $match: { hidden: false } },
      {
        $group: {
          _id: { mangaPath: '$mangaPath' },
          newestUpdate: { $max: '$lastUpdated' }
        }
      },
      { $match: { newestUpdate: { $gt: date30DaysBefore } } },
      { $sort: { newestUpdate: -1 } }
    ])
    .toArray()
  const filteredList = await mangasCollection
    .find(
      { 'request.slug': { $in: mangaList.map(i => i._id.mangaPath) } },
      {
        sort: { 'meta.name': 1 },
        projection: { 'meta.name': 1, 'request.slug': 1, rating: 1 }
      }
    )
    .toArray()

  let joinedList = filteredList.map(ma => ({
    ...ma,
    updatedAt: mangaList.find(m => m._id.mangaPath === ma.request.slug)?.newestUpdate
  }))
  joinedList.sort((a, b) => b.updatedAt - a.updatedAt)
  return joinedList
}

export async function getNewUpdates() {
  const mangaList = await chaptersCollection
    .aggregate([
      { $match: { hidden: false, seen: { $ne: true } } },
      {
        $group: {
          _id: { mangaPath: '$mangaPath' },
          newestUpdate: { $max: '$lastUpdated' }
        }
      },
      { $sort: { newestUpdate: -1 } }
    ])
    .toArray()
  const filteredList = await mangasCollection
    .find(
      { 'request.slug': { $in: mangaList.map(i => i._id.mangaPath) } },
      {
        sort: { 'meta.name': 1 },
        projection: { 'meta.name': 1, 'request.slug': 1, rating: 1 }
      }
    )
    .toArray()

  let joinedList = filteredList.map(ma => ({
    ...ma,
    updatedAt: mangaList.find(m => m._id.mangaPath === ma.request.slug)?.newestUpdate
  }))
  joinedList.sort((a, b) => b.updatedAt - a.updatedAt)
  return joinedList
}

export async function getMangaDetail(mangaPath) {
  const details = await mangasCollection.findOne({ 'request.slug': mangaPath })
  const chapters = await chaptersCollection.find({ mangaPath }, { sort: { finalIndex: 1 } }).toArray()

  return { details, chapters }
}

export async function getImages(token, seriesId, chapterId) {
  const childItems = await fetchOnedrive(`${seriesId}/${chapterId}:/children`, token)

  const images = childItems.value.map(imageItem => imageItem.name).filter(file => /^Img-([0-9]+)/.exec(file) !== null)
  images.sort(
    (fA, fB) => Number.parseInt(/^Img-([0-9]+)/.exec(fA)[1], 10) - Number.parseInt(/Img-([0-9]+)/.exec(fB)[1], 10)
  )
  return images
}

export function getImage(token, manga, chapter, image) {
  return fetch(`${rootPath}/${manga}/${chapter}/${image}:/content`, {
    method: 'GET',
    headers: new Headers([['Authorization', `Bearer ${token}`]])
  }).then(response => response.body)
}

export async function getThumbnailImage(mangaPath) {
  const manga = await mangasCollection.findOne({ 'request.slug': mangaPath }, { projection: { thumbnail: 1, _id: 0 } })
  return manga.thumbnail.buffer
}

export async function hideChapter(chapterId) {
  await chaptersCollection.updateOne({ _id: ObjectId(chapterId) }, { $set: { hidden: true, seen: true } })
}

export async function removeChapter(chapterId) {
  await chaptersCollection.removeOne({ _id: ObjectId(chapterId) })
}

export async function markChapter(chapterId, asRead, readDate = null) {
  await chaptersCollection.updateOne(
    { _id: ObjectId(chapterId) },
    { $set: { read: asRead, readAt: asRead ? readDate ?? new Date() : null, seen: true } }
  )
}

export async function markChapterAsSeen(mangaPath, chapterPath) {
  await chaptersCollection.updateOne({ mangaPath, chapterPath }, { $set: { seen: true } })
}

export async function markAllChaptersAsSeen(mangaPath) {
  await chaptersCollection.updateMany({ mangaPath }, { $set: { seen: true } })
}

export async function showAllChapters(mangaPath) {
  await chaptersCollection.updateMany({ mangaPath }, [
    { $set: { hidden: false, newIndex: 0, finalIndex: '$index', seen: true } }
  ])
}

export async function resyncManga(mangaPath) {
  await mangasCollection.updateOne({ 'request.slug': mangaPath }, { $unset: { lastSync: '', lastSyncWithUpdate: '' } })
}

export async function rateSeries(mangaId, rating = 0) {
  await mangasCollection.updateOne({ _id: ObjectId(mangaId) }, { $set: { rating } })
}

export async function markAllChapters(mangaPath, asRead, readDate = null) {
  await chaptersCollection.updateMany(
    { mangaPath },
    { $set: { read: asRead, readAt: asRead ? readDate ?? new Date() : null, seen: true } }
  )
}

export async function reorderChapters(chapterOrder) {
  for (const { id, newIndex } of chapterOrder) {
    await chaptersCollection.updateOne({ _id: ObjectId(id) }, [
      {
        $set: {
          finalIndex: newIndex,
          newIndex: { $subtract: [newIndex, '$index'] }
        }
      }
    ])
  }
}

export async function moveChapter(mangaPath, chapterId, shouldMoveUp) {
  const chapters = await chaptersCollection.find({ mangaPath, hidden: false }).toArray(),
    currentChapter = chapters.find(ch => ch._id.toString() === chapterId),
    newChapterIndex = shouldMoveUp
      ? chapters.reduce(
          (pr, cu) => (cu.finalIndex > pr && cu.finalIndex < currentChapter.finalIndex ? cu.finalIndex : pr),
          -1
        )
      : chapters.reduce(
          (pr, cu) => (cu.finalIndex < pr && cu.finalIndex > currentChapter.finalIndex ? cu.finalIndex : pr),
          Number.MAX_SAFE_INTEGER
        ),
    newChapter = chapters.find(ch => ch.finalIndex === newChapterIndex)

  if (newChapterIndex !== -1 && newChapterIndex !== Number.MAX_SAFE_INTEGER) {
    await chaptersCollection.updateOne(
      { _id: ObjectId(chapterId) },
      { $set: { newIndex: newChapterIndex - currentChapter.index, finalIndex: newChapter.finalIndex } }
    )
    await chaptersCollection.updateOne(
      { mangaPath, chapterPath: newChapter.chapterPath },
      { $set: { newIndex: currentChapter.finalIndex - newChapter.index, finalIndex: currentChapter.finalIndex } }
    )
  }
}

export async function getNextUnreadChapter(mangaPath) {
  const allChapters = await chaptersCollection.find({ mangaPath }, { skipSessions: true }).toArray(),
    chapters = allChapters.filter(ch => !ch.hidden)

  if (chapters.length === 0) return allChapters[0].chapterPath

  const lastReadChapterIndex = chapters
    .filter(ch => ch.read)
    .reduce((pr, cu) => (cu.finalIndex > pr ? cu.finalIndex : pr), -1)
  const thresholdIndex = chapters.reduce(
    (pr, cu) => (cu.finalIndex < pr && cu.finalIndex > lastReadChapterIndex ? cu.finalIndex : pr),
    Number.MAX_SAFE_INTEGER
  )

  if (thresholdIndex === Number.MAX_SAFE_INTEGER) {
    chapters.sort((a, b) => a.finalIndex - b.finalIndex)
    return chapters[0].chapterPath
  } else {
    return chapters.find(ch => ch.finalIndex === thresholdIndex).chapterPath
  }
}

export async function getNextChapter(mangaPath, chapterPath) {
  const chapters = await chaptersCollection.find({ mangaPath, hidden: false }).toArray()
  if (chapters.length === 0) return null

  const currentChapterIndex = chapters.find(ch => ch.chapterPath === chapterPath)?.finalIndex
  if (currentChapterIndex === null || currentChapterIndex === undefined) return null

  const thresholdIndex = chapters.reduce(
    (pr, cu) => (cu.finalIndex < pr && cu.finalIndex > currentChapterIndex ? cu.finalIndex : pr),
    Number.MAX_SAFE_INTEGER
  )

  if (thresholdIndex === Number.MAX_SAFE_INTEGER) {
    return null
  } else {
    return chapters.find(ch => ch.finalIndex === thresholdIndex)
  }
}

export async function getPreviousChapter(mangaPath, chapterPath) {
  const chapters = await chaptersCollection.find({ mangaPath, hidden: false }).toArray()
  if (chapters.length === 0) return null

  const currentChapterIndex = chapters.find(ch => ch.chapterPath === chapterPath)?.finalIndex
  if (currentChapterIndex === null || currentChapterIndex === undefined) return null

  const thresholdIndex = chapters.reduce(
    (pr, cu) => (cu.finalIndex > pr && cu.finalIndex < currentChapterIndex ? cu.finalIndex : pr),
    -1
  )

  if (thresholdIndex === -1) {
    return null
  } else {
    return chapters.find(ch => ch.finalIndex === thresholdIndex)
  }
}
