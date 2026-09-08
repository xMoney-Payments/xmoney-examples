import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import {
  Check,
  CreditCard,
  Loader2,
  Lock,
  MousePointerClick,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TwoColumnLayout, type CodeTab } from '@/components/two-column-layout'
import { PaymentFormSkeleton } from '@/components/payment-form-skeleton'
import {
  PaymentChangeSummary,
  resolvePaymentChangeLabel,
} from '@/components/payment-change-summary'
import { PaymentResultCard } from '@/components/payment-result-card'
import { PreviewShell } from '@/components/preview-shell'
import { CardBrandBadge } from '@/components/card-brand-badge'
import { assertXMoneyLoaded, createOrder } from '@/lib/create-order'
import { createSdkLogEvent, type SdkLogEvent } from '@/lib/sdk-events'
import type {
  PaymentCardConfig,
  PaymentCardInstance,
} from '@/types/xmoney-sdk/payment-card-sdk.types'
import type { PaymentChangeEvent } from '@/types/xmoney-sdk/sdk-base.types'
import type { TransactionDetails } from '@/types/checkout.types'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/examples/custom-cta')({
  component: CustomCtaPage,
})

const PRODUCT = {
  name: 'Pro Plan',
  description:
    'Unlimited projects, priority support, and advanced analytics for your team.',
  price: 42,
  currency: 'EUR',
  period: 'month',
  features: [
    'Unlimited projects & team members',
    'Priority email & chat support',
    'Advanced analytics & exports',
  ],
}

const PAYMENT_CARD_APPEARANCE = {
  theme: 'custom' as const,
  variables: {
    colorPrimary: '#7c3aed',
    colorDanger: '#dc2626',
    colorBackground: '#ffffff',
    colorText: '#111827',
    colorTextSecondary: '#6b7280',
    colorBorder: '#e5e7eb',
    colorBorderFocus: '#7c3aed',
    colorTextPlaceholder: '#9ca3af',
    borderRadius: '10px',
  },
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

function CustomCtaPage() {
  const [loading, setLoading] = useState(true)
  const [isSdkReady, setIsSdkReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [events, setEvents] = useState<SdkLogEvent[]>([])
  const [paymentChange, setPaymentChange] =
    useState<PaymentChangeEvent | null>(null)
  const [sessionId, setSessionId] = useState(0)
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [initData, setInitData] = useState<{
    publicKey: string
    payload: string
    checksum: string
  } | null>(null)
  const sdkRef = useRef<PaymentCardInstance | null>(null)

  const logEvent = (name: SdkLogEvent['name'], payload?: unknown) => {
    setEvents((prev) => [...prev, createSdkLogEvent(name, payload)])
  }

  const restart = () => {
    setTransaction(null)
    setPaymentError(null)
    setPaymentChange(null)
    setError(null)
    setIsSdkReady(false)
    setIsValid(false)
    setSessionId((n) => n + 1)
  }

  const subscribeFallback = `Subscribe for ${formatMoney(PRODUCT.price, PRODUCT.currency)}`

  const ctaLabel = resolvePaymentChangeLabel({
    paymentChange,
    fallbackLabel: subscribeFallback,
    amount: PRODUCT.price,
    currency: PRODUCT.currency,
    action: 'subscribe',
    preferMerchantLabel: true,
  })

  const handleValidate = async () => {
    const result = await sdkRef.current?.validate()
    logEvent('onValidation', result)
    if (result) setIsValid(result.isValid)
    return result
  }

  const handleSubscribe = async () => {
    const result = await handleValidate()
    if (result?.isValid) {
      sdkRef.current?.submit()
    }
  }

  useEffect(() => {
    let mounted = true
    let instance: PaymentCardInstance | null = null

    const init = async () => {
      setLoading(true)
      setIsSdkReady(false)
      setError(null)
      setPaymentChange(null)
      setIsValid(false)
      try {
        const data = await createOrder({
          amount: PRODUCT.price,
          currency: PRODUCT.currency,
          description: `${PRODUCT.name} subscription`,
          orderType: 'recurring',
          intervalType: 'month',
          intervalValue: 1,
        })
        if (!mounted) return
        setInitData(data)
        assertXMoneyLoaded()
        const container = document.getElementById('custom-cta-card')
        if (!container) return
        container.innerHTML = ''
        const config: PaymentCardConfig = {
          container: 'custom-cta-card',
          publicKey: data.publicKey,
          orderPayload: data.payload,
          orderChecksum: data.checksum,
          card: {
            submitButton: { visible: false, type: 'subscribe' },
            validationMode: 'onChange',
          },
          options: {
            appearance: PAYMENT_CARD_APPEARANCE,
          },
          onReady: () => {
            if (mounted) {
              setLoading(false)
              setIsSdkReady(true)
            }
            logEvent('onReady')
          },
          onValidation: (event) => {
            logEvent('onValidation', event)
            if (mounted) setIsValid(event.isValid)
          },
          onPaymentChange: (event) => {
            logEvent('onPaymentChange', event)
            if (mounted) setPaymentChange(event)
          },
          onPaymentProcessing: (processing) => {
            logEvent('onPaymentProcessing', { isProcessing: processing })
            if (mounted) setIsProcessing(processing)
          },
          onError: (err) => {
            logEvent('onError', err)
            if (mounted) {
              setLoading(false)
              setPaymentError(
                typeof err === 'string' ? err : err.message || 'Payment failed'
              )
            }
          },
          onPaymentComplete: (txn) => {
            logEvent('onPaymentComplete', txn)
            if (mounted) setTransaction(txn)
          },
        }
        instance = await window.XMoney.paymentCard(config)
        sdkRef.current = instance
      } catch (err) {
        if (mounted) {
          setLoading(false)
          setError(err instanceof Error ? err.message : 'Failed to init')
        }
      }
    }

    init()
    return () => {
      mounted = false
      instance?.destroy()
      sdkRef.current = null
      setIsSdkReady(false)
    }
  }, [sessionId])

  const codeTabs: CodeTab[] = [
    {
      value: 'client',
      label: 'custom-cta.tsx',
      language: 'javascript',
      content: `// Create a recurring order on your server (type: 'recurring', intervalType, intervalValue)
const card = await window.XMoney.paymentCard({
  container: 'card',
  publicKey: '${initData?.publicKey || '<PUBLIC_KEY>'}',
  orderPayload: '${initData?.payload ? initData.payload.slice(0, 24) + '...' : '<PAYLOAD>'}',
  orderChecksum: '${initData?.checksum ? initData.checksum.slice(0, 24) + '...' : '<CHECKSUM>'}',
  card: { submitButton: { visible: false, type: 'subscribe' } },
  onReady: () => setIsSdkReady(true),
  onPaymentChange: (event) => {
    // Prefer merchant subscribe label when SDK returns generic "Pay…"
    setPaymentChange(event)
    setCtaLabel(resolvePaymentChangeLabel({
      paymentChange: event,
      fallbackLabel: 'Subscribe for €42.00',
      action: 'subscribe',
      preferMerchantLabel: true,
    }))
  },
  onValidation: (event) => setCanPay(event.isValid),
})

async function onSubscribeClick() {
  const result = await card.validate()
  if (result.isValid) card.submit()
}`,
    },
    {
      value: 'server',
      label: 'api.ts',
      language: 'typescript',
      content: `const orderData = {
  publicKey: '<PUBLIC_KEY>',
  customer: { identifier: 'customer-123', /* … */ },
  order: {
    orderId: 'order-' + Date.now(),
    description: 'Pro Plan subscription',
    type: 'recurring',
    amount: ${PRODUCT.price},
    currency: '${PRODUCT.currency}',
    intervalType: 'month',
    intervalValue: 1,
  },
  cardTransactionMode: 'authAndCapture',
  backUrl: 'https://mysite.com/return',
}

const payload = getBase64JsonRequest(orderData)
const checksum = getBase64Checksum(orderData, apiKey)`,
    },
  ]

  if (transaction || paymentError) {
    return (
      <TwoColumnLayout
        title='Custom Checkout CTA'
        icon={<MousePointerClick className='h-4 w-4' />}
        onRefresh={restart}
        events={events}
        onClearEvents={() => setEvents([])}
        codeTabs={codeTabs}
      >
        <PreviewShell>
          <div className='flex min-h-[500px] items-center justify-center'>
            <PaymentResultCard
              result={transaction}
              variant={transaction ? 'success' : 'error'}
              errorMessage={paymentError ?? undefined}
              onRestart={restart}
            />
          </div>
        </PreviewShell>
      </TwoColumnLayout>
    )
  }

  return (
    <TwoColumnLayout
      title='Custom Checkout CTA'
      icon={<MousePointerClick className='h-4 w-4' />}
      loading={loading}
      onRefresh={restart}
      events={events}
      onClearEvents={() => setEvents([])}
      codeTabs={codeTabs}
    >
      <PreviewShell>
        <div className='grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:items-start'>
          {/* Plan summary */}
          <div
            className='overflow-hidden rounded-lg border bg-white shadow-[0_8px_40px_rgba(22,20,26,0.10)] sm:rounded-xl md:rounded-2xl'
          >
            <div className='p-4 sm:p-6 md:p-8'>
              <span
                className='inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary'
              >
                <Sparkles className='h-3.5 w-3.5' />
                Most popular
              </span>

              <h2 className='mt-4 text-2xl font-bold tracking-tight text-slate-900'>
                {PRODUCT.name}
              </h2>
              <p className='mt-2 text-sm leading-relaxed text-slate-600'>
                {PRODUCT.description}
              </p>

              <div className='mt-6 flex items-baseline gap-1.5'>
                <span className='text-4xl font-bold tracking-tight text-slate-900'>
                  {formatMoney(PRODUCT.price, PRODUCT.currency)}
                </span>
                <span className='text-sm text-slate-500'>/ {PRODUCT.period}</span>
              </div>

              <ul className='mt-8 space-y-3'>
                {PRODUCT.features.map((feature) => (
                  <li key={feature} className='flex items-start gap-3'>
                    <span
                      className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10'
                    >
                      <Check className='h-3 w-3 text-primary' />
                    </span>
                    <span className='text-sm text-slate-700'>{feature}</span>
                  </li>
                ))}
              </ul>

              <p className='mt-8 border-t border-slate-100 pt-6 text-xs text-slate-500'>
                Cancel anytime · No hidden fees
              </p>
            </div>
          </div>

          {/* Payment + custom CTA */}
          <div
            className='overflow-hidden rounded-lg border bg-white shadow-[0_8px_40px_rgba(22,20,26,0.10)] sm:rounded-xl md:rounded-2xl'
          >
            <div
              className='border-b bg-gradient-to-r from-primary/[0.06] to-transparent px-4 py-5 sm:px-6'
            >
              <div className='flex items-center gap-3'>
                <div
                  className='flex h-9 w-9 items-center justify-center rounded-full bg-primary/10'
                >
                  <CreditCard className='h-4 w-4 text-primary' />
                </div>
                <div>
                  <h3 className='text-base font-semibold leading-none'>
                    Payment details
                  </h3>
                  <p className='mt-1.5 text-sm text-muted-foreground'>
                    Enter your card to start your subscription
                  </p>
                </div>
              </div>
            </div>

            <div className='space-y-5 px-4 pb-6 pt-6 sm:px-6 sm:pb-8'>
              {error && (
                <p className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'>
                  {error}
                </p>
              )}

              <div className='relative min-h-[220px]'>
                {!isSdkReady && <PaymentFormSkeleton showSubmitRow={false} />}
                <div
                  id='custom-cta-card'
                  className={cn(!isSdkReady && 'hidden')}
                />
              </div>

              <div className='space-y-4'>
                <div className='rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3'>
                  <PaymentChangeSummary
                    paymentChange={paymentChange}
                    amount={PRODUCT.price}
                    currency={PRODUCT.currency}
                    action='subscribe'
                    preferMerchantLabel
                    fallbackLabel={
                      isSdkReady ? subscribeFallback : 'Loading payment form…'
                    }
                    compact
                  />
                  <p className='mt-1.5 text-xs text-slate-500'>
                    Recurring billing · every month
                  </p>
                </div>

                <Button
                  className='h-12 w-full bg-gradient-to-r from-primary to-purple-600 text-base font-semibold shadow-md hover:from-primary/90 hover:to-purple-600/90 hover:shadow-lg'
                  disabled={!isSdkReady || isProcessing}
                  onClick={handleSubscribe}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Processing…
                    </>
                  ) : (
                    ctaLabel
                  )}
                </Button>

                <p className='text-center text-xs text-slate-500'>
                  You won&apos;t be charged until you confirm
                </p>

                <div className='flex items-center justify-center gap-3'>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                      !isSdkReady
                        ? 'bg-slate-100 text-slate-500'
                        : isValid
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        !isSdkReady
                          ? 'bg-slate-400'
                          : isValid
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                      )}
                    />
                    {isSdkReady
                      ? isValid
                        ? 'Card details look valid'
                        : 'Complete card details to continue'
                      : 'Waiting for payment form…'}
                  </span>

                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-auto px-2 py-1 text-xs text-slate-500 hover:text-slate-700'
                    disabled={!isSdkReady || isProcessing}
                    onClick={handleValidate}
                  >
                    Validate
                  </Button>
                </div>

                <div
                  className='flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-400'
                >
                  <span className='flex items-center gap-1.5'>
                    <Lock className='h-3 w-3' />
                    Secured by xMoney
                  </span>
                  <span className='text-slate-300'>·</span>
                  <span className='flex items-center gap-1.5'>
                    <CardBrandBadge type='visa' />
                    <CardBrandBadge type='mastercard' />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PreviewShell>
    </TwoColumnLayout>
  )
}
