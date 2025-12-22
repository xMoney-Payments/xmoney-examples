import { getBase64JsonRequest, getBase64Checksum } from 'xmoney'

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    amount = 100,
    currency = 'EUR',
    description = 'Test Order',
    publicKey,
    apiKey,
  } = req.body

  if (!publicKey || !apiKey) {
    return res.status(400).json({ error: 'Missing credentials' })
  }

  const orderId = `order-${Date.now()}`

  // Determine base URL:
  // 1. process.env.BASE_URL (user override)
  // 2. process.env.VERCEL_URL (automatically set by Vercel, but excludes protocol)
  // 3. Fallback to localhost with VITE_PORT (or default 5173)
  const protocol = req.headers['x-forwarded-proto'] || 'http'
  const vercelUrl = process.env.VERCEL_URL
    ? `${protocol}://${process.env.VERCEL_URL}`
    : null
  const vitePort = process.env.VITE_PORT || '5173'
  const baseUrl =
    process.env.BASE_URL || vercelUrl || `http://localhost:${vitePort}`

  const orderData = {
    publicKey: publicKey,
    customer: {
      identifier: 'customer-12333',
      firstName: 'John',
      lastName: 'Doe',
      country: 'RO',
      city: 'Bucharest',
      email: 'john.doe@test.com',
    },
    order: {
      orderId: orderId,
      description: description,
      type: 'purchase',
      amount: amount,
      currency: currency,
    },
    cardTransactionMode: 'authAndCapture',
    backUrl: `${baseUrl}/inline-checkout`,
  }

  try {
    const payload = getBase64JsonRequest(orderData)
    const checksum = getBase64Checksum(orderData, apiKey)

    res.status(200).json({
      payload,
      checksum,
    })
  } catch (error) {
    console.error('Error generating signature:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
