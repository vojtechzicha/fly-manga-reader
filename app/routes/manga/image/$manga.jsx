import { getThumbnailImage } from '../../../utils/manga.server'
import { authorize } from '../../../onedrive.server'

export function headers() {
  return {
    'Cache-Control': 'max-age=300000'
  }
}

export async function loader({ request, params: { manga } }) {
  return authorize(request, async () => {
    return new Response(await getThumbnailImage(manga))
  })
}
