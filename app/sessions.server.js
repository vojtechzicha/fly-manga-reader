import { createCookieSessionStorage } from '@remix-run/node'
const { SESSION_SECRET } = process.env

if (!SESSION_SECRET) throw new Error('Missing Session secret in environment variables.')

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    secure: false,
    secrets: [SESSION_SECRET]
  }
})

export { getSession, commitSession, destroySession }
