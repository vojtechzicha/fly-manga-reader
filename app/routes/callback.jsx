import { handleRedirect } from '../onedrive.server'

export async function loader({ request }) {
  return handleRedirect(request)
}
