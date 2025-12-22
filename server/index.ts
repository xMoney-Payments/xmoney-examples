import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import healthHandler from '../api/health'
import initCheckoutHandler from '../api/orders'
import verifyCardHandler from '../api/verify-card'
import getCardsHandler from '../api/get-cards'
import deleteCardHandler from '../api/delete-card'

// @ts-ignore
dotenv.config({ quiet: true })

const app = express()
const port = parseInt(process.env.SERVER_PORT || '3001', 10)

app.use(cors())
app.use(express.json())

// Use the Vercel Serverless Functions as Express handlers
app.get('/api/health', (req, res) => healthHandler(req, res))
app.post('/api/orders', (req, res) => initCheckoutHandler(req, res))
app.post('/api/verify-card', (req, res) => verifyCardHandler(req, res))
app.post('/api/get-cards', (req, res) => getCardsHandler(req, res))
app.post('/api/delete-card', (req, res) => deleteCardHandler(req, res))

app.listen(port, () => {
  console.log(`\x1b[36m%s\x1b[0m`, `Server running at http://localhost:${port}`)
})
