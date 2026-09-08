import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Check,
  Gem,
  Loader2,
  Lock,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TwoColumnLayout, type CodeTab } from '@/components/two-column-layout'
import { CondensedCardFormSlot, WalletPayButtonSlot } from '@/components/payment-form-skeleton'
import { PaymentResultCard } from '@/components/payment-result-card'
import { resolvePaymentChangeLabel } from '@/components/payment-change-summary'
import { ApplePayMark, GooglePayMark } from '@/components/wallet-brand-marks'
import { assertXMoneyLoaded, createOrder } from '@/lib/create-order'
import { createSdkLogEvent, type SdkLogEvent } from '@/lib/sdk-events'
import {
  JEWELRY_EMBEDDED_APPEARANCE,
  JEWELRY_WALLET_APPEARANCE,
} from '@/lib/jewelry-appearance'
import type { TransactionDetails } from '@/types/checkout.types'
import type { PaymentChangeEvent } from '@/types/xmoney-sdk/sdk-base.types'
import type { PaymentCardInstance } from '@/types/xmoney-sdk/payment-card-sdk.types'
import type { GooglePayInstance } from '@/types/xmoney-sdk/google-pay-sdk.types'
import type { ApplePayInstance } from '@/types/xmoney-sdk/apple-pay-sdk.types'
import type { PaymentMethodCapabilities } from '@/types/xmoney-sdk/payment-method-capabilities.types'

export const Route = createFileRoute(
  '/embeddable-components/jewelry-checkout'
)({
  component: JewelryCheckoutPage,
})

const STEPS = ['Cart', 'Delivery', 'Payment'] as const
const UPDATE_ORDER_DEBOUNCE_MS = 500

type PaymentMethod = 'card' | 'google-pay' | 'apple-pay'

interface CartItem {
  id: string
  name: string
  description: string
  quantity: number
  price: number
  image?: string
}

const INITIAL_ITEMS: CartItem[] = [
  {
    id: '1',
    name: 'Diamond Solitaire Ring',
    description: '18K white gold / Size 6',
    quantity: 1,
    price: 2450.0,
    image:
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: '2',
    name: 'Pearl Drop Earrings',
    description: 'Freshwater / Pair',
    quantity: 1,
    price: 890.0,
    image:
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: '3',
    name: 'Sapphire Pendant',
    description: '14K gold chain',
    quantity: 1,
    price: 1680.0,
    image:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop&auto=format',
  },
]

const SHIPPING_OPTIONS = {
  standard: { label: 'Standard', detail: '3–5 business days', fee: 5 },
  express: { label: 'Express', detail: '1–2 business days', fee: 12 },
} as const

type ShippingMethod = keyof typeof SHIPPING_OPTIONS

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function JewelryStyles() {
  return (
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Playfair+Display:wght@500;600;700&display=swap');
        .jewelry-body { font-family: 'DM Sans', sans-serif; }
        .jewelry-serif { font-family: 'Playfair Display', serif; }
        #jewelry-checkout-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
      `}
    </style>
  )
}

function JewelryPreview({ children }: { children: ReactNode }) {
  return (
    <div className='jewelry-body relative min-h-full overflow-x-hidden bg-[#FAFBFF]'>
      <div
        className='pointer-events-none absolute right-0 top-0 h-64 w-64 bg-[radial-gradient(circle_at_top_right,rgba(18,10,143,0.07),transparent_65%)] sm:h-[480px] sm:w-[480px]'
        aria-hidden
      />
      <JewelryStyles />
      {children}
    </div>
  )
}

function JewelryHeader({ itemCount }: { itemCount: number }) {
  return (
    <header className='relative bg-[#0D1B4B] text-white'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4'>
        <div>
          <div className='flex items-center gap-2'>
            <Gem className='h-4 w-4 text-[#C9A962]' strokeWidth={1.5} />
            <span className='text-xs font-semibold tracking-[0.22em] sm:text-sm sm:tracking-[0.28em]'>
              LUMIÈRE
            </span>
          </div>
          <div className='mt-1 h-px w-8 bg-[#C9A962]/80' />
        </div>
        <div className='relative flex items-center gap-1.5 text-white/90 sm:gap-2'>
          <ShoppingBag className='h-4 w-4' strokeWidth={1.5} />
          <span className='hidden text-xs font-medium tracking-wide sm:inline'>Bag</span>
          <span className='flex h-5 min-w-5 items-center justify-center rounded bg-[#C9A962] px-1.5 text-[10px] font-semibold text-[#0D1B4B]'>
            {itemCount}
          </span>
        </div>
      </div>
    </header>
  )
}

function CheckoutStepRail({
  step,
  confirmation = false,
}: {
  step: number
  confirmation?: boolean
}) {
  const activeStep = confirmation ? STEPS.length : step

  return (
    <nav
      className='-mx-4 mb-6 flex gap-4 overflow-x-auto border-b border-[#E8EAF6] px-4 pb-0 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:mb-8 sm:gap-6 sm:px-0 [&::-webkit-scrollbar]:hidden'
      aria-label='Checkout progress'
    >
      {STEPS.map((label, i) => {
        const isComplete = i < activeStep
        const isActive = i === activeStep && !confirmation

        return (
          <div
            key={label}
            className={cn(
              'flex shrink-0 items-center gap-1.5 border-b-2 pb-3 text-xs transition-colors sm:gap-2 sm:text-sm',
              isActive
                ? 'border-[#120A8F] text-[#120A8F]'
                : isComplete
                  ? 'border-transparent text-[#3949AB]'
                  : 'border-transparent text-[#9FA8DA]'
            )}
          >
            <span className='font-mono text-xs tabular-nums'>
              {String(i + 1).padStart(2, '0')}
            </span>
            {isComplete && !isActive ? (
              <Check className='h-3.5 w-3.5 text-[#C9A962]' strokeWidth={2.5} />
            ) : null}
            <span className={cn('font-medium', isActive && 'font-semibold')}>{label}</span>
          </div>
        )
      })}
      {confirmation && (
        <div className='flex shrink-0 items-center gap-2 border-b-2 border-[#120A8F] pb-3 text-sm font-semibold text-[#120A8F]'>
          Confirmation
        </div>
      )}
    </nav>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className='mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7986CB]'>
      {children}
    </p>
  )
}

function JewelryPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[#E8EAF6] bg-white p-4 shadow-sm shadow-[#120A8F]/[0.03] sm:p-6',
        className
      )}
    >
      {children}
    </div>
  )
}

function JewelryPrimaryButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-lg bg-[#120A8F] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#283593] disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:text-sm',
        className
      )}
    >
      {children}
    </button>
  )
}

function JewelryGhostButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className='text-sm font-medium text-[#5C6BC0] transition-colors hover:text-[#120A8F] disabled:opacity-50'
    >
      {children}
    </button>
  )
}

function jewelryInputClass() {
  return 'rounded-none border-0 border-b border-[#C5CAE9] bg-transparent px-0 text-[#0D1B4B] shadow-none placeholder:text-[#9FA8DA] focus-visible:border-[#120A8F] focus-visible:ring-0'
}

function OrderSummaryRail({
  items,
  subtotal,
  shippingFee,
  total,
  shipping,
  step,
  isUpdatingOrder,
  isProcessing,
}: {
  items: CartItem[]
  subtotal: number
  shippingFee: number
  total: number
  shipping: { fullName: string; address: string; city: string; postalCode: string }
  step: number
  isUpdatingOrder: boolean
  isProcessing: boolean
}) {
  return (
    <aside className='min-w-0 lg:sticky lg:top-6 lg:self-start'>
      <JewelryPanel>
        <SectionLabel>Order summary</SectionLabel>
        <div className='max-h-64 space-y-4 overflow-y-auto'>
          {items.map((item) => (
            <div key={item.id} className='flex gap-3'>
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className='h-16 w-14 shrink-0 rounded object-cover'
                />
              )}
              <div className='min-w-0 flex-1'>
                <p className='jewelry-serif truncate text-sm font-medium text-[#0D1B4B]'>
                  {item.name}
                </p>
                <p className='text-xs text-[#5C6BC0]'>{item.description}</p>
                <p className='mt-0.5 text-xs text-[#7986CB]'>Qty {item.quantity}</p>
              </div>
              <p className='shrink-0 text-sm font-medium text-[#0D1B4B]'>
                {formatMoney(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className='mt-5 space-y-2 border-t border-[#E8EAF6] pt-4 text-sm'>
          <div className='flex justify-between text-[#5C6BC0]'>
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          {step >= 1 && (
            <div className='flex justify-between text-[#5C6BC0]'>
              <span>Shipping</span>
              <span>{formatMoney(shippingFee)}</span>
            </div>
          )}
          <div className='flex justify-between border-t border-[#E8EAF6] pt-3'>
            <span className='font-semibold text-[#0D1B4B]'>Total</span>
            <span className='jewelry-serif flex items-center gap-2 text-lg font-semibold text-[#120A8F]'>
              {isUpdatingOrder && <Loader2 className='h-4 w-4 animate-spin' />}
              {formatMoney(step >= 1 ? total : subtotal)}
            </span>
          </div>
        </div>

        {step >= 1 && (
          <div className='mt-4 border-t border-[#E8EAF6] pt-4'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7986CB]'>
              Ship to
            </p>
            <p className='mt-1 text-sm leading-relaxed text-[#0D1B4B]'>
              {shipping.fullName}
              <br />
              {shipping.address}
              <br />
              {shipping.postalCode} {shipping.city}
            </p>
          </div>
        )}

        {isProcessing && (
          <p className='mt-4 flex items-center gap-2 text-xs font-medium text-[#283593]'>
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
            Processing payment…
          </p>
        )}
      </JewelryPanel>
    </aside>
  )
}

function PaymentMethodTabs({
  activeMethod,
  onChange,
  capabilities,
}: {
  activeMethod: PaymentMethod
  onChange: (method: PaymentMethod) => void
  capabilities: PaymentMethodCapabilities | null
}) {
  const tabs: { id: PaymentMethod; label: ReactNode }[] = [
    { id: 'card', label: 'Card' },
  ]
  if (capabilities?.googlePay?.supported !== false) {
    tabs.push({ id: 'google-pay', label: <GooglePayMark className='h-5' /> })
  }
  if (capabilities?.applePay?.supported !== false) {
    tabs.push({ id: 'apple-pay', label: <ApplePayMark className='h-5' /> })
  }

  return (
    <div className='flex gap-1 overflow-x-auto rounded-lg border border-[#E8EAF6] bg-[#F5F7FF] p-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden'>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type='button'
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex min-h-10 shrink-0 items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors sm:min-w-0 sm:flex-1 sm:px-4',
            activeMethod === tab.id
              ? 'bg-white text-[#120A8F] shadow-sm'
              : 'text-[#5C6BC0] hover:text-[#283593]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function PaymentActionZone({
  activeMethod,
  isActiveMethodReady,
  isProcessing,
  isUpdatingOrder,
  cardButtonLabel,
  onPlaceOrder,
  isGooglePayReady,
  isApplePayReady,
}: {
  activeMethod: PaymentMethod
  isActiveMethodReady: boolean
  isProcessing: boolean
  isUpdatingOrder: boolean
  cardButtonLabel: string
  onPlaceOrder: () => void
  isGooglePayReady: boolean
  isApplePayReady: boolean
}) {
  if (activeMethod === 'card') {
    return (
      <div className='mt-6'>
        {!isActiveMethodReady ? (
          <div className='h-11 w-full animate-pulse rounded-lg bg-[#C5CAE9]/50' />
        ) : (
          <JewelryPrimaryButton
            className='h-11 w-full px-3 text-center text-xs leading-snug sm:text-sm'
            disabled={!isActiveMethodReady || isProcessing || isUpdatingOrder}
            onClick={onPlaceOrder}
          >
            {isProcessing ? (
              <span className='flex items-center justify-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Processing…
              </span>
            ) : (
              cardButtonLabel
            )}
          </JewelryPrimaryButton>
        )}
      </div>
    )
  }

  if (activeMethod === 'google-pay') {
    return (
      <div className='mt-6'>
        <WalletPayButtonSlot
          containerId='jewelry-checkout-google-pay'
          isReady={isGooglePayReady}
          skeletonClassName='bg-[#E8EAF6]'
        />
      </div>
    )
  }

  return (
    <div className='mt-6'>
      <WalletPayButtonSlot
        containerId='jewelry-checkout-apple-pay'
        isReady={isApplePayReady}
        skeletonClassName='bg-[#E8EAF6]'
      />
    </div>
  )
}

function JewelryCheckoutPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<SdkLogEvent[]>([])
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard')
  const [shipping, setShipping] = useState({
    fullName: 'John Doe',
    address: 'Str. Example 12',
    city: 'Bucharest',
    postalCode: '010101',
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false)
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('card')
  const [sessionId, setSessionId] = useState(0)
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const [intentData, setIntentData] = useState<{
    publicKey: string
    payload: string
    checksum: string
  } | null>(null)
  const [capabilities, setCapabilities] = useState<PaymentMethodCapabilities | null>(null)
  const [isCardReady, setIsCardReady] = useState(false)
  const [isGooglePayReady, setIsGooglePayReady] = useState(false)
  const [isApplePayReady, setIsApplePayReady] = useState(false)
  const [paymentChange, setPaymentChange] = useState<PaymentChangeEvent | null>(
    null
  )

  const paymentCardRef = useRef<PaymentCardInstance | null>(null)
  const googlePayRef = useRef<GooglePayInstance | null>(null)
  const applePayRef = useRef<ApplePayInstance | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSyncedAmountRef = useRef<number | null>(null)

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )
  const shippingFee = SHIPPING_OPTIONS[shippingMethod].fee
  const total = subtotal + shippingFee
  const itemCount = items.reduce((n, item) => n + item.quantity, 0)

  const isActiveMethodReady =
    activeMethod === 'card'
      ? isCardReady
      : activeMethod === 'google-pay'
        ? isGooglePayReady
        : isApplePayReady

  const cardButtonLabel = resolvePaymentChangeLabel({
    paymentChange,
    fallbackLabel: `Complete order · ${formatMoney(total)}`,
    amount: total,
    currency: 'EUR',
    action: 'buy',
  })

  const logEvent = (name: SdkLogEvent['name'], payload?: unknown) => {
    setEvents((prev) => [...prev, createSdkLogEvent(name, payload)])
  }

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    )
  }

  const destroySdkInstances = useCallback(() => {
    paymentCardRef.current?.destroy()
    paymentCardRef.current = null
    googlePayRef.current?.destroy()
    googlePayRef.current = null
    applePayRef.current?.destroy()
    applePayRef.current = null
    setIsCardReady(false)
    setIsGooglePayReady(false)
    setIsApplePayReady(false)
    setPaymentChange(null)
  }, [])

  const handlePaymentComplete = (result: TransactionDetails) => {
    logEvent('onPaymentComplete', result)
    setIsProcessing(false)
    setTransaction(result)
  }

  const handlePaymentError = (err: unknown) => {
    logEvent('onError', err)
    setIsProcessing(false)
    setPaymentError(
      typeof err === 'string'
        ? err
        : err instanceof Error
          ? err.message
          : 'Payment failed'
    )
  }

  const updateOrderAcrossInstances = async (amount: number) => {
    setIsUpdatingOrder(true)
    try {
      const next = await createOrder({
        amount,
        currency: 'EUR',
        description: `LUMIÈRE: ${items.map((i) => i.name).join(', ')} → ${shipping.city}`,
      })
      setIntentData(next)
      lastSyncedAmountRef.current = amount
      const orderUpdate = {
        orderPayload: next.payload,
        orderChecksum: next.checksum,
      }
      paymentCardRef.current?.updateOrder(orderUpdate)
      googlePayRef.current?.updateOrder(orderUpdate)
      applePayRef.current?.updateOrder(orderUpdate)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order')
    } finally {
      setIsUpdatingOrder(false)
    }
  }

  const restartOrder = () => {
    setStep(0)
    setItems(INITIAL_ITEMS.map((item) => ({ ...item })))
    setShippingMethod('standard')
    setShipping({
      fullName: 'John Doe',
      address: 'Str. Example 12',
      city: 'Bucharest',
      postalCode: '010101',
    })
    setTransaction(null)
    setPaymentError(null)
    setError(null)
    setActiveMethod('card')
    setIntentData(null)
    setPaymentChange(null)
    lastSyncedAmountRef.current = null
    destroySdkInstances()
    setSessionId((n) => n + 1)
  }

  useEffect(() => {
    if (step !== 2) {
      destroySdkInstances()
      return
    }

    let mounted = true

    const initPayment = async () => {
      setLoading(true)
      setError(null)
      try {
        assertXMoneyLoaded()
        const data = await createOrder({
          amount: total,
          currency: 'EUR',
          description: `LUMIÈRE: ${items.map((i) => i.name).join(', ')} → ${shipping.city}`,
        })
        if (!mounted) return
        setIntentData(data)
        lastSyncedAmountRef.current = total

        window.XMoney.getPaymentMethodCapabilities()
          .then((capabilityData) => {
            if (mounted) setCapabilities(capabilityData)
          })
          .catch(() => {})
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to init payment')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initPayment()

    return () => {
      mounted = false
      if (debounceRef.current) clearTimeout(debounceRef.current)
      destroySdkInstances()
    }
  }, [step, sessionId, destroySdkInstances])

  useEffect(() => {
    if (step !== 2 || !intentData || loading) return
    if (activeMethod !== 'card') {
      if (paymentCardRef.current) {
        paymentCardRef.current.destroy()
        paymentCardRef.current = null
        setIsCardReady(false)
        setPaymentChange(null)
      }
      return
    }
    if (paymentCardRef.current) return

    const container = document.getElementById('jewelry-checkout-card')
    if (!container) return
    container.innerHTML = ''

    window.XMoney.paymentCard({
      container: 'jewelry-checkout-card',
      publicKey: intentData.publicKey,
      orderPayload: intentData.payload,
      orderChecksum: intentData.checksum,
      card: {
        validationMode: 'onBlur',
        savedCards: { enabled: true, optInVisible: false },
        submitButton: { visible: false },
        inputs: { grouping: 'condensed' },
      },
      options: {
        locale: 'en-US',
        appearance: JEWELRY_EMBEDDED_APPEARANCE,
      },
      onReady: () => {
        setIsCardReady(true)
        logEvent('onReady', { method: 'card' })
      },
      onPaymentChange: (event) => {
        logEvent('onPaymentChange', event)
        setPaymentChange(event)
      },
      onPaymentProcessing: (processing: boolean) => {
        logEvent('onPaymentProcessing', { isProcessing: processing })
        setIsProcessing(processing)
      },
      onPaymentComplete: handlePaymentComplete,
      onError: handlePaymentError,
    })
      .then((instance) => {
        paymentCardRef.current = instance
      })
      .catch(handlePaymentError)
  }, [step, activeMethod, intentData, loading])

  useEffect(() => {
    if (step !== 2 || !intentData) return
    if (activeMethod !== 'google-pay') {
      if (googlePayRef.current) {
        googlePayRef.current.destroy()
        googlePayRef.current = null
        setIsGooglePayReady(false)
      }
      return
    }
    if (googlePayRef.current) return

    const container = document.getElementById('jewelry-checkout-google-pay')
    if (!container) return
    container.innerHTML = ''

    window.XMoney.googlePay({
      container: 'jewelry-checkout-google-pay',
      publicKey: intentData.publicKey,
      orderPayload: intentData.payload,
      orderChecksum: intentData.checksum,
      options: {
        locale: 'en-US',
        appearance: JEWELRY_WALLET_APPEARANCE.googlePay,
      },
      onReady: () => {
        setIsGooglePayReady(true)
        logEvent('onReady', { method: 'google-pay' })
      },
      onPaymentProcessing: (processing: boolean) => {
        logEvent('onPaymentProcessing', { isProcessing: processing })
        setIsProcessing(processing)
      },
      onPaymentComplete: handlePaymentComplete,
      onError: handlePaymentError,
    })
      .then((instance) => {
        googlePayRef.current = instance
      })
      .catch(handlePaymentError)
  }, [step, activeMethod, intentData])

  useEffect(() => {
    if (step !== 2 || !intentData) return
    if (activeMethod !== 'apple-pay') {
      if (applePayRef.current) {
        applePayRef.current.destroy()
        applePayRef.current = null
        setIsApplePayReady(false)
      }
      return
    }
    if (applePayRef.current) return

    const container = document.getElementById('jewelry-checkout-apple-pay')
    if (!container) return
    container.innerHTML = ''

    window.XMoney.applePay({
      container: 'jewelry-checkout-apple-pay',
      publicKey: intentData.publicKey,
      orderPayload: intentData.payload,
      orderChecksum: intentData.checksum,
      options: {
        locale: 'en-US',
        appearance: JEWELRY_WALLET_APPEARANCE.applePay,
      },
      onReady: () => {
        setIsApplePayReady(true)
        logEvent('onReady', { method: 'apple-pay' })
      },
      onPaymentProcessing: (processing: boolean) => {
        logEvent('onPaymentProcessing', { isProcessing: processing })
        setIsProcessing(processing)
      },
      onPaymentComplete: handlePaymentComplete,
      onError: handlePaymentError,
    })
      .then((instance) => {
        applePayRef.current = instance
      })
      .catch(handlePaymentError)
  }, [step, activeMethod, intentData])

  useEffect(() => {
    if (step !== 2 || !intentData) return
    if (
      lastSyncedAmountRef.current === null ||
      total === lastSyncedAmountRef.current
    )
      return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateOrderAcrossInstances(total)
    }, UPDATE_ORDER_DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [step, total, intentData])

  const placeOrder = async () => {
    const result = await paymentCardRef.current?.validate()
    logEvent('onValidation', result)
    if (result?.isValid) paymentCardRef.current?.submit()
  }

  const codeTabs: CodeTab[] = [
    {
      value: 'card',
      label: 'paymentCard.tsx',
      language: 'typescript',
      content: `const card = await window.XMoney.paymentCard({
  container: 'jewelry-checkout-card',
  publicKey: '<PUBLIC_KEY>',
  orderPayload: payload,
  orderChecksum: checksum,
  card: {
    savedCards: { enabled: true, optInVisible: false },
    submitButton: { visible: false },
    inputs: { grouping: 'condensed' },
  },
  options: {
    locale: 'en-US',
    appearance: {
      theme: 'custom',
      variables: { colorPrimary: '#120A8F', borderRadius: '8px' },
    },
  },
  onReady: () => setIsCardReady(true),
  onPaymentChange: (event) => setPaymentChange(event),
})

await card.updateOrder({ orderPayload, orderChecksum })
card.submit()`,
    },
    {
      value: 'google-pay',
      label: 'googlePay.tsx',
      language: 'typescript',
      content: `const gpay = await window.XMoney.googlePay({
  container: 'jewelry-checkout-google-pay',
  publicKey: '<PUBLIC_KEY>',
  orderPayload: payload,
  orderChecksum: checksum,
  options: {
    appearance: { color: 'black', type: 'pay', radius: 8 },
  },
})
await gpay.updateOrder({ orderPayload, orderChecksum })`,
    },
    {
      value: 'apple-pay',
      label: 'applePay.tsx',
      language: 'typescript',
      content: `const applePay = await window.XMoney.applePay({
  container: 'jewelry-checkout-apple-pay',
  publicKey: '<PUBLIC_KEY>',
  orderPayload: payload,
  orderChecksum: checksum,
  options: {
    appearance: { style: 'black', type: 'pay', radius: 8 },
  },
})
await applePay.updateOrder({ orderPayload, orderChecksum })`,
    },
  ]

  const layoutProps = {
    title: 'Jewelry Checkout',
    icon: <Gem className='h-4 w-4' />,
    onRefresh: restartOrder,
    events,
    onClearEvents: () => setEvents([]),
    codeTabs,
  }

  const summaryRail = (
    <OrderSummaryRail
      items={items}
      subtotal={subtotal}
      shippingFee={shippingFee}
      total={total}
      shipping={shipping}
      step={step}
      isUpdatingOrder={isUpdatingOrder}
      isProcessing={isProcessing}
    />
  )

  if (transaction || paymentError) {
    return (
      <TwoColumnLayout {...layoutProps}>
        <JewelryPreview>
          <JewelryHeader itemCount={itemCount} />
          <div className='relative mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8'>
            <CheckoutStepRail step={step} confirmation />
            <div className='grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-8'>
              <JewelryPanel className='mx-auto max-w-md lg:mx-0'>
                <PaymentResultCard
                  result={transaction}
                  variant={transaction ? 'success' : 'error'}
                  errorMessage={paymentError ?? undefined}
                  onRestart={restartOrder}
                />
              </JewelryPanel>
              {summaryRail}
            </div>
          </div>
        </JewelryPreview>
      </TwoColumnLayout>
    )
  }

  return (
    <TwoColumnLayout {...layoutProps} loading={loading && step === 2}>
      <JewelryPreview>
        <JewelryHeader itemCount={itemCount} />
        <div className='relative mx-auto max-w-6xl px-4 py-5 pb-8 sm:px-6 sm:py-8'>
          <CheckoutStepRail step={step} />

          <div className='grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-8'>
            <main className='min-w-0'>
              {step === 0 && (
                <JewelryPanel>
                  <SectionLabel>Your selection</SectionLabel>
                  <div className='space-y-0 divide-y divide-[#E8EAF6]'>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className='py-5 first:pt-0 last:pb-0 sm:grid sm:grid-cols-[120px_1fr_auto] sm:gap-5 sm:py-6'
                      >
                        <div className='flex gap-4 sm:contents'>
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className='h-20 w-20 shrink-0 rounded object-cover sm:aspect-square sm:h-auto sm:w-[120px]'
                            />
                          )}
                          <div className='min-w-0 flex-1 sm:flex sm:flex-col sm:justify-between'>
                            <div>
                              <p className='jewelry-serif text-base font-medium text-[#0D1B4B] sm:text-lg'>
                                {item.name}
                              </p>
                              <p className='mt-1 text-sm text-[#5C6BC0]'>{item.description}</p>
                              <p className='mt-2 text-sm text-[#7986CB]'>
                                {formatMoney(item.price)} each
                              </p>
                            </div>
                            <div className='mt-4 inline-flex items-center border border-[#E8EAF6] sm:mt-0'>
                              <button
                                type='button'
                                className='flex h-9 w-9 items-center justify-center text-[#120A8F] hover:bg-[#F5F7FF]'
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className='h-3.5 w-3.5' />
                              </button>
                              <span className='flex h-9 w-10 items-center justify-center border-x border-[#E8EAF6] text-sm font-medium tabular-nums'>
                                {item.quantity}
                              </span>
                              <button
                                type='button'
                                className='flex h-9 w-9 items-center justify-center text-[#120A8F] hover:bg-[#F5F7FF]'
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className='h-3.5 w-3.5' />
                              </button>
                            </div>
                          </div>
                          <p className='jewelry-serif shrink-0 self-start text-base font-semibold text-[#120A8F] sm:self-auto sm:text-lg'>
                            {formatMoney(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='mt-6 flex flex-col-reverse gap-3 border-t border-[#E8EAF6] pt-5 sm:mt-8 sm:flex-row sm:items-center sm:justify-end sm:pt-6'>
                    <JewelryPrimaryButton
                      className='w-full sm:w-auto'
                      onClick={() => setStep(1)}
                    >
                      Continue to delivery
                    </JewelryPrimaryButton>
                  </div>
                </JewelryPanel>
              )}

              {step === 1 && (
                <JewelryPanel>
                  <SectionLabel>Delivery address</SectionLabel>
                  <div className='grid gap-6 sm:grid-cols-2'>
                    <div className='space-y-1 sm:col-span-2'>
                      <Label htmlFor='fullName' className='text-xs text-[#7986CB]'>
                        Full name
                      </Label>
                      <Input
                        id='fullName'
                        className={jewelryInputClass()}
                        value={shipping.fullName}
                        onChange={(e) =>
                          setShipping({ ...shipping, fullName: e.target.value })
                        }
                      />
                    </div>
                    <div className='space-y-1 sm:col-span-2'>
                      <Label htmlFor='address' className='text-xs text-[#7986CB]'>
                        Address
                      </Label>
                      <Input
                        id='address'
                        className={jewelryInputClass()}
                        value={shipping.address}
                        onChange={(e) =>
                          setShipping({ ...shipping, address: e.target.value })
                        }
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label htmlFor='city' className='text-xs text-[#7986CB]'>
                        City
                      </Label>
                      <Input
                        id='city'
                        className={jewelryInputClass()}
                        value={shipping.city}
                        onChange={(e) =>
                          setShipping({ ...shipping, city: e.target.value })
                        }
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label htmlFor='postalCode' className='text-xs text-[#7986CB]'>
                        Postal code
                      </Label>
                      <Input
                        id='postalCode'
                        className={jewelryInputClass()}
                        value={shipping.postalCode}
                        onChange={(e) =>
                          setShipping({ ...shipping, postalCode: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className='mt-10'>
                    <SectionLabel>Shipping method</SectionLabel>
                    <div className='grid gap-3 sm:grid-cols-2'>
                      {(
                        Object.entries(SHIPPING_OPTIONS) as [
                          ShippingMethod,
                          (typeof SHIPPING_OPTIONS)[ShippingMethod],
                        ][]
                      ).map(([key, option]) => (
                        <button
                          key={key}
                          type='button'
                          onClick={() => setShippingMethod(key)}
                          className={cn(
                            'rounded-lg border p-4 text-left transition-colors',
                            shippingMethod === key
                              ? 'border-l-4 border-l-[#120A8F] border-[#E8EAF6] bg-[#F5F7FF]'
                              : 'border-[#E8EAF6] bg-white hover:border-[#C5CAE9]'
                          )}
                        >
                          <p className='font-semibold text-[#0D1B4B]'>{option.label}</p>
                          <p className='mt-1 text-xs text-[#5C6BC0]'>{option.detail}</p>
                          <p className='mt-3 text-sm font-medium text-[#120A8F]'>
                            {formatMoney(option.fee)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className='mt-8 flex flex-col gap-3 border-t border-[#E8EAF6] pt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-6'>
                    <JewelryGhostButton onClick={() => setStep(0)}>
                      ← Back to cart
                    </JewelryGhostButton>
                    <JewelryPrimaryButton
                      className='w-full sm:w-auto'
                      onClick={() => setStep(2)}
                    >
                      Continue to payment
                    </JewelryPrimaryButton>
                  </div>
                </JewelryPanel>
              )}

              {step === 2 && (
                <JewelryPanel>
                  <SectionLabel>Payment</SectionLabel>
                  {error && <p className='mb-4 text-sm text-red-600'>{error}</p>}

                  <PaymentMethodTabs
                    activeMethod={activeMethod}
                    onChange={setActiveMethod}
                    capabilities={capabilities}
                  />

                  <div className='mt-6'>
                    {activeMethod === 'card' && (
                      <div className='rounded-lg border border-[#E8EAF6] bg-[#FAFBFF] p-3 sm:p-4'>
                        <CondensedCardFormSlot
                          isReady={isCardReady}
                          containerId='jewelry-checkout-card'
                          skeletonVariant='jewelry'
                        />
                      </div>
                    )}

                    {activeMethod === 'google-pay' && (
                      <p className='mb-4 text-sm text-[#5C6BC0]'>
                        Pay securely with Google Pay.
                      </p>
                    )}

                    {activeMethod === 'apple-pay' && (
                      <p className='mb-4 text-sm text-[#5C6BC0]'>
                        Pay securely with Apple Pay.
                      </p>
                    )}
                  </div>

                  <PaymentActionZone
                    activeMethod={activeMethod}
                    isActiveMethodReady={isActiveMethodReady}
                    isProcessing={isProcessing}
                    isUpdatingOrder={isUpdatingOrder}
                    cardButtonLabel={cardButtonLabel}
                    onPlaceOrder={placeOrder}
                    isGooglePayReady={isGooglePayReady}
                    isApplePayReady={isApplePayReady}
                  />

                  <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <JewelryGhostButton onClick={() => setStep(1)} disabled={isProcessing}>
                      ← Back to delivery
                    </JewelryGhostButton>
                    <span className='flex items-center justify-center gap-1.5 text-xs text-[#9FA8DA] sm:justify-end'>
                      <Lock className='h-3 w-3 shrink-0' />
                      Secured by xMoney
                    </span>
                  </div>
                </JewelryPanel>
              )}
            </main>

            {summaryRail}
          </div>
        </div>
      </JewelryPreview>
    </TwoColumnLayout>
  )
}
