import { useState, useEffect } from 'react'
import { Link } from '@remix-run/react'

export function MangaTable({ id, mangas, heading }) {
  const [searchText, setSearchText] = useState('')

  return (
    <section id={id} className='text-center py-20 dark:bg-slate-600'>
      <div className='container text-left'>
        <h4 className='mb-3 section-heading wow fadeInUp' data-wow-delay='0.3s' id={`heading-${id}`}>
          {heading}
        </h4>
        <div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
          <div className='flex flex-wrap items-center'>
            <div className='p-4'>
              <label htmlFor='table-search' className='sr-only'>
                Search
              </label>
              <div className='relative mt-1'>
                <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                  <svg
                    className='w-5 h-5 text-gray-500 dark:text-gray-400'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                    xmlns='http://www.w3.org/2000/svg'>
                    <path
                      fillRule='evenodd'
                      d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                      clipRule='evenodd'></path>
                  </svg>
                </div>
                <input
                  type='text'
                  id='table-search'
                  className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                  placeholder='Search for items'
                  value={searchText}
                  onChange={e => setSearchText(e.currentTarget.value)}
                />
              </div>
            </div>
          </div>
          <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
            <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
              <tr>
                <th scope='col' className='px-6 py-3'>
                  Series name
                </th>
                <th scope='col' className='px-6 py-3'>
                  Rating
                </th>
              </tr>
            </thead>
            <tbody>
              {mangas
                .filter(
                  manga =>
                    searchText === '' ||
                    manga.meta.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    manga.request.slug.includes(searchText.toLowerCase())
                )
                .map(manga => (
                  <tr
                    key={manga._id.toString()}
                    className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'>
                    <th scope='row' className='px-6 py-4 font-large text-gray-500 dark:text-white whitespace-nowrap'>
                      <Link to={`/manga/${manga.request.slug}`}>{manga.meta.name}</Link>
                    </th>
                    <td>
                      {(manga.rating ?? 0) > 0 ? (
                        <div className='rating rating-sm rating-half'>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                            <input
                              key={i}
                              type='radio'
                              name='rating-10'
                              className={`bg-green-500 mask mask-star-2 mask-half-${i % 2 === 1 ? 1 : 2}`}
                              checked={(manga.rating ?? 0) === i}
                              readOnly={true}
                            />
                          ))}
                        </div>
                      ) : (
                        <em>not rated</em>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function MangaViewCell({ manga }) {
  const rating = manga.rating ?? 0
  return (
    <div className='max-w-sm sm:w-1/2 md:w-1/4 lg:w-1/6'>
      <div className='team-item'>
        <div className='team-img relative'>
          <Link to={`manga/${manga.request.slug}/read`}>
            {manga.thumbnail !== undefined ? (
              <img
                className='img-fluid'
                src={`data:image/jpeg;base64, ${manga.thumbnail.toString('base64')}`}
                alt='Manga thumbnail'
                style={{ width: '370px', height: '320px', objectFit: 'cover' }}
              />
            ) : (
              <img
                className='img-fluid'
                src={`/manga/image/${manga.request.slug}`}
                alt='Manga thumbnail'
                style={{ width: '370px', height: '320px', objectFit: 'cover' }}
              />
            )}
          </Link>
        </div>
        <div className='text-center px-5 py-3 dark:bg-slate-500'>
          {/* {(manga.rating ?? 0) > 0 ? (
            <div className='rating rating-sm rating-half'>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <input
                  key={i}
                  type='radio'
                  name='rating-10'
                  className={`bg-green-500 mask mask-star-2 mask-half-${i % 2 === 1 ? 1 : 2}`}
                  checked={(manga.rating ?? 0) === i}
                  readOnly={true}
                />
              ))}
            </div>
          ) : null} */}
          <h3 className='team-name dark:text-gray-100'>
            <Link to={`/manga/${manga.request.slug}`}>{manga.meta.name}</Link>
          </h3>
        </div>
      </div>
    </div>
  )
}

export function MangaViewTable({ id, mangas, heading, useBlue = false, lowerLevel = false, maxRows = 2 }) {
  const [showAll, setShowAll] = useState(true)

  useEffect(() => {
    if (mangas.length > 0) {
      const grid = Array.from(document.querySelector(`#${id}`)?.children)
      const breakIndex = grid.findIndex(item => item.offsetTop > grid[0].offsetTop)
      const numPerRow = breakIndex === -1 ? grid.length : breakIndex

      if (mangas.length > numPerRow * maxRows) {
        setShowAll(numPerRow * maxRows)
      }
    }
  }, [id, mangas.length, maxRows])

  return mangas.length > 0 ? (
    <section
      id='team'
      className={`py-24 text-center ${useBlue ? 'bg-blue-100 dark:bg-slate-800' : 'dark:bg-slate-600'}`}>
      <div className='container'>
        <div className='text-center'>
          {lowerLevel ? (
            <h3 className='mb-10 section-heading-lower wow fadeInDown' data-wow-delay='0.3s' id={`heading-${id}`}>
              {heading}
            </h3>
          ) : (
            <h2 className='mb-12 section-heading wow fadeInDown' data-wow-delay='0.3s' id={`heading-${id}`}>
              {heading}
            </h2>
          )}
        </div>
        <div className='flex flex-wrap justify-center' id={id}>
          {mangas.slice(0, showAll === true ? mangas.length : showAll).map(manga => (
            <MangaViewCell key={manga._id.toString()} manga={manga} />
          ))}
          {showAll !== true ? (
            <div className='submit-button mx-3'>
              <button
                className='btn'
                onClick={() => {
                  setShowAll(true)
                }}>
                show {mangas.length - showAll} more
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  ) : null
}
