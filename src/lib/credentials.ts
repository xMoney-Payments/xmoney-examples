/**
 * Helper to retrieve xMoney API credentials from localStorage.
 * Handles the JSON parsing required because useLocalStorage hook stringifies values.
 */

const TEST_ENV = 'test'
const LIVE_ENV = 'live'

interface ApiCredentials {
  siteId: string
  publicKey: string
  secretKey: string
  apiKey: string
  isLive: boolean
}

function extractTokenFromSecretKey(secretKey: string): string {
  const regexp = new RegExp(`^sk_(${TEST_ENV}|${LIVE_ENV})_(.+)$`)
  const match = secretKey.match(regexp)

  return match ? match[2] : secretKey
}

export function getEnvironmentFromSecretKey(
  secretKey: string
): 'test' | 'live' {
  const regexp = new RegExp(`^sk_(${TEST_ENV}|${LIVE_ENV})_(.+)$`)
  const match = secretKey.match(regexp)

  if (match && match[1] === LIVE_ENV) {
    return 'live'
  }
  return 'test'
}

function getStoredValue(key: string): string {
  if (typeof window === 'undefined') return ''

  const item = localStorage.getItem(key)
  if (!item) return ''

  try {
    // useLocalStorage stores values as JSON strings (e.g. "\"value\"")
    return JSON.parse(item)
  } catch {
    // Fallback if value was stored as raw string
    return item
  }
}

export function getApiCredentials(): ApiCredentials {
  const secretKey = getStoredValue('xmoney-secret-key')
  const isLive = getEnvironmentFromSecretKey(secretKey) === 'live'
  return {
    siteId: getStoredValue('xmoney-site-id'),
    publicKey: getStoredValue('xmoney-public-key'),
    secretKey: secretKey,
    apiKey: extractTokenFromSecretKey(secretKey),
    isLive: isLive,
  }
}
