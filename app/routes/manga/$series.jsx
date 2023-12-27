import { redirect } from '@remix-run/node'
import { Link, useLoaderData, Form, useSubmit, Outlet } from '@remix-run/react'

import { getMangaDetail, rateSeries, getRelatedMangasByGenre, getRelatedMangasByAuthor } from '../../utils/manga.server'
import { MangaViewTable } from '../../components/mangaView'

export async function action({ request, params: { series } }) {
  const formData = await request.formData(),
    action = formData.get('action')

  if (action === 'rate') {
    await rateSeries(formData.get('mangaId'), Number.parseInt(formData.get('rating-10'), 10))
  }

  return redirect(`/manga/${series}`)
}

export async function loader({ request, params: { series } }) {
  return {
    ...(await getMangaDetail(series)),
    byGenres: await getRelatedMangasByGenre(series),
    byAuthor: await getRelatedMangasByAuthor(series)
  }
}

export default function MangaSeriesLayout() {
  const { details, chapters, byGenres, byAuthor } = useLoaderData()

  return (
    <>
      <Header details={details} chapters={chapters} />
      <section id='Subscribes' className='text-center py-20 dark:bg-slate-600'>
        <Outlet context={chapters} />
      </section>
      <div>
        <MangaViewTable
          id={`author`}
          mangas={byAuthor}
          heading={`Read More by ${details.meta.author}`}
          useBlue={true}
          maxRows={2}
        />
        {Object.keys(byGenres).map((genre, i) => (
          <MangaViewTable
            id={`genre-${i}`}
            key={genre}
            mangas={byGenres[genre]}
            heading={`Read More in ${genre}`}
            lowerLevel={true}
            useBlue={i % 2 === (byAuthor.length > 0 ? 1 : 0)}
            maxRows={1}
          />
        ))}
      </div>
    </>
  )
}

function Header({ details, chapters }) {
  const rating = details.rating ?? 0
  const allUnread = chapters.filter(ch => !ch.hidden && !ch.read).length === 0
  const submit = useSubmit()

  return (
    <div id='feature' className='bg-blue-100 dark:bg-slate-800 pt-24 pb-5'>
      <div className='container'>
        <h2 className='mb-12 section-heading wow fadeInDown' data-wow-delay='0.3s'>
          {details.meta.name}
        </h2>
        <div className='flex flex-wrap items-center'>
          <div className='w-full lg:w-1/4'>
            <div className='mx-3 lg:mr-0 lg:ml-3 wow fadeInRight' data-wow-delay='0.3s'>
              <Link to={`read`}>
                <img src={`/manga/${details.request.slug}/thumbnail`} alt='Manga Thumbnail' />
              </Link>
            </div>
          </div>
          <div className='w-3/4 lg:w-2/4'>
            <div className='mb-5 lg:mb-0'>
              <div className='flex flex-wrap'>
                <div>
                  {allUnread ? (
                    <Form
                      method='POST'
                      className='mb-6'
                      onChange={e => {
                        submit(e.currentTarget, { replace: true })
                      }}>
                      <div className='rating rating-lg rating-half'>
                        <input type='hidden' name='action' value='rate' />
                        <input type='hidden' name='mangaId' value={details._id.toString()} />
                        <input
                          type='radio'
                          name='rating-10'
                          value={0}
                          className='rating-hidden'
                          defaultChecked={rating === 0}
                        />
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                          <input
                            key={i}
                            type='radio'
                            name='rating-10'
                            value={i}
                            defaultChecked={rating === i}
                            className={`bg-green-500 mask mask-star-2 mask-half-${i % 2 === 1 ? 1 : 2}`}
                          />
                        ))}
                      </div>
                    </Form>
                  ) : null}
                  <div className='flex flex-wrap items-center'>
                    <p className='pl-3 dark:text-gray-100'>
                      <strong>Status: </strong>
                      {details.meta.status}
                    </p>
                  </div>
                  <div className='flex flex-wrap items-center'>
                    <p className='pl-3 dark:text-gray-100'>
                      <strong>Author: </strong>
                      {details.meta.author}
                    </p>
                  </div>
                  <div className='flex flex-wrap items-center'>
                    <p className='pl-3 dark:text-gray-100'>
                      <strong>Genres: </strong>
                      {details.meta.genres.join(', ')}
                    </p>
                  </div>
                  <div className='flex flex-wrap items-center'>
                    <p className='pl-3 dark:text-gray-100'>
                      <strong>Alternative title: </strong>
                      {details.meta.alternativeTitle}
                    </p>
                  </div>
                  <div className='flex flex-wrap items-center'>
                    <p className='pl-3 dark:text-gray-100'>
                      <strong>Source: </strong>
                      <a href={details.request.url} target='_blank' rel='noreferrer'>
                        see on {new URL(details.request.url).hostname.replace('www.', '')} ⧉
                      </a>
                    </p>
                  </div>
                  {details.meta?.additionalData?.application ? (
                    <div className='flex flex-wrap items-center'>
                      <p className='pl-3 dark:text-gray-100'>
                        <strong>Source: </strong>
                        read on {details.meta.additionalData.application} mobile app
                      </p>
                    </div>
                  ) : null}
                  {details.meta?.additionalData?.source !== undefined ? (
                    <div className='flex flex-wrap items-center'>
                      <p className='pl-3 dark:text-gray-100'>
                        <strong>Source: </strong>
                        <a href={details.meta.additionalData.source.url} target='_blank' rel='noreferrer'>
                          read on {details.meta.additionalData.source.name} ⧉
                        </a>
                      </p>
                    </div>
                  ) : null}
                  <div className='flex flex-wrap mt-6 items-center'>
                    <p className='pl-3 dark:text-gray-100'>{details.meta.summary}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
