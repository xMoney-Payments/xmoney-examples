import type { PaymentChangeEvent } from '@/types/xmoney-sdk/sdk-base.types'
import { cn } from '@/lib/utils'

export type PaymentAction = 'pay' | 'subscribe' | 'donate' | 'book' | 'buy'

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

function isGenericPayLabel(label: string) {
  return /^pay\b/i.test(label.trim())
}

export function resolvePaymentChangeLabel({
  paymentChange,
  fallbackLabel,
  amount,
  currency = 'EUR',
  action = 'pay',
  preferMerchantLabel = false,
}: {
  paymentChange: PaymentChangeEvent | null
  fallbackLabel: string
  amount?: number
  currency?: string
  action?: PaymentAction
  preferMerchantLabel?: boolean
}) {
  const sdkLabel = paymentChange?.button.label
  const installments = paymentChange?.installments
  const defaultFallback =
    fallbackLabel ||
    (amount !== undefined ? `Pay ${formatAmount(amount, currency)}` : 'Pay now')

  if (installments?.available) {
    const installmentLabel = formatInstallmentLine(
      action,
      installments.count,
      installments.formattedAmount
    )
    if (sdkLabel && (!preferMerchantLabel || !isGenericPayLabel(sdkLabel))) {
      return sdkLabel
    }
    return installmentLabel
  }

  if (
    preferMerchantLabel &&
    action === 'subscribe' &&
    sdkLabel &&
    isGenericPayLabel(sdkLabel)
  ) {
    return defaultFallback
  }

  return sdkLabel ?? defaultFallback
}

function formatInstallmentLine(
  action: PaymentAction,
  count: number,
  formattedAmount: string
) {
  switch (action) {
    case 'subscribe':
      return `Subscribe in ${count} payments of ${formattedAmount}`
    case 'donate':
      return `Donate in ${count} payments of ${formattedAmount}`
    case 'book':
      return `Book in ${count} payments of ${formattedAmount}`
    case 'buy':
      return `Buy in ${count} payments of ${formattedAmount}`
    default:
      return `or ${count} payments of ${formattedAmount}`
  }
}

export function PaymentChangeSummary({
  paymentChange,
  fallbackLabel,
  amount,
  currency = 'EUR',
  className,
  compact = false,
  action = 'pay',
  preferMerchantLabel = false,
}: {
  paymentChange: PaymentChangeEvent | null
  fallbackLabel: string
  amount?: number
  currency?: string
  className?: string
  compact?: boolean
  action?: PaymentAction
  preferMerchantLabel?: boolean
}) {
  const installments = paymentChange?.installments
  const primaryLabel = resolvePaymentChangeLabel({
    paymentChange,
    fallbackLabel,
    amount,
    currency,
    action,
    preferMerchantLabel,
  })
  const installmentLabel =
    installments?.available
      ? formatInstallmentLine(
          action,
          installments.count,
          installments.formattedAmount
        )
      : null

  return (
    <div className={cn('space-y-1', className)}>
      <p
        className={cn(
          'font-semibold text-slate-900',
          compact ? 'text-sm' : 'text-base'
        )}
      >
        {primaryLabel}
      </p>
      {installmentLabel && primaryLabel !== installmentLabel && (
        <p className='text-xs text-slate-500'>{installmentLabel}</p>
      )}
    </div>
  )
}
