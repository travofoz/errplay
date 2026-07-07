import { readBody, sendNoContent, sendError } from 'h3';
import { isDevelopmentPostRequest, logErrorPayload } from './server.js';

/**
 * A handler for Nuxt 3 using the Nitro server engine.
 * 
 * NOTE: This handler requires the `h3` package to be installed in the host project.
 * 
 * Usage:
 *   import { ErrplayNuxtHandler } from 'errplay/nuxt';
 *   export default defineEventHandler(ErrplayNuxtHandler);
 * 
 * @param {import('h3').H3Event} event - The H3 event object provided by Nuxt.
 */
export async function ErrplayNuxtHandler(event) {
  // We need to re-implement the logic here because the core request object is different.
  if (process.env.NODE_ENV === 'development' && event.node.req.method === 'POST') {
    try {
      const body = await readBody(event);
      logErrorPayload(body);
    } catch (e) {
      console.error('errplay: Failed to parse error log body in Nuxt handler.', e);
    }
    return sendNoContent(event, 204);
  }
  
  return sendError(event, 404, 'Not Found');
}

