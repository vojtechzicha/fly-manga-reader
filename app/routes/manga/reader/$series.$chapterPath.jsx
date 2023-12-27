import { redirect } from '@remix-run/node'
import { Link, useLoaderData, Form } from '@remix-run/react'

import {
  getImages,
  getMangaDetail,
  markChapter,
  getNextChapter,
  getPreviousChapter,
  markChapterAsSeen
} from '../../../utils/manga.server'

export async function action({ request, params: { series, chapterPath } }) {
  const formData = await request.formData(),
    action = formData.get('action'),
    chapterId = formData.get('chapter-id')

  const targetChapter =
    action === 'prev-chapter'
      ? await getPreviousChapter(series, chapterPath)
      : await getNextChapter(series, chapterPath)

  await markChapter(chapterId, action === 'next-chapter')
  if (targetChapter === null) {
    return redirect(`/manga/${series}`)
  } else {
    return redirect(`/manga/reader/${series}/${targetChapter.chapterPath}`)
  }
}

export async function loader({ request, params: { series, chapterPath } }) {
  await markChapterAsSeen(series, chapterPath)

  const { details, chapters } = await getMangaDetail(series)
  return {
    images: await getImages(series, chapterPath),
    details,
    chapter: chapters.filter(ch => ch.chapterPath === chapterPath)[0]
  }
}

export default function Index() {
  const { images, details, chapter } = useLoaderData()

  const scrollUp = () => window.scrollTo(0, 0)

  return (
    <>
      <div className='bg-blue-100 dark:bg-slate-800 pt-24 pb-5 lg:fixed top-0 left-0 w-full'>
        <div className='container'>
          <h2 className='mb-4 section-heading wow fadeInDown' data-wow-delay='0.3s'>
            <Link to={`/manga/${details.request.slug}`} className='text-gray-500'>
              {details.meta.name}
            </Link>{' '}
            - {chapter.name}
          </h2>
        </div>
      </div>
      <section className='pt-10 pb-4 dark:bg-slate-600'>
        <div className='container '>
          <div className='flex justify-center'>
            <div className='w-full text-center' style={{ marginTop: '17rem' }}>
              {images.map((imgSrc, index) => (
                <>
                  <img key={index} src={imgSrc} alt='Manga chapter' />
                  <br />
                </>
              ))}
            </div>
          </div>
        </div>
      </section>
      <hr />
      <div id='feature' className='bg-blue-100 dark:bg-slate-800 pt-4 pb-4'>
        <div className='container'>
          <div class='flex flex-wrap'>
            <div class='w-full sm:w-1/2 md:w-1/2 lg:w-1/3'>
              <Form method='POST'>
                <input type='hidden' name='action' value='prev-chapter' />
                <input type='hidden' name='chapter-id' value={chapter._id} />
                <input type='submit' class='btn' value='< Previous Chapter' onClick={scrollUp} />
              </Form>
            </div>
            <div class='w-full sm:w-1/2 md:w-1/2 lg:w-1/3'></div>
            <div class='w-full sm:w-1/2 md:w-1/2 lg:w-1/3'>
              <Form method='POST'>
                <input type='hidden' name='action' value='next-chapter' />
                <input type='hidden' name='chapter-id' value={chapter._id} />
                <input type='submit' class='btn' value='> Next Chapter' onClick={scrollUp} />
              </Form>
            </div>
          </div>
        </div>
      </div>
      <hr />
    </>
  )
}
