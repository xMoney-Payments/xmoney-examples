export const SDK_VERSION_STORAGE_KEY = 'xmoney-sdk-version'

export const DEFAULT_SDK_VERSION = 'v2'

export type SdkVersion = {
  value: string
  label: string
}

export const SDK_VERSIONS: SdkVersion[] = [
  { value: 'v2', label: 'Latest LTS' },
  { value: 'v2.0.0', label: 'All Parameters present' },
  { value: 'v2.0.1', label: 'No Parameters present' },
  { value: 'v2.0.2', label: 'without publickey-credentials-create' },
  { value: 'v2.0.3', label: 'without publickey-credentials-get' },
  { value: 'v2.0.4', label: 'without allow-popups' },
  { value: 'v2.0.5', label: 'without allow-scripts' },
  { value: 'v2.0.6', label: 'without allow-same-origin' },
  { value: 'v2.0.7', label: 'without allow-forms' },
  { value: 'v2.0.8', label: 'without allow-pointer-lock' },
  { value: 'v2.0.9', label: 'without payment' },
]

export function getSdkScriptUrl(version: string) {
  return `https://secure.xmoney.com/sdk/${version}/xmoney.js`
}
