import { redirect } from '@remix-run/node'

export async function loader({ request }) {
  return redirect('/')
}
