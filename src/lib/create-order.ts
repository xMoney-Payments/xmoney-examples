import { getApiCredentials } from '@/lib/credentials'

export type OrderType = 'purchase' | 'recurring' | 'managed' | 'credit'
export type RecurringIntervalType = 'day' | 'month'

export async function createOrder(options: {
  amount: number
  currency: string
  description?: string
  orderType?: OrderType
  intervalType?: RecurringIntervalType
  intervalValue?: number
}): Promise<{ publicKey: string; payload: string; checksum: string }> {
  const { publicKey, apiKey } = getApiCredentials()

  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: options.amount,
      currency: options.currency,
      description: options.description ?? 'xMoney demo order',
      orderType: options.orderType ?? 'purchase',
      intervalType: options.intervalType,
      intervalValue: options.intervalValue,
      publicKey,
      apiKey,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to create order. Check API credentials and try again.')
  }

  const data = await response.json()
  return {
    publicKey,
    payload: data.payload,
    checksum: data.checksum,
  }
}

export function assertXMoneyLoaded(): void {
  if (typeof window === 'undefined' || !window.XMoney) {
    throw new Error(
      'xMoney SDK is not loaded. Check the SDK version in the header and refresh the page.'
    )
  }
}
