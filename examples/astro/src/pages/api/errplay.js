import { ErrplayHandler } from 'errplay'

export async function POST({ request }) {
  return ErrplayHandler(request)
}
