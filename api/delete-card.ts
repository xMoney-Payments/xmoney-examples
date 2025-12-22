export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { cardId, apiKey, isLive } = req.body

  if (!cardId || !apiKey) {
    return res.status(400).json({ error: 'Missing card ID or API key' })
  }

  try {
    // Determine API base URL based on isLive flag from credentials
    const apiBaseUrl = isLive
      ? 'https://api.xmoney.com'
      : 'https://api-stage.xmoney.com'

    // Delete the card
    const response = await fetch(`${apiBaseUrl}/card/${cardId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return res.status(response.status).json({
        error: errorData.message || 'Failed to delete card',
        details: errorData,
      })
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error: any) {
    console.error('Error deleting card:', error)
    res.status(500).json({
      error: error.message || 'Internal server error',
      details: error,
    })
  }
}
