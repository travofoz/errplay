# errplay

[![npm version](https://img.shields.io/npm/v/errplay.svg)](https://www.npmjs.com/package/errplay)

A framework-agnostic client-side error logger for development that persists across Hot Module Replacement (HMR) reloads and streams errors to your terminal.

Never again lose an error message that happens right before a hot reload. This utility captures uncaught exceptions, unhandled promise rejections, and `console.error` calls, stores them in `sessionStorage`, and sends them to a server-side endpoint where they can be logged to your terminal.

## Features

- **HMR Persistence**: Errors survive hot reloads and are flushed to the server on the next load.
- **Comprehensive Capture**: Catches `window.onerror`, unhandled promise rejections, and `console.error`.
- **Detailed Logging**: Captures stack traces, line/column numbers, and properly serializes logged objects (handling circular references).
- **Broad Framework Support**: Provides ready-to-use handlers for Next.js, Nuxt, SvelteKit, Express, Remix, Astro, and more.
- **Zero Production Overhead**: The entire module is disabled when `process.env.NODE_ENV` is not `'development'`.
- **Colored Terminal Output**: ANSI colors when writing to a TTY, plain text when piped (`ls --color=auto` style). Respects the `NO_COLOR` environment variable.
- **Explicit Configuration**: No magic defaults—you must explicitly specify your endpoint.

## Installation

Install the package as a development dependency:

```bash
npm install errplay --save-dev
```

## Usage

Setup is a two-step process: initializing the client-side listener and creating the server-side API endpoint to receive the logs.

### 1. Client-Side Setup

Import and call `initErrplay` in your main client-side entry point with the r99equired `endpoint`. This should be a file that runs once when your application loads in the browser.

#### Next.js (App Router)

There are two ways to set up `errplay` in the App Router: a quick start for immediate testing, and a best practice for optimized production apps.

**1. Quick Start**

This is the fastest way to get started and see `errplay` in action. It involves turning your root layout into a Client Component.

File: `app/layout.js`
```javascript
'use client'; // This makes the root layout a Client Component
import { initErrplay } from 'errplay/client';

// Initialize with your endpoint
initErrplay({ endpoint: '/api/__dev__/errors' });

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

> **Note:** While this is the quickest method, it turns your entire root layout into a Client Component. For production applications, the Best Practice pattern below is recommended to keep your root layout as a high-performance Server Component.

**2. Best Practice for Production Apps**

This pattern keeps your root `layout.js` as a pure Server Component by isolating the dev-only client code into its own component.

**First, create a `DevTools` component:**

File: `components/DevTools.js`
```javascript
'use client';

import { useEffect } from 'react';

// This component will be a no-op in production
export function DevTools() {
  useEffect(() => {
    // This check ensures the code is only included in development bundles.
    // In production, the entire block is eliminated by dead-code elimination.
    if (process.env.NODE_ENV === 'development') {
      import('errplay/client').then(module => {
        module.initErrplay({ endpoint: '/api/__dev__/errors' });
      });
    }
  }, []);

  // This component renders nothing in the DOM
  return null;
}
```

**Then, add the component to your Root Layout:**

Now, your `layout.js` can remain a clean Server Component.

File: `app/layout.js`
```javascript
import { DevTools } from '../components/DevTools';

export const metadata = {
  title: 'My Awesome App',
  // ...
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <DevTools />
      </body>
    </html>
  );
}
```

#### Next.js (Pages Router)
File: `pages/_app.js`
```javascript
import { initErrplay } from 'errplay/client';

initErrplay({ endpoint: '/api/__dev__/errors' });

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
```

#### SvelteKit
File: `src/routes/+layout.js`
```javascript
import { initErrplay } from 'errplay/client';

initErrplay({ endpoint: '/api/__dev__/errors' });
```

#### Generic Vite Client (React, Vue, etc.)
File: your main client entry point (e.g., `src/main.js`)
```javascript
import { initErrplay } from 'errplay/client';

initErrplay({ endpoint: '/api/__dev__/errors' });
```

### 2. Server-Side Setup

Create an API route at the endpoint you specified that uses the appropriate handler from the module.

#### Next.js (App Router)
File: `app/api/__dev__/errors/route.js`
```javascript
import { ErrplayHandler } from 'errplay';

export const POST = ErrplayHandler;
```

#### Next.js (Pages Router)
File: `pages/api/__dev__/errors.js`
```javascript
import { ErrplayPagesHandler } from 'errplay';

export default ErrplayPagesHandler;
```

#### Nuxt 3
File: `server/api/__dev__/errors.post.ts` (or `.js`)
```typescript
import { ErrplayNuxtHandler } from 'errplay/nuxt';

// The Nuxt handler is imported from a separate entry point
export default defineEventHandler(ErrplayNuxtHandler);
```

#### SvelteKit
File: `src/routes/api/__dev__/errors/+server.js`
```javascript
import { ErrplayHandler } from 'errplay';

export const POST = ErrplayHandler;
```

#### Remix
File: `app/routes/api/__dev__/errors.ts` (or `.js`)
```typescript
import { ErrplayHandler } from 'errplay';

// The handler works directly as a Remix action function
export const action = ErrplayHandler;
```

#### Astro
File: `src/pages/api/__dev__/errors.ts` (or `.js`)
```typescript
import { ErrplayHandler } from 'errplay';

export const POST = ErrplayHandler;
```

#### Express
In your main server file (e.g., `server.js`):
```javascript
import express from 'express';
import { ErrplayExpressMiddleware } from 'errplay';

const app = express();

// This is required to parse the JSON body
app.use(express.json());

// Mount the error logging route
app.post('/api/__dev__/errors', ErrplayExpressMiddleware);

// ... rest of your server setup
app.listen(3000, () => console.log('Server is running...'));
```

## Configuration

### `endpoint` (required)
The URL path to your dev server's error API endpoint. Must match the server-side route you create.

```javascript
initErrplay({
  endpoint: '/api/__dev__/errors'
});
```

### `stackFilter` (optional)
A function to further filter which stack frames are kept. Receives each frame line (after default filtering and scheme stripping) and should return `true` to keep it or `false` to drop it.

The default filter already drops `node_modules`, `<anonymous>`, and `[native]` frames. Use `stackFilter` to narrow further to your project's source directories:

```javascript
initErrplay({
  endpoint: '/api/__dev__/errors',
  // Only keep frames from your source directory
  stackFilter: (line) => line.includes('/src/'),
});
```

### `stackLimit` (optional)
Maximum number of stack frames to include (excluding the error message line). Helps keep payloads small for AI agents or terminal readability.

```javascript
initErrplay({
  endpoint: '/api/__dev__/errors',
  stackLimit: 5,
});
```

### `dedupWindow` (optional)
Minimum milliseconds between identical errors on the client before they're treated as duplicates. Default `50`. This prevents React dev mode from producing two log entries when it dispatches the same error event twice.

The server also performs authoritative exact-match dedup — two payloads with the same `type`, `message`, `stack`, and client `timestamp` are treated as one, regardless of when they arrive. This catches reload-flush re-sends without any time window. The dedup cache is hoisted to `globalThis` to survive Next.js HMR server-bundle re-evaluation, and resets naturally on full server restart (so errors from a past process log fresh).

Set to `0` to disable the client-side optimization (the server still deduplicates).

```javascript
initErrplay({
  endpoint: '/api/__dev__/errors',
  dedupWindow: 100, // more forgiving
});
```

### Automatic Stack Cleaning
Bundler URL schemes (`webpack-internal://`, `turbopack://`, `file://`, etc.) are automatically stripped using an RFC 3986 universal pattern — no bundler-specific code, future-proof across frameworks.

## How It Works

1.  **Client Initialization**: When `initErrplay()` is called, it attaches global error listeners to the `window` object.
2.  **Error Capture**: Any uncaught exception, unhandled promise rejection, or `console.error` call is captured with full details.
3.  **Client Dedup**: Within N milliseconds (default 50), identical errors are silently dropped on the client to avoid redundant beacon requests from React's double-dispatch behavior.
4.  **Send + Storage**: Errors are sent immediately to the server via `navigator.sendBeacon` and stored in `sessionStorage` for crash recovery. If `sendBeacon` fails to queue, the error is kept in storage for retry on the next pageload.
5.  **HMR Handling**: On page reload (including HMR), the script checks for stored errors and flushes them to the server before listeners are re-attached. The server's exact-match dedup (by `type`, `message`, `stack`, and original `timestamp`) silently drops any re-send — so you never see a duplicate even after a reload. The dedup cache uses `globalThis` to survive Next.js server-bundle re-evaluation across HMR cycles.
6.  **Terminal Output**: The server-side handler logs formatted error details to your console. ANSI colors are used when stdout is a TTY; plain text when piped (respects `NO_COLOR`). Full stacks are displayed — any truncation is controlled client-side via `stackLimit`. The `[SOURCE]` field shows the file path without redundant line:col (those are already in the stack frames).

## Production Safety

`initErrplay()` is a complete no-op in production (`process.env.NODE_ENV !== 'development'`):
-   No event listeners are attached.
-   No data is stored or transmitted.
-   There is zero runtime overhead.

You can safely leave the import and call in your code for all environments.

## License

MIT

