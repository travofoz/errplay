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
  const serialize = (obj, seen = new WeakSet(), depth = 0) => {
    if (depth > 5) return '[Max depth]';
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    if (seen.has(obj)) return '[Circular]';

    seen.add(obj);

    if (obj instanceof Error) {
      return { __type: 'Error', name: obj.name, message: obj.message, stack: obj.stack };
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
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
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
      stack: event.reason?.stack,
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

