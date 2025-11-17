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

/**
 * Shared logic to log a client-side error payload to the console.
 * Formats output with ANSI color codes for better readability in the terminal.
 * @param {object} body - The parsed JSON body from the request.
 */
export function logErrorPayload(body) {
  if (!body || typeof body !== 'object' || !body.type) return;

  const timestamp = new Date(body.timestamp).toISOString();

  console.log('\n\x1b[31m========== CLIENT ERROR ==========\x1b[0m'); // Red banner
  console.log(`\x1b[36m[TYPE]\x1b[0m      \x1b[33m${body.type}\x1b[0m`); // Cyan label, Yellow type
  console.log(`\x1b[36m[TIME]\x1b[0m      ${timestamp}`);

  if (body.message) {
    console.log(`\x1b[36m[MESSAGE]\x1b[0m   ${body.message}`);
  }
  if (body.filename) {
    console.log(`\x1b[36m[FILE]\x1b[0m      ${body.filename}:${body.lineno}:${body.colno}`);
  }
  if (body.stack) {
    console.log(`\x1b[36m[STACK]\x1b[0m\n${body.stack}`);
  }
  if (body.args && Array.isArray(body.args)) {
    console.log('\x1b[36m[ARGS]\x1b[0m');
    console.dir(body.args, { depth: 5 });
  }

  console.log('\x1b[31m==================================\x1b[0m\n');
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

