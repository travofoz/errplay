import { logErrorPayload, isDevelopmentPostRequest } from 'errplay'

/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    {
      name: 'errplay',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url !== '/api/errplay') return next()
          if (!isDevelopmentPostRequest(req)) {
            res.statusCode = 404
            return res.end()
          }
          let body = ''
          req.on('data', chunk => body += chunk)
          req.on('end', () => {
            try {
              logErrorPayload(JSON.parse(body))
            } catch (e) {
              console.error('errplay: Failed to parse error log body.', e)
            }
            res.statusCode = 204
            res.end()
          })
        })
      },
    },
  ],
}
