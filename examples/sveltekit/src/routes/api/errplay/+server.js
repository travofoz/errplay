import { logErrorPayload, isDevelopmentPostRequest } from 'errplay'

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
  if (isDevelopmentPostRequest(event)) {
    try {
      const body = await event.request.json()
      logErrorPayload(body)
    } catch (e) {
      console.error('errplay: Failed to parse error log body.', e)
    }
    return new Response(null, { status: 204 })
  }
  return new Response(null, { status: 404 })
}
