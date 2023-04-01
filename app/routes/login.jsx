import { redirect } from '@remix-run/node'
import { authorize } from '../onedrive.server'

export async function loader({ request }) {
  return authorize(request, async () => {
    return redirect('/')
  })
}
