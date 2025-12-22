export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { customerIdentifier, apiKey, isLive } = req.body

  if (!customerIdentifier || !apiKey) {
    return res
      .status(400)
      .json({ error: 'Missing customer identifier or API key' })
  }

  try {
    // Determine API base URL based on isLive flag from credentials
    const apiBaseUrl = isLive
      ? 'https://api.xmoney.com'
      : 'https://api-stage.xmoney.com'

    // First, get the customer ID from the identifier
    const customerResponse = await fetch(
      `${apiBaseUrl}/customer?identifier=${encodeURIComponent(customerIdentifier)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!customerResponse.ok) {
      const errorData = await customerResponse.json().catch(() => ({}))
      return res.status(customerResponse.status).json({
        error: errorData.message || 'Failed to fetch customer',
        details: errorData,
      })
    }

    const customerData = await customerResponse.json()

    // Extract customer ID from the response
    if (
      !customerData.data ||
      !Array.isArray(customerData.data) ||
      customerData.data.length === 0
    ) {
      return res.status(404).json({
        error: 'Customer not found',
        code: 404,
      })
    }

    const customerId = customerData.data[0].id

    // Now fetch the cards for this customer
    const cardsResponse = await fetch(
      `${apiBaseUrl}/card?customerId=${customerId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!cardsResponse.ok) {
      const errorData = await cardsResponse.json().catch(() => ({}))
      return res.status(cardsResponse.status).json({
        error: errorData.message || 'Failed to fetch customer cards',
        details: errorData,
      })
    }

    const cardsData = await cardsResponse.json()

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: cardsData.data || [],
    })
  } catch (error: any) {
    console.error('Error fetching customer cards:', error)
    res.status(500).json({
      error: error.message || 'Internal server error',
      details: error,
    })
  }
}
