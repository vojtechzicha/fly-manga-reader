import { redirect } from '@remix-run/node'
import { v4 as uuid } from 'uuid'
import { getSession, commitSession } from './sessions.server'

const {
  ONEDRIVE_CLIENT_ID,
  ONEDRIVE_CLIENT_SECRET,
  ONEDRIVE_AUTHORIZE_URL,
  ONEDRIVE_TOKEN_URL,
  ONEDRIVE_CALLBACK_URL
} = process.env

if (!ONEDRIVE_CLIENT_ID) throw new Error('Missing OneDrive client ID in environment variables.')
if (!ONEDRIVE_CLIENT_SECRET) throw new Error('Missing OneDrive client secret in environment variables.')
if (!ONEDRIVE_AUTHORIZE_URL) throw new Error('Missing OneDrive Authorize URL in environment variables.')
if (!ONEDRIVE_TOKEN_URL) throw new Error('Missing OneDrive Token URL in environment variables.')
if (!ONEDRIVE_CALLBACK_URL) throw new Error('Missing OneDrive calllback URL in environment variables.')

const onedrive = {
  clientId: ONEDRIVE_CLIENT_ID,
  clientSecret: ONEDRIVE_CLIENT_SECRET,
  authorizeUrl: ONEDRIVE_AUTHORIZE_URL,
  tokenUrl: ONEDRIVE_TOKEN_URL,
  callbackUrl: ONEDRIVE_CALLBACK_URL
}

function redirectUrl(state) {
  const url = new URL(onedrive.authorizeUrl)

  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', onedrive.clientId)
  url.searchParams.set('redirect_uri', onedrive.callbackUrl)
  url.searchParams.set('scope', 'Files.ReadWrite.All')
  url.searchParams.set('state', state)

  return url.toString()
}

async function authenticate(request, session) {
  if (session.has('token')) {
    return {
      user: {},
      token: session.get('token')
    }
  } else {
    return { user: null, token: null }
  }
}

export async function authorize(request, callback, checkOnedrive = false) {
  const session = await getSession(request.headers.get('Cookie'))

  try {
    const { user, token } = await authenticate(request, session)
    if (!user || !token) throw new Error('Unauthorized')

    if (checkOnedrive) {
      const response = await fetch('https://graph.microsoft.com/v1.0/me/drives', {
        method: 'GET',
        headers: new Headers([['Authorization', `Bearer ${token}`]])
      }).then(r => r.json())

      if (response.error !== undefined) {
        throw response.error
      }
    }

    try {
      return await callback({ token })
    } catch (e) {
      throw { __passthrough: true, error: e }
    }
  } catch (e) {
    if (e.__passthrough !== undefined && e.error.code !== 'InvalidAuthenticationToken') throw e.error
    session.unset('token')

    const state = encodeURIComponent(uuid())
    session.set('onedrive:state', state)

    return redirect(redirectUrl(state), {
      headers: { 'Set-Cookie': await commitSession(session) }
    })
  }
}

export async function handleRedirect(request) {
  const session = await getSession(request.headers.get('Cookie'))
  const url = new URL(request.url)

  const state = url.searchParams.get('state')
  if (!state) return redirect('/login')

  if (session.get('onedrive:state') === state) session.unset('onedrive:state')
  else return redirect('/login')

  const code = url.searchParams.get('code')
  if (!code) return redirect('/code')

  const data = new URLSearchParams()
  data.append('client_secret', onedrive.clientSecret)
  data.append('grant_type', 'authorization_code')
  data.append('redirect_uri', onedrive.callbackUrl)
  data.append('client_id', onedrive.clientId)
  data.append('code', code)
  const response = await fetch(onedrive.tokenUrl, {
    method: 'POST',
    headers: new Headers([['Content-Type', 'application/x-www-form-urlencoded']]),
    body: data
  })
  const body = await response.json()

  if (body.error) {
    console.error(body)
    return redirect('login')
  }

  session.set('token', body.access_token)

  return redirect('/', {
    headers: new Headers([['Set-Cookie', await commitSession(session)]])
  })
}
