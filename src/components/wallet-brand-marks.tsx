import { cn } from '@/lib/utils'

/**
 * Google Pay mark for accordion headers only.
 * Official asset from Google CDN, stored locally for reliability.
 * @see https://developers.google.com/pay/api/web/guides/brand-guidelines
 */
export function GooglePayMark({ className }: { className?: string }) {
  return (
    <img
      src='/wallet-marks/google-pay.svg'
      alt='Google Pay'
      className={cn('h-6 w-auto shrink-0 object-contain object-left', className)}
      draggable={false}
    />
  )
}

/**
 * Apple Pay mark for accordion headers only.
 * Official Apple Pay wordmark asset.
 * @see https://developer.apple.com/apple-pay/marketing/
 */
export function ApplePayMark({ className }: { className?: string }) {
  return (
    <img
      src='/wallet-marks/apple-pay.svg'
      alt='Apple Pay'
      className={cn('h-6 w-auto shrink-0 object-contain object-left', className)}
      draggable={false}
    />
  )
}
