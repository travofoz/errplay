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
- **Colored Terminal Output**: ANSI color codes make errors stand out in your dev console.
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

The `endpoint` is a required option. Specify it when calling `initErrplay`:

```javascript
initErrplay({
  endpoint: '/your/custom/error/endpoint'
});
```
The endpoint must match the server-side route you create. If the endpoint is not provided, the function will throw an error.

## How It Works

1.  **Client Initialization**: When `initErrplay()` is called, it attaches global error listeners to the `window` object.
2.  **Error Capture**: Any uncaught exception, unhandled promise rejection, or `console.error` call is captured with full details.
3.  **Dual Action**: Errors are both sent immediately to the server via `navigator.sendBeacon` and stored in `sessionStorage` for recovery.
4.  **HMR Handling**: On page reload (including HMR), the script checks for stored errors and flushes them to the server before listeners are re-attached.
5.  **Terminal Output**: The server-side handler logs formatted error details to your console with color coding.

## Production Safety

`initErrplay()` is a complete no-op in production (`process.env.NODE_ENV !== 'development'`):
-   No event listeners are attached.
-   No data is stored or transmitted.
-   There is zero runtime overhead.

You can safely leave the import and call in your code for all environments.

## License

MIT

