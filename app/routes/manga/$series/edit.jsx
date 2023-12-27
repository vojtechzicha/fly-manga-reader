import { Link, Form, useFetcher, useLoaderData } from '@remix-run/react'
import { redirect } from '@remix-run/node'
import { useCallback, useEffect, useState, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  markAllChaptersAsSeen,
  markAllChapters,
  showAllChapters,
  getMangaDetail,
  markChapter,
  hideChapter,
  removeChapter,
  reorderChapters,
  resyncManga,
  dedupManga
} from '../../../utils/manga.server'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import update from 'immutability-helper'

export async function action({ request, params: { series } }) {
  const formData = await request.formData(),
    checkedChapters = formData.getAll('chapters')

  if (formData.has('action-mark-all-unread')) {
    await markAllChapters(series, false)
    return redirect(`/manga/${series}/edit`)
  } else if (formData.has('action-mark-all-read')) {
    await markAllChapters(series, true)
    return redirect(`/manga/${series}/edit`)
  } else if (formData.has('action-show-all')) {
    await showAllChapters(series)
    return redirect(`/manga/${series}/edit`)
  } else if (formData.has('action-dedup')) {
    await dedupManga(series)
    return redirect(`/manga/${series}/edit`)
  } else if (formData.has('action-reorder')) {
    await reorderChapters(JSON.parse(formData.get('action-reorder')))
    return null
  } else if (formData.has('action-resync')) {
    await resyncManga(series)
    return redirect(`/manga/${series}/edit`)
  }

  const { chapters } = await getMangaDetail(series)

  for (const chapter of chapters) {
    const id = chapter._id.toString()

    if (formData.has(`action-mark-unread/${id}`)) {
      await markChapter(id, false)
      break
    } else if (formData.has(`action-mark-read/${id}`)) {
      await markChapter(id, true)
      break
    } else if (formData.has(`action-hide/${id}`)) {
      await hideChapter(id)
      break
    }

    if (checkedChapters.includes(id)) {
      if (formData.has('action-mark-unread')) {
        await markChapter(id, false)
      } else if (formData.has('action-mark-read')) {
        await markChapter(id, true)
      } else if (formData.has('action-hide')) {
        await hideChapter(id)
      } else if (formData.has('action-remove')) {
        await removeChapter(id)
      }
    }
  }

  return redirect(`/manga/${series}/edit`)
}

export async function loader({ request, params: { series } }) {
  await markAllChaptersAsSeen(series)

  return { chapters: (await getMangaDetail(series)).chapters }
}

export default function MangaSeriesEdit() {
  const chapters = useLoaderData().chapters.filter(ch => !ch.hidden)

  useEffect(() => {
    document.querySelector('#checkAll').className = 'checkbox'
  }, [])

  return (
    <div className='container text-left'>
      <div className=' flex justify-between'>
        <div>
          <h4 className='mb-10 section-heading wow fadeInUp' data-wow-delay='0.3s'>
            Chapters{' '}
            <Link to='..' className='btn btn-circle btn-outline'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                x='0px'
                y='0px'
                width='50'
                height='50'
                viewBox='0 0 50 50'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M 43.050781 1.9746094 C 41.800781 1.9746094 40.549609 2.4503906 39.599609 3.4003906 L 38.800781 4.1992188 L 45.699219 11.099609 L 46.5 10.300781 C 48.4 8.4007812 48.4 5.3003906 46.5 3.4003906 C 45.55 2.4503906 44.300781 1.9746094 43.050781 1.9746094 z M 37.482422 6.0898438 A 1.0001 1.0001 0 0 0 36.794922 6.3925781 L 4.2949219 38.791016 A 1.0001 1.0001 0 0 0 4.0332031 39.242188 L 2.0332031 46.742188 A 1.0001 1.0001 0 0 0 3.2578125 47.966797 L 10.757812 45.966797 A 1.0001 1.0001 0 0 0 11.208984 45.705078 L 43.607422 13.205078 A 1.0001 1.0001 0 1 0 42.191406 11.794922 L 9.9921875 44.09375 L 5.90625 40.007812 L 38.205078 7.8085938 A 1.0001 1.0001 0 0 0 37.482422 6.0898438 z'></path>
              </svg>
            </Link>
          </h4>
        </div>
        <Form method='POST' className='btn-group mb-6' reloadDocument>
          <button className='btn btn-ghost' type='submit' name='action-mark-all-unread'>
            Mark all as unread
          </button>
          <button className='btn btn-ghost' type='submit' name='action-mark-all-read'>
            Mark all as read
          </button>
          <button className='btn btn-ghost' type='submit' name='action-show-all'>
            Show all &amp; Reset order
          </button>
          <button className='btn btn-ghost' type='submit' name='action-dedup'>
            Dedup
          </button>
          <button className='btn btn-ghost' type='submit' name='action-resync'>
            Resync
          </button>
        </Form>
      </div>
      <DndProvider backend={HTML5Backend}>
        <Table chapters={chapters} />
      </DndProvider>
    </div>
  )
}

function TableRowList({ chapters }) {
  const [chapterList, setChapterList] = useState(chapters.filter(ch => !ch.hidden))

  const fetcher = useFetcher()

  const moveChapter = useCallback((dragIndex, hoverIndex) => {
    setChapterList(prevList =>
      update(prevList, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevList[dragIndex]]
        ]
      })
    )
  }, [])
  const handleDrop = useCallback(
    (id, index) => {
      const reducedList = chapterList.filter(ch => ch._id.toString() !== id)
      const newList = [
        ...reducedList.slice(0, index),
        chapterList.find(ch => ch._id.toString() === id),
        ...reducedList.slice(index)
      ]

      fetcher.submit(
        {
          'action-reorder': JSON.stringify(newList.map((c, ci) => ({ id: c._id.toString(), newIndex: ci })))
        },
        { method: 'post', replace: true }
      )
    },
    [chapterList, fetcher]
  )

  const renderRow = useCallback(
    (chapter, index) => (
      <TableRow
        key={chapter._id.toString()}
        index={index}
        id={chapter._id.toString()}
        chapter={chapter}
        moveChapter={moveChapter}
        enableDrag={fetcher.state === 'idle'}
        dropChapter={handleDrop}
      />
    ),
    [moveChapter, fetcher.state, handleDrop]
  )

  return chapterList.map((ch, chi) => renderRow(ch, chi))
}

function Table({ chapters, submitReorder }) {
  return (
    <Form
      method='POST'
      className='overflow-x-auto w-full'
      reloadDocument
      onSubmit={e => {
        setTimeout(() => {
          document.querySelectorAll('input').forEach(input => {
            input.checked = false
          })
        }, 1)
      }}>
      <table className='table table-compact w-full'>
        <thead>
          <tr>
            <th>
              <label>
                <input
                  type='checkbox'
                  className='checkbox hidden'
                  id='checkAll'
                  onChange={e => {
                    if (e.currentTarget.checked) {
                      document.querySelectorAll('input').forEach(input => {
                        input.checked = true
                      })
                    } else {
                      document.querySelectorAll('input').forEach(input => {
                        input.checked = false
                      })
                    }
                  }}
                />
              </label>
            </th>
            <th>Chapter Name</th>
            <th>Last Updated</th>
            <th>Status</th>
            <th>
              <div className='btn-group'>
                <button className='btn btn-xs' type='submit' name='action-hide'>
                  hide
                </button>
                <button className='btn btn-xs' type='submit' name='action-mark-unread'>
                  mark unread
                </button>
                <button className='btn btn-xs' type='submit' name='action-mark-read'>
                  mark read
                </button>
                <button className='btn btn-xs' type='submit' name='action-remove'>
                  remove
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <TableRowList chapters={chapters} submitReorder={submitReorder} />
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <th>Chapter Name</th>
            <th>Last Updated</th>
            <th>Status</th>
            <th></th>
          </tr>
        </tfoot>
      </table>
    </Form>
  )
}

function TableRow({ chapter: ch, index, moveChapter, id, dropChapter, enableDrag }) {
  const ref = useRef(null)

  const [{ handlerId }, drop] = useDrop({
    accept: 'chapter-item',
    collect: monitor => ({ handlerId: monitor.getHandlerId() }),
    hover(item, monitor) {
      if (!ref.current) return

      const dragIndex = item.index,
        hoverIndex = index
      if (dragIndex === hoverIndex) return

      const hoverBoundingRect = ref.current?.getBoundingClientRect(),
        hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2,
        clientOffset = monitor.getClientOffset(),
        hoverClientY = clientOffset.y - hoverBoundingRect.top
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

      moveChapter(dragIndex, hoverIndex)
      item.index = hoverIndex
    }
  })

  const [{ isDragging }, drag] = useDrag({
    type: 'chapter-item',
    item: () => ({ id, index }),
    collect: monitor => ({ isDragging: monitor.isDragging() }),
    end(item) {
      setTimeout(() => {
        dropChapter(item.id, item.index)
      }, 100)
    },
    canDrag() {
      return enableDrag
    }
  })
  const opacity = isDragging ? 0 : 1

  drag(drop(ref))

  return (
    <tr ref={ref} className='hover' style={{ opacity }} data-handler-id={handlerId}>
      <th>
        <label>
          <input type='checkbox' className='checkbox' name='chapters' value={ch._id.toString()} />
        </label>
      </th>
      <td className={!ch.read ? 'font-bold' : ''}>
        {ch.name} {enableDrag ? '' : 'x'}
      </td>
      <td className='text-xs'>{formatDistanceToNow(new Date(ch.lastUpdated), { addSuffix: true })}</td>
      <td className='text-xs'>
        {ch.read ? `read ${formatDistanceToNow(new Date(ch.readAt), { addSuffix: true })}` : <>unread</>}
      </td>
      <th>
        <button className='btn btn-ghost btn-xs' type='submit' name={`action-hide/${ch._id.toString()}`}>
          hide
        </button>
        {ch.read ? (
          <button className='btn btn-ghost btn-xs' type='submit' name={`action-mark-unread/${ch._id.toString()}`}>
            mark unread
          </button>
        ) : (
          <button className='btn btn-ghost btn-xs' type='submit' name={`action-mark-read/${ch._id.toString()}`}>
            mark read
          </button>
        )}
      </th>
    </tr>
  )
}
