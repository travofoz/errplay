/**
 * Server-side handlers for the errplay client.
 * 
 * This module exports framework-specific handlers that receive error payloads
 * from the client and log them to the console with formatted output.
 * 
 * It also exports shared utility functions for use by other entry points (e.g., nuxt.js).
 * 
 * Only responds to requests when NODE_ENV is 'development'.
 */

/** Deduplication cache: exact match on type|message|stack|args|client-timestamp.
 *  Catches reload-flush re-sends and same-tick double-dispatch without any time window.
 *  Hoisted to globalThis to survive Next.js HMR server-bundle re-evaluation.
 *  Resets on full server restart — correct: errors from a dead session should re-log. */
const _seen = globalThis.__errplaySeen || (globalThis.__errplaySeen = new Set());

/** Color helper: emits ANSI codes only when stdout is a TTY and NO_COLOR is unset.
 *  Matches ls --color=auto behavior — colors in terminal, plain text when piped. */
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => useColor ? `\x1b[${code}m${s}\x1b[0m` : s;

/**
 * Shared logic to log a client-side error payload to the console.
 * Deduplicates by exact match on type+message+stack+args+client-timestamp — catches
 * reload-flush re-sends and same-tick double-dispatch without any time window.
 * Uses a globalThis-hoisted Set to survive Next.js HMR server-bundle re-evaluation.
 * Output uses ANSI colors when writing to a TTY, plain text when piped (see useColor above).
 * @param {object} body - The parsed JSON body from the request.
 */
export function logErrorPayload(body) {
  if (!body || typeof body !== 'object' || !body.type) return;

  // Server-side dedup: exact match on the client's original timestamp.
  // The flush after reload carries the SAME timestamp as the original send,
  // so this catches all replay duplicates regardless of when they arrive.
  const fp = body.type + '|' + (body.message || '') + '|' + (body.stack || '') + '|' + JSON.stringify(body.args || '') + '|' + (body.timestamp || '');
  if (_seen.has(fp)) return;
  _seen.add(fp);

  const timestamp = new Date(body.timestamp).toISOString();

  console.log('\n' + c('31', '========== CLIENT ERROR =========='));
  console.log(c('36', '[TYPE]') + '      ' + c('33', body.type));
  console.log(c('36', '[TIME]') + '      ' + timestamp);

  if (body.message) {
    console.log(c('36', '[MESSAGE]') + '   ' + body.message);
  }
  if (body.filename) {
    console.log(c('36', '[SOURCE]') + '    ' + body.filename);
  }
  if (body.stack) {
    console.log(c('36', '[STACK]') + '\n' + body.stack);
  }
  if (body.args && Array.isArray(body.args)) {
    console.log(c('36', '[ARGS]'));
    console.dir(body.args, { depth: 5 });
  }

  console.log(c('31', '==================================') + '\n');
}

/**
 * Checks if a request is a valid POST request in a development environment.
 * Handles different request object structures across frameworks.
 * @param {object} req - The framework's request object.
 * @returns {boolean} True if this is a development POST request.
 */
export function isDevelopmentPostRequest(req) {
  if (process.env.NODE_ENV !== 'development') return false;
  // Handle different frameworks' method properties
  const method = req.method || req.request?.method;
  return method === 'POST';
}

/**
 * A handler for frameworks using the Web Standards Request/Response API.
 * Works with: Next.js App Router, SvelteKit, Remix, Astro, and other modern frameworks.
 * 
 * Usage:
 *   export const POST = ErrplayHandler;
 * 
 * @param {Request} req - The standard Request object.
 * @returns {Response} A Response object (204 on success, 404 otherwise).
 */
export async function ErrplayHandler(req) {
  if (isDevelopmentPostRequest(req)) {
    try {
      const body = await req.json();
      logErrorPayload(body);
    } catch (e) {
      console.error('errplay: Failed to parse error log body.', e);
    }
    return new Response(null, { status: 204 });
  }
  return new Response(null, { status: 404 });
}

/**
 * A handler for Next.js Pages Router.
 * 
 * Usage:
 *   export default ErrplayPagesHandler;
 * 
 * @param {import('next').NextApiRequest} req - The Next.js request object.
 * @param {import('next').NextApiResponse} res - The Next.js response object.
 */
export function ErrplayPagesHandler(req, res) {
  if (isDevelopmentPostRequest(req)) {
    // req.body is pre-parsed by Next.js
    logErrorPayload(req.body);
    res.status(204).end();
  } else {
    res.status(404).end();
  }
}

/**
 * An Express middleware handler.
 * 
 * NOTE: Requires `express.json()` middleware to be used before this handler.
 * 
 * Usage:
 *   app.use(express.json());
 *   app.post('/__dev__/errors', ErrplayExpressMiddleware);
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
export function ErrplayExpressMiddleware(req, res) {
  if (isDevelopmentPostRequest(req)) {
    // req.body is pre-parsed by express.json()
    logErrorPayload(req.body);
    res.status(204).end();
  } else {
    res.status(404).end();
  }
}

