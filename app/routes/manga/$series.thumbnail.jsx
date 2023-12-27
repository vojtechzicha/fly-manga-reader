import { redirect } from '@remix-run/node'
import { getThumbnailSrc } from '~/utils/s3.server'

export function loader({ params: { series } }) {
  return redirect(getThumbnailSrc(series))
}
