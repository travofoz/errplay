import express from 'express'
import { ErrplayExpressMiddleware } from 'errplay'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3001

app.use(express.json())
app.use(express.static(join(__dirname, 'public')))
app.use('/node_modules', express.static(join(__dirname, 'node_modules')))
app.post('/api/errplay', ErrplayExpressMiddleware)

app.listen(PORT, () => {
  console.log(`errplay Express demo at http://localhost:${PORT}`)
})
