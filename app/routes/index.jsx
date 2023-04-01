import { useLoaderData } from '@remix-run/react'
import { authorize } from '../onedrive.server'

import {
  getAllMangaSeries,
  getMangaSeriesByGenre,
  getMangaSeriesOnDeck,
  getLastUpdatedSeries,
  getNewUpdates,
  getReadAgainSeries
} from '../utils/manga.server'
import { MangaViewTable, MangaTable } from '../components/mangaView'

function waitForObject(obj) {
  const promiseList = Object.entries(obj).map(([name, promise]) => promise.then(result => [name, result]))
  return Promise.all(promiseList).then(Object.fromEntries)
}

export async function loader({ request }) {
  return authorize(request, () => {
    return waitForObject({
      all: getAllMangaSeries(),
      byGenre: getMangaSeriesByGenre(),
      onDeck: getMangaSeriesOnDeck(),
      lastUpdated: getLastUpdatedSeries(),
      newUpdates: getNewUpdates(),
      readAgain: getReadAgainSeries()
    })
  })
}

function isWithin30Days(date) {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() - 30)

  const diff = Math.abs(new Date(date).getTime() - testDate.getTime())
  return diff / (1000 * 60 * 60 * 24)
}

export default function Index() {
  const data = useLoaderData()

  return (
    <>
      <MangaViewTable
        id='on-deck'
        mangas={data.onDeck.filter(series => isWithin30Days(series.newestRead))}
        heading='On Deck'
        useBlue={true}
        maxRows={2}
      />
      <MangaViewTable id='new-updates' mangas={data.newUpdates} heading='New Updates' maxRows={1} />
      <MangaViewTable
        id='last-updated'
        mangas={data.lastUpdated}
        heading='Last Updated Series'
        maxRows={1}
        lowerLevel={data.newUpdates.length > 0}
      />
      {Object.keys(data.byGenre).map((genre, i) => (
        <MangaViewTable
          id={`genre-${i}`}
          key={genre}
          mangas={data.byGenre[genre]}
          heading={`Discover ${genre}`}
          lowerLevel={true}
          useBlue={i % 2 === 0}
          maxRows={1}
        />
      ))}
      <MangaViewTable
        id='continue-reading'
        mangas={data.onDeck.filter(series => !isWithin30Days(series.newestRead))}
        heading='Continue Reading'
        useBlue={true}
        maxRows={1}
      />
      <MangaViewTable id='read-again' mangas={data.readAgain} heading='Read again' useBlue={true} maxRows={2} />
      <MangaTable id='all' mangas={data.all} heading='All Series' />
    </>
  )
}
