/**
 * Client-side error logger for development environments.
 * 
 * This module captures uncaught exceptions, unhandled promise rejections,
 * and console.error calls. Errors are persisted across HMR reloads and
 * sent to a server-side endpoint for logging.
 * 
 * Usage:
 *   import { initErrplay } from 'errplay/client';
 *   initErrplay({ endpoint: '/__dev__/errors' });
 */

/**
 * Initializes the client-side error logger for development.
 * This function is a no-op if not in a browser environment or if NODE_ENV is not 'development'.
 * 
 * @param {object} options - Configuration options.
 * @param {string} options.endpoint - REQUIRED. The API endpoint to send errors to.
 * @param {Function} [options.stackFilter] - Optional filter for stack frames. Receives the frame line (string),
 *   return true to keep it, false to drop it. Applied on top of the default filter.
 * @param {number} [options.stackLimit] - Optional max frames to include in the stack (excluding the error message).
 * @throws {Error} If endpoint is not provided.
 */
export function initErrplay(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('initErrplay requires an options object.');
  }
  if (!options.endpoint || typeof options.endpoint !== 'string') {
    throw new Error('initErrplay requires options.endpoint (string) to be specified.');
  }

  const ENDPOINT = options.endpoint;
  const stackFilter = typeof options.stackFilter === 'function' ? options.stackFilter : null;
  const stackLimit = typeof options.stackLimit === 'number' ? options.stackLimit : null;

  // Guard against non-browser environments, production builds, or re-initialization.
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development' || window.__errplayInit) {
    return;
  }

  /**
   * Recursively serializes values for JSON transmission.
   * Handles circular references, depth limits, Error objects, and special types.
   * @param {*} obj - The value to serialize.
   * @param {WeakSet} [seen=new WeakSet()] - Tracks visited objects to detect circular refs.
   * @param {number} [depth=0] - Current recursion depth (max 5).
   * @returns {*} Serialized value safe for JSON.stringify.
   */
  const cleanStack = (stack) => {
    if (!stack) return stack;
    const lines = stack.split('\n');
    const cleaned = lines.filter((line, i) => {
      if (i === 0) return true;
      if (line.includes('node_modules') || line.includes('<anonymous>') || line.includes('[native]')) return false;
      return stackFilter ? stackFilter(line) : true;
    }).map(line => {
      return line.replace(/[a-zA-Z][a-zA-Z0-9+.-]*:\/\/\/?[^.]*\.\//, '');
    });
    if (stackLimit) {
      return cleaned.slice(0, stackLimit + 1).join('\n');
    }
    return cleaned.join('\n');
  };

  const serialize = (obj, seen = new WeakSet(), depth = 0) => {
    if (depth > 5) return '[Max depth]';
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    if (seen.has(obj)) return '[Circular]';

    seen.add(obj);

    if (obj instanceof Error) {
      return { __type: 'Error', name: obj.name, message: obj.message, stack: cleanStack(obj.stack) };
    }
    if (Array.isArray(obj)) {
      return obj.map(item => serialize(item, seen, depth + 1));
    }
    if (Object.prototype.toString.call(obj) === '[object Object]') {
      return Object.fromEntries(
        Object.entries(obj)
          .slice(0, 20) // Cap keys to avoid payload bloat
          .map(([k, v]) => [k, serialize(v, seen, depth + 1)])
      );
    }
    return `[${Object.prototype.toString.call(obj).slice(8, -1)}]`;
  };

  /**
   * Sends error payload to the dev server via sendBeacon.
   * sendBeacon is reliable because it persists even if the page unloads.
   * @param {object} payload - The error data to transmit.
   */
  const sendError = (payload) => {
    navigator.sendBeacon(ENDPOINT, JSON.stringify(payload));
  };

  /**
   * Stores an error in sessionStorage for recovery after HMR reloads.
   * Silently fails to prevent cascading errors during error handling.
   * @param {object} payload - The error data to persist.
   */
  const storeError = (payload) => {
    try {
      const stored = JSON.parse(sessionStorage.getItem('__errplay') || '[]');
      stored.push(payload);
      sessionStorage.setItem('__errplay', JSON.stringify(stored));
    } catch (e) {
      console.warn('errplay: Failed to store error in sessionStorage.', e);
    }
  };

  /**
   * Retrieves, sends, and clears any errors stored from a previous reload.
   * Called on initialization to flush errors that occurred during the reload window.
   */
  const flushErrors = () => {
    try {
      const stored = JSON.parse(sessionStorage.getItem('__errplay') || '[]');
      if (stored.length > 0) {
        stored.forEach(sendError);
        sessionStorage.removeItem('__errplay');
      }
    } catch (e) {
      console.warn('errplay: Failed to flush stored errors.', e);
    }
  };

  // Set a flag to prevent re-attaching listeners on HMR updates.
  window.__errplayInit = true;
  flushErrors(); // Flush any errors from a previous page load.

  // Capture synchronous errors and unhandled exceptions.
  window.addEventListener('error', (event) => {
    const payload = {
      type: 'error',
      message: event.message,
      filename: (f => f && !f.includes('node_modules') ? f : undefined)(
        event.filename?.replace(/[a-zA-Z][a-zA-Z0-9+.-]*:\/\/\/?[^.]*\.\//, '')
      ),
      lineno: event.lineno,
      colno: event.colno,
      stack: cleanStack(event.error?.stack),
      timestamp: Date.now(),
    };
    storeError(payload);
    sendError(payload);
  });

  // Capture unhandled Promise rejections.
  window.addEventListener('unhandledrejection', (event) => {
    const payload = {
      type: 'unhandledRejection',
      message: event.reason?.message || String(event.reason),
      stack: cleanStack(event.reason?.stack),
      timestamp: Date.now(),
    };
    storeError(payload);
    sendError(payload);
  });

  // Intercept console.error to capture explicit logs.
  const originalError = console.error;
  console.error = (...args) => {
    originalError(...args);
    const payload = {
      type: 'console.error',
      args: args.map(arg => serialize(arg)),
      timestamp: Date.now(),
    };
    storeError(payload);
    sendError(payload);
  };
}

