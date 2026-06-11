/**
 * Helper to retrieve xMoney API credentials.
 * Site ID and public key are stored in localStorage; the secret key is stored
 * in sessionStorage so it is cleared when the browser session ends.
 */

import {
  DEFAULT_PUBLIC_KEY,
  DEFAULT_SECRET_KEY,
  DEFAULT_SITE_ID,
} from './defaults'

const TEST_ENV = 'test'
const LIVE_ENV = 'live'
const SECRET_KEY_REGEXP = new RegExp(`^sk_(${TEST_ENV}|${LIVE_ENV})_(.+)$`)

interface ApiCredentials {
  siteId: string
  publicKey: string
  secretKey: string
  apiKey: string
  isLive: boolean
}

function extractTokenFromSecretKey(secretKey: string): string {
  const match = secretKey.match(SECRET_KEY_REGEXP)
  return match ? match[2] : secretKey
}

export function getEnvironmentFromSecretKey(
  secretKey: string
): 'test' | 'live' {
  const match = secretKey.match(SECRET_KEY_REGEXP)
  if (match && match[1] === LIVE_ENV) {
    return 'live'
  }
  return 'test'
}

function getStoredValue(
  key: string,
  storage: 'local' | 'session' = 'local',
  fallback = ''
): string {
  if (typeof window === 'undefined') return fallback

  const store = storage === 'session' ? sessionStorage : localStorage
  const item = store.getItem(key)
  if (!item) return fallback

  try {
    return JSON.parse(item) || fallback
  } catch {
    return item || fallback
  }
}

export function maskSecretKey(secretKey: string): string {
  if (!secretKey) return ''

  const match = secretKey.match(SECRET_KEY_REGEXP)
  if (!match) return secretKey

  const prefix = `sk_${match[1]}_`
  const token = match[2]

  if (token.length <= 6) {
    return `${prefix}${token[0]}${'*'.repeat(token.length - 2)}${token[token.length - 1]}`
  }

  return `${prefix}${token.slice(0, 3)}****${token.slice(-3)}`
}

export function getApiCredentials(): ApiCredentials {
  const publicKey = getStoredValue(
    'xmoney-public-key',
    'local',
    DEFAULT_PUBLIC_KEY
  )

  // Only fall back to the default secret key when the public key is the default
  // one. The secret key lives in sessionStorage (cleared on tab close) while the
  // public key persists in localStorage, so a returning user with their own
  // public key must provide a matching secret key rather than inheriting ours.
  const isDefaultPublicKey =
    !!DEFAULT_PUBLIC_KEY && publicKey === DEFAULT_PUBLIC_KEY
  const secretKey = getStoredValue(
    'xmoney-secret-key',
    'session',
    isDefaultPublicKey ? DEFAULT_SECRET_KEY : ''
  )

  const isLive = getEnvironmentFromSecretKey(secretKey) === 'live'
  return {
    siteId: getStoredValue('xmoney-site-id', 'local', DEFAULT_SITE_ID),
    publicKey: publicKey,
    secretKey: secretKey,
    apiKey: extractTokenFromSecretKey(secretKey),
    isLive: isLive,
  }
}
