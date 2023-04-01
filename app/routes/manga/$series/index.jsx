import { useOutletContext, Link } from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'

export default function MangaSeriesIndex() {
  const chapters = useOutletContext().filter(ch => !ch.hidden)

  return (
    <div className='container text-left'>
      <h4 className='mb-10 section-heading wow fadeInUp' data-wow-delay='0.3s'>
        Chapters{' '}
        <Link to='edit' className='btn btn-circle btn-outline'>
          {/* <svg xmlns='http://www.w3.org/2000/svg' class='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
          </svg> */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6'
            x='0px'
            y='0px'
            width='50'
            height='50'
            viewBox='0 0 50 50'>
            <path d='M 43.050781 1.9746094 C 41.800781 1.9746094 40.549609 2.4503906 39.599609 3.4003906 L 38.800781 4.1992188 L 45.699219 11.099609 L 46.5 10.300781 C 48.4 8.4007812 48.4 5.3003906 46.5 3.4003906 C 45.55 2.4503906 44.300781 1.9746094 43.050781 1.9746094 z M 37.482422 6.0898438 A 1.0001 1.0001 0 0 0 36.794922 6.3925781 L 4.2949219 38.791016 A 1.0001 1.0001 0 0 0 4.0332031 39.242188 L 2.0332031 46.742188 A 1.0001 1.0001 0 0 0 3.2578125 47.966797 L 10.757812 45.966797 A 1.0001 1.0001 0 0 0 11.208984 45.705078 L 43.607422 13.205078 A 1.0001 1.0001 0 1 0 42.191406 11.794922 L 9.9921875 44.09375 L 5.90625 40.007812 L 38.205078 7.8085938 A 1.0001 1.0001 0 0 0 37.482422 6.0898438 z'></path>
          </svg>
        </Link>
      </h4>
      <div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
        <div className='overflow-x-auto'>
          <table className='table table-compact w-full'>
            <thead>
              <tr>
                <th>Chapter Name</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map(ch => (
                <tr
                  key={ch.chapterPath}
                  className='hover'
                  onClick={e => {
                    e.currentTarget.querySelector('a').click()
                  }}>
                  <td className={!ch.read ? 'font-bold' : 'bg-gray-100 dark:bg-gray-600'}>
                    {ch.seen !== true ? (
                      <>
                        <div className='badge badge-warning gap-2'>updated</div>{' '}
                      </>
                    ) : null}
                    <Link to={`/manga/reader/${ch.mangaPath}/${ch.chapterPath}`}>{ch.name}</Link>
                  </td>
                  <td className={`${ch.read ? 'bg-gray-100 dark:bg-gray-600' : ''} text-sm`}>
                    {formatDistanceToNow(new Date(ch.lastUpdated), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
