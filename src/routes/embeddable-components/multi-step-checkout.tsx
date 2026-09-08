import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Heart,
  Layers,
  Loader2,
  Lock,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Truck,
  User,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TwoColumnLayout, type CodeTab } from '@/components/two-column-layout'
import {
  CondensedCardFormSlot,
  WALLET_PAY_BUTTON_HEIGHT_PX,
  WalletPayButtonSlot,
} from '@/components/payment-form-skeleton'
import { PaymentResultCard } from '@/components/payment-result-card'
import { ApplePayMark, GooglePayMark } from '@/components/wallet-brand-marks'
import { assertXMoneyLoaded, createOrder } from '@/lib/create-order'
import { getApiCredentials } from '@/lib/credentials'
import { createSdkLogEvent, type SdkLogEvent } from '@/lib/sdk-events'
import {
  VELVET_COLORS,
  VELVET_EMBEDDED_APPEARANCE,
  VELVET_WALLET_APPEARANCE,
} from '@/lib/velvet-appearance'
import type { Card as SavedCard, TransactionDetails } from '@/types/checkout.types'
import type { PaymentCardInstance } from '@/types/xmoney-sdk/payment-card-sdk.types'
import type { SavedCardPaymentInstance } from '@/types/xmoney-sdk/saved-card-payment-sdk.types'
import type { GooglePayInstance } from '@/types/xmoney-sdk/google-pay-sdk.types'
import type { ApplePayInstance } from '@/types/xmoney-sdk/apple-pay-sdk.types'
import type { PaymentMethodCapabilities } from '@/types/xmoney-sdk/payment-method-capabilities.types'

export const Route = createFileRoute(
  '/embeddable-components/multi-step-checkout'
)({
  component: MultiStepCheckoutPage,
})

const STEPS = ['Cart', 'Shipping', 'Payment'] as const
const UPDATE_ORDER_DEBOUNCE_MS = 500
const CUSTOMER_IDENTIFIER = 'customer-12333'

type PaymentMethod = 'card' | 'saved-card' | 'google-pay' | 'apple-pay'

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
    name: 'Silk Midi Dress',
    description: 'Navy / XS',
    quantity: 1,
    price: 189.0,
    image:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: '2',
    name: 'Cashmere Wrap Cardigan',
    description: 'Blush / S',
    quantity: 1,
    price: 245.0,
    image:
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop&auto=format',
  },
]

const SHIPPING_OPTIONS = {
  standard: { label: 'Standard (3–5 days)', fee: 5 },
  express: { label: 'Express (1–2 days)', fee: 12 },
} as const

type ShippingMethod = keyof typeof SHIPPING_OPTIONS

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function VelvetStyles() {
  return (
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        .velvet-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #D4C4C8 transparent;
        }
        .velvet-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .velvet-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .velvet-scrollbar::-webkit-scrollbar-thumb {
          background: #D4C4C8;
          border-radius: 999px;
        }
        .velvet-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #B8A8AC;
        }
        .velvet-scrollbar-x::-webkit-scrollbar {
          height: 5px;
        }
        #velvet-checkout-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
      `}
    </style>
  )
}

function FloralDecoration() {
  return (
    <svg
      className='pointer-events-none absolute bottom-8 left-0 hidden h-64 w-32 opacity-30 lg:block'
      viewBox='0 0 120 280'
      fill='none'
      aria-hidden
    >
      <path
        d='M30 20 C20 40 35 55 50 45 C65 35 80 50 70 70 C60 90 40 85 30 100 C20 115 25 135 40 130 C55 125 65 145 55 160 C45 175 25 170 20 190 C15 210 30 230 50 220 C70 210 85 235 75 255 C65 275 40 270 30 280'
        stroke={VELVET_COLORS.maroon}
        strokeWidth='1.2'
        fill='none'
      />
      <circle cx='50' cy='45' r='8' stroke={VELVET_COLORS.maroon} strokeWidth='1' fill='none' />
      <circle cx='70' cy='70' r='6' stroke={VELVET_COLORS.maroon} strokeWidth='1' fill='none' />
      <circle cx='40' cy='130' r='7' stroke={VELVET_COLORS.maroon} strokeWidth='1' fill='none' />
      <path
        d='M55 160 Q75 150 85 165 Q95 180 80 195'
        stroke={VELVET_COLORS.maroon}
        strokeWidth='1'
        fill='none'
      />
    </svg>
  )
}

function VelvetHeader({ itemCount }: { itemCount: number }) {
  return (
    <header className='border-b border-[#E8D4D8]/60 bg-white/50 backdrop-blur-sm'>
      <div className='mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4'>
        <div className='flex items-center gap-2'>
          <div
            className='flex h-8 w-8 rotate-45 items-center justify-center border-2 border-[#6B2C3E]'
            aria-hidden
          >
            <div className='h-3 w-3 -rotate-45 bg-[#6B2C3E]' />
          </div>
          <span
            className='text-2xl font-semibold tracking-wide text-[#6B2C3E]'
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            VELVET
          </span>
        </div>
        <nav className='hidden items-center gap-6 text-sm text-[#6B2C3E]/80 md:flex'>
          <span className='cursor-default hover:text-[#6B2C3E]'>Home</span>
          <span className='flex cursor-default items-center gap-1 hover:text-[#6B2C3E]'>
            Categories <ChevronDown className='h-3.5 w-3.5' />
          </span>
          <span className='cursor-default hover:text-[#6B2C3E]'>My Orders</span>
          <span className='cursor-default hover:text-[#6B2C3E]'>About us</span>
        </nav>
        <div className='flex items-center gap-3 text-[#6B2C3E]'>
          <Search className='h-4 w-4 cursor-default opacity-70' />
          <Heart className='h-4 w-4 cursor-default opacity-70' />
          <div className='relative cursor-default'>
            <ShoppingBag className='h-4 w-4 opacity-70' />
            <span className='absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#6B2C3E] text-[9px] font-medium text-white'>
              {itemCount}
            </span>
          </div>
          <User className='h-4 w-4 cursor-default opacity-70' />
        </div>
      </div>
    </header>
  )
}

function CheckoutProgress({
  step,
  confirmation = false,
}: {
  step: number
  confirmation?: boolean
}) {
  const activeStep = confirmation ? STEPS.length : step

  return (
    <nav className='mb-8' aria-label='Checkout progress'>
      <ol className='flex items-center'>
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn('flex flex-1 items-center', i < STEPS.length - 1 && 'pr-2')}
          >
            <div className='flex min-w-0 flex-1 flex-col items-center gap-1.5'>
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  i < activeStep
                    ? 'bg-[#6B2C3E] text-white'
                    : i === activeStep && !confirmation
                      ? 'bg-[#6B2C3E] text-white'
                      : 'border-2 border-[#D4C4C8] bg-white text-[#B8A8AC]'
                )}
              >
                {i < activeStep ? <Check className='h-4 w-4' /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  i <= activeStep ? 'text-[#6B2C3E]' : 'text-[#B8A8AC]'
                )}
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mb-5 h-1 flex-1 rounded-full',
                  i < activeStep ? 'bg-[#6B2C3E]' : 'bg-[#E8D4D8]'
                )}
              />
            )}
          </li>
        ))}
      </ol>
      {confirmation && (
        <p
          className='mt-2 text-center text-sm text-[#8B6B73]'
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Confirmation
        </p>
      )}
    </nav>
  )
}

function VelvetPreview({ children }: { children: ReactNode }) {
  return (
    <div className='relative min-h-full bg-gradient-to-b from-[#F5E6E8] to-[#FAF0F2]'>
      <VelvetStyles />
      <FloralDecoration />
      {children}
    </div>
  )
}

function velvetInputClass() {
  return 'rounded-xl border-[#E8D4D8] bg-[#FFF5F6] text-[#3D1F2A] placeholder:text-[#B8A8AC] focus-visible:border-[#6B2C3E]/40 focus-visible:ring-[#6B2C3E]/20'
}

function velvetHeadingClass() {
  return "text-3xl font-semibold text-[#6B2C3E] [font-family:'Cormorant_Garamond',serif]"
}

function VelvetPillButton({
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
        'rounded-full bg-[#6B2C3E] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8B3A4F] disabled:cursor-not-allowed disabled:opacity-50 sm:px-8',
        className
      )}
    >
      {children}
    </button>
  )
}

function GlassCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-md sm:rounded-xl sm:p-5 md:rounded-2xl md:p-6',
        className
      )}
    >
      {children}
    </div>
  )
}

function SavedCardBrandLabel({ type }: { type: string }) {
  const brand = type.toLowerCase()
  if (brand === 'visa') {
    return <span className='text-xs font-extrabold tracking-wider text-white/95'>VISA</span>
  }
  if (brand === 'mastercard') {
    return (
      <span className='flex items-center'>
        <span className='-mr-2 inline-block h-4 w-4 rounded-full bg-red-400/90' />
        <span className='inline-block h-4 w-4 rounded-full bg-amber-300/90' />
      </span>
    )
  }
  return (
    <span className='text-xs font-semibold uppercase tracking-wide text-white/80'>
      {type}
    </span>
  )
}

/** ISO/IEC 7810 ID-1 credit card ratio (85.60 × 53.98 mm). */
const SAVED_CARD_TILE_CLASS =
  'w-[216px] shrink-0 snap-center aspect-[856/540] sm:w-[232px]'

function SavedCardsCarousel({ children }: { children: ReactNode }) {
  return (
    <div
      className='velvet-scrollbar velvet-scrollbar-x -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 py-2'
    >
      {children}
    </div>
  )
}

function SavedCardTile({
  card,
  selected,
  onSelect,
}: {
  card: SavedCard
  selected: boolean
  onSelect: () => void
}) {
  const last4 = card.cardNumber.replace(/\*/g, '').slice(-4)

  return (
    <button
      type='button'
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'relative box-border overflow-hidden rounded-[14px] p-3 text-left transition-all duration-200 ease-out',
        SAVED_CARD_TILE_CLASS,
        'bg-gradient-to-br from-[#5A2435] via-[#6B2C3E] to-[#8B3A4F]',
        selected
          ? 'z-10 border-2 border-white/70 shadow-[0_0_0_2px_#6B2C3E,0_6px_18px_rgba(107,44,62,0.32)]'
          : 'border-2 border-white/10 opacity-75 shadow-sm hover:border-white/25 hover:opacity-90'
      )}
    >
      <div className='pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/8' />
      <div className='pointer-events-none absolute -bottom-14 -left-6 h-32 w-32 rounded-full bg-black/10' />
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-transparent',
          selected && 'from-white/22'
        )}
      />

      <div className='relative flex h-full flex-col justify-between'>
        <div className='flex items-start justify-between gap-2'>
          <div className='h-7 w-10 shrink-0 rounded-md border border-white/20 bg-gradient-to-br from-amber-100/90 to-amber-300/70 shadow-inner'>
            <div className='mt-1.5 space-y-0.5 px-1'>
              <div className='h-px w-full bg-amber-700/25' />
              <div className='h-px w-4/5 bg-amber-700/20' />
              <div className='h-px w-3/5 bg-amber-700/15' />
            </div>
          </div>
          <div className='flex shrink-0 items-center gap-1.5'>
            <SavedCardBrandLabel type={card.type} />
            {selected && (
              <span
                className='flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm'
                aria-hidden
              >
                <Check className='h-2.5 w-2.5 text-[#6B2C3E]' strokeWidth={3} />
              </span>
            )}
          </div>
        </div>
        <div>
          <p className='font-mono text-xs tracking-[0.12em] text-white/95'>
            •••• •••• •••• {last4}
          </p>
          <div className='mt-1.5 flex items-end justify-between gap-2'>
            <p className='truncate text-[10px] uppercase tracking-wide text-white/70'>
              {card.nameOnCard || 'Cardholder'}
            </p>
            <p className='shrink-0 text-[10px] text-white/70'>
              {card.expiryMonth}/{card.expiryYear}
            </p>
          </div>
        </div>
      </div>
    </button>
  )
}

function SavedCardSkeleton() {
  return (
    <div
      className={cn(
        SAVED_CARD_TILE_CLASS,
        'animate-pulse rounded-[14px] bg-gradient-to-br from-[#E8D4D8] to-[#FFF5F6]'
      )}
    />
  )
}

function PaymentActionZone({
  activeMethod,
  isActiveMethodReady,
  isProcessing,
  isUpdatingOrder,
  selectedSavedCardId,
  total,
  onPlaceOrder,
  onPayWithSavedCard,
  isGooglePayReady,
  isApplePayReady,
}: {
  activeMethod: PaymentMethod
  isActiveMethodReady: boolean
  isProcessing: boolean
  isUpdatingOrder: boolean
  selectedSavedCardId: number | null
  total: number
  onPlaceOrder: () => void
  onPayWithSavedCard: () => void
  isGooglePayReady: boolean
  isApplePayReady: boolean
}) {
  const showCardCta = activeMethod === 'card' || activeMethod === 'saved-card'
  const cardCtaDisabled =
    !isActiveMethodReady ||
    isProcessing ||
    isUpdatingOrder ||
    (activeMethod === 'saved-card' && !selectedSavedCardId)

  return (
    <div
      className='relative mt-6 w-full'
      style={{ height: WALLET_PAY_BUTTON_HEIGHT_PX }}
    >
      {showCardCta && (
        <div className='absolute inset-0'>
          {!isActiveMethodReady ? (
            <div className='h-full w-full animate-pulse rounded-full bg-[#FFF5F6]' />
          ) : (
            <VelvetPillButton
              className='h-full w-full px-4'
              disabled={cardCtaDisabled}
              onClick={activeMethod === 'card' ? onPlaceOrder : onPayWithSavedCard}
            >
              {isProcessing ? (
                <span className='flex items-center justify-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Processing…
                </span>
              ) : (
                `Review Order · ${formatMoney(total)}`
              )}
            </VelvetPillButton>
          )}
        </div>
      )}

      <div
        className={cn(
          'absolute inset-0',
          activeMethod === 'google-pay' ? 'block' : 'hidden'
        )}
      >
        <WalletPayButtonSlot
          containerId='velvet-checkout-google-pay'
          isReady={isGooglePayReady}
          fillParent
          skeletonRadius='pill'
          skeletonClassName='bg-[#FFF5F6]'
        />
      </div>

      <div
        className={cn(
          'absolute inset-0',
          activeMethod === 'apple-pay' ? 'block' : 'hidden'
        )}
      >
        <WalletPayButtonSlot
          containerId='velvet-checkout-apple-pay'
          isReady={isApplePayReady}
          fillParent
          skeletonRadius='pill'
          skeletonClassName='bg-[#FFF5F6]'
        />
      </div>
    </div>
  )
}

function MethodRadio({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
        selected ? 'border-[#6B2C3E] bg-[#6B2C3E]' : 'border-[#D4C4C8]'
      )}
    >
      {selected && <span className='h-2 w-2 rounded-full bg-white' />}
    </span>
  )
}

function MultiStepCheckoutPage() {
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
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<number | null>(null)
  const [isCardReady, setIsCardReady] = useState(false)
  const [isSavedCardReady, setIsSavedCardReady] = useState(false)
  const [isGooglePayReady, setIsGooglePayReady] = useState(false)
  const [isApplePayReady, setIsApplePayReady] = useState(false)
  const [isSavedCardsLoading, setIsSavedCardsLoading] = useState(false)

  const paymentCardRef = useRef<PaymentCardInstance | null>(null)
  const savedCardPaymentRef = useRef<SavedCardPaymentInstance | null>(null)
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
      : activeMethod === 'saved-card'
        ? isSavedCardReady
        : activeMethod === 'google-pay'
          ? isGooglePayReady
          : isApplePayReady

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
    savedCardPaymentRef.current?.destroy()
    savedCardPaymentRef.current = null
    googlePayRef.current?.destroy()
    googlePayRef.current = null
    applePayRef.current?.destroy()
    applePayRef.current = null
    setIsCardReady(false)
    setIsSavedCardReady(false)
    setIsGooglePayReady(false)
    setIsApplePayReady(false)
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

  const fetchSavedCards = async () => {
    setIsSavedCardsLoading(true)
    const { apiKey, isLive } = getApiCredentials()
    if (!apiKey) {
      setIsSavedCardsLoading(false)
      return
    }
    try {
      const response = await fetch('/api/get-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerIdentifier: CUSTOMER_IDENTIFIER,
          apiKey,
          isLive,
        }),
      })
      if (!response.ok) {
        setSavedCards([])
        setSelectedSavedCardId(null)
        return
      }
      const data = await response.json()
      const cards = Array.isArray(data.data) ? (data.data as SavedCard[]) : []
      setSavedCards(cards)
      setSelectedSavedCardId(cards[0]?.id ?? null)
    } catch {
      setSavedCards([])
      setSelectedSavedCardId(null)
    } finally {
      setIsSavedCardsLoading(false)
    }
  }

  const updateOrderAcrossInstances = async (amount: number) => {
    setIsUpdatingOrder(true)
    try {
      const next = await createOrder({
        amount,
        currency: 'EUR',
        description: `VELVET: ${items.map((i) => i.name).join(', ')} → ${shipping.city}`,
      })
      setIntentData(next)
      lastSyncedAmountRef.current = amount
      const orderUpdate = {
        orderPayload: next.payload,
        orderChecksum: next.checksum,
      }
      paymentCardRef.current?.updateOrder(orderUpdate)
      savedCardPaymentRef.current?.updateOrder(orderUpdate)
      googlePayRef.current?.updateOrder(orderUpdate)
      applePayRef.current?.updateOrder(orderUpdate)
      // order synced across embeddable instances
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
    lastSyncedAmountRef.current = null
    destroySdkInstances()
    setSessionId((n) => n + 1)
  }

  // Initialize order + capabilities when entering payment step
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
          description: `VELVET: ${items.map((i) => i.name).join(', ')} → ${shipping.city}`,
        })
        if (!mounted) return
        setIntentData(data)
        lastSyncedAmountRef.current = total

        window.XMoney.getPaymentMethodCapabilities()
          .then((capabilityData) => {
            if (mounted) setCapabilities(capabilityData)
          })
          .catch(() => {})

        await fetchSavedCards()
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

  // paymentCard
  useEffect(() => {
    if (step !== 2 || !intentData || loading) return
    if (activeMethod !== 'card') {
      if (paymentCardRef.current) {
        paymentCardRef.current.destroy()
        paymentCardRef.current = null
        setIsCardReady(false)
      }
      return
    }
    if (paymentCardRef.current) return

    const container = document.getElementById('velvet-checkout-card')
    if (!container) return
    container.innerHTML = ''

    window.XMoney.paymentCard({
      container: 'velvet-checkout-card',
      publicKey: intentData.publicKey,
      orderPayload: intentData.payload,
      orderChecksum: intentData.checksum,
      card: {
        validationMode: 'onBlur',
        savedCards: { enabled: false, optInVisible: false },
        submitButton: { visible: false },
        inputs: { grouping: 'condensed' },
      },
      options: {
        locale: 'en-US',
        appearance: VELVET_EMBEDDED_APPEARANCE,
      },
      onReady: () => {
        setIsCardReady(true)
        logEvent('onReady', { method: 'card' })
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

  // savedCardPayment
  useEffect(() => {
    if (step !== 2 || !intentData || savedCardPaymentRef.current) return

    window.XMoney.savedCardPayment({
      publicKey: intentData.publicKey,
      orderPayload: intentData.payload,
      orderChecksum: intentData.checksum,
      options: { locale: 'en-US' },
      onReady: () => {
        setIsSavedCardReady(true)
        logEvent('onReady', { method: 'saved-card' })
      },
      onPaymentProcessing: (processing: boolean) => {
        logEvent('onPaymentProcessing', { isProcessing: processing })
        setIsProcessing(processing)
      },
      onPaymentComplete: handlePaymentComplete,
      onError: handlePaymentError,
    })
      .then((instance) => {
        savedCardPaymentRef.current = instance
      })
      .catch(handlePaymentError)
  }, [step, intentData])

  // googlePay
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

    const container = document.getElementById('velvet-checkout-google-pay')
    if (!container) return
    container.innerHTML = ''

    window.XMoney.googlePay({
      container: 'velvet-checkout-google-pay',
      publicKey: intentData.publicKey,
      orderPayload: intentData.payload,
      orderChecksum: intentData.checksum,
      options: {
        locale: 'en-US',
        appearance: VELVET_WALLET_APPEARANCE.googlePay,
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

  // applePay
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

    const container = document.getElementById('velvet-checkout-apple-pay')
    if (!container) return
    container.innerHTML = ''

    window.XMoney.applePay({
      container: 'velvet-checkout-apple-pay',
      publicKey: intentData.publicKey,
      orderPayload: intentData.payload,
      orderChecksum: intentData.checksum,
      options: {
        locale: 'en-US',
        appearance: VELVET_WALLET_APPEARANCE.applePay,
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

  // Debounced updateOrder when total changes on payment step
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

  const payWithSavedCard = () => {
    if (!savedCardPaymentRef.current || !selectedSavedCardId) return
    setIsProcessing(true)
    savedCardPaymentRef.current.pay({ cardId: selectedSavedCardId })
  }

  const accordionClass = (selected: boolean) =>
    cn(
      'rounded-xl border p-4 transition-colors',
      selected
        ? 'border-[#6B2C3E]/40 bg-[#FFF5F6]/80'
        : 'border-[#E8D4D8] bg-white/40 hover:border-[#D4C4C8]'
    )

  const codeTabs: CodeTab[] = [
    {
      value: 'card',
      label: 'paymentCard.tsx',
      language: 'typescript',
      content: `const card = await window.XMoney.paymentCard({
  container: 'velvet-checkout-card',
  publicKey: '<PUBLIC_KEY>',
  orderPayload: payload,
  orderChecksum: checksum,
  card: {
    submitButton: { visible: false },
    inputs: { grouping: 'condensed' },
  },
  options: {
    locale: 'en-US',
    appearance: {
      theme: 'custom',
      variables: { colorPrimary: '#6B2C3E', borderRadius: '12px' },
      rules: {
        '.xmoney-input': { borderRadius: '12px', padding: '12px 14px' },
      },
    },
  },
  onReady: () => setIsCardReady(true),
})

// Multi-step: update when cart totals change
await card.updateOrder({ orderPayload, orderChecksum })
card.submit()`,
    },
    {
      value: 'saved-card',
      label: 'savedCard.tsx',
      language: 'typescript',
      content: `const saved = await window.XMoney.savedCardPayment({
  publicKey: '<PUBLIC_KEY>',
  orderPayload: payload,
  orderChecksum: checksum,
  onReady: () => setIsSavedCardReady(true),
})

saved.pay({ cardId: selectedCardId })
await saved.updateOrder({ orderPayload, orderChecksum })`,
    },
    {
      value: 'google-pay',
      label: 'googlePay.tsx',
      language: 'typescript',
      content: `const gpay = await window.XMoney.googlePay({
  container: 'velvet-checkout-google-pay',
  publicKey: '<PUBLIC_KEY>',
  orderPayload: payload,
  orderChecksum: checksum,
  options: {
    appearance: { color: 'black', type: 'pay', radius: 999 },
  },
})
await gpay.updateOrder({ orderPayload, orderChecksum })`,
    },
    {
      value: 'apple-pay',
      label: 'applePay.tsx',
      language: 'typescript',
      content: `const applePay = await window.XMoney.applePay({
  container: 'velvet-checkout-apple-pay',
  publicKey: '<PUBLIC_KEY>',
  orderPayload: payload,
  orderChecksum: checksum,
  options: {
    appearance: { style: 'black', type: 'pay', radius: 999 },
  },
})
await applePay.updateOrder({ orderPayload, orderChecksum })`,
    },
  ]

  const layoutProps = {
    title: 'Multi-step Checkout',
    icon: <Layers className='h-4 w-4' />,
    onRefresh: restartOrder,
    events,
    onClearEvents: () => setEvents([]),
    codeTabs,
  }

  if (transaction || paymentError) {
    return (
      <TwoColumnLayout {...layoutProps}>
        <VelvetPreview>
          <VelvetHeader itemCount={itemCount} />
          <div className='mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8'>
            <CheckoutProgress step={step} confirmation />
            <GlassCard className='mx-auto max-w-md'>
              <PaymentResultCard
                result={transaction}
                variant={transaction ? 'success' : 'error'}
                errorMessage={paymentError ?? undefined}
                onRestart={restartOrder}
              />
            </GlassCard>
          </div>
        </VelvetPreview>
      </TwoColumnLayout>
    )
  }

  return (
    <TwoColumnLayout {...layoutProps} loading={loading && step === 2}>
      <VelvetPreview>
        <VelvetHeader itemCount={itemCount} />
        <div className='mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8'>
          <CheckoutProgress step={step} />

          {step === 0 && (
            <GlassCard className='mx-auto max-w-2xl'>
              <h2 className={velvetHeadingClass()}>Your Cart</h2>
              <p className='mt-1 text-sm text-[#8B6B73]'>
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your bag
              </p>
              <div className='mt-6 space-y-5'>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className='flex gap-4 border-b border-[#E8D4D8]/60 pb-5 last:border-0 last:pb-0'
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className='h-24 w-20 rounded-xl object-cover'
                      />
                    )}
                    <div className='flex flex-1 flex-col justify-between'>
                      <div>
                        <p className='font-medium text-[#3D1F2A]'>{item.name}</p>
                        <p className='text-sm text-[#8B6B73]'>{item.description}</p>
                        <p className='mt-0.5 text-sm text-[#8B6B73]'>
                          {formatMoney(item.price)} each
                        </p>
                      </div>
                      <div className='mt-2 flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='icon'
                          className='h-7 w-7 rounded-full border-[#E8D4D8] bg-white hover:bg-[#FFF5F6]'
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className='h-3 w-3 text-[#6B2C3E]' />
                        </Button>
                        <span className='w-6 text-center text-sm text-[#3D1F2A]'>
                          {item.quantity}
                        </span>
                        <Button
                          variant='outline'
                          size='icon'
                          className='h-7 w-7 rounded-full border-[#E8D4D8] bg-white hover:bg-[#FFF5F6]'
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className='h-3 w-3 text-[#6B2C3E]' />
                        </Button>
                      </div>
                    </div>
                    <p className='font-semibold text-[#3D1F2A]'>
                      {formatMoney(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className='mt-6 flex items-center justify-between border-t border-[#E8D4D8]/60 pt-4'>
                <span className='font-medium text-[#8B6B73]'>Subtotal</span>
                <span
                  className='text-xl font-semibold text-[#6B2C3E]'
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {formatMoney(subtotal)}
                </span>
              </div>
              <div className='mt-6 flex justify-end'>
                <VelvetPillButton onClick={() => setStep(1)}>
                  Continue to Shipping
                </VelvetPillButton>
              </div>
            </GlassCard>
          )}

          {step === 1 && (
            <GlassCard className='mx-auto max-w-2xl'>
              <h2 className={velvetHeadingClass()}>Delivery Details</h2>
              <p className='mt-1 text-sm text-[#8B6B73]'>
                Where should we send your order?
              </p>
              <div className='mt-6 mb-4 flex items-center gap-2 text-[#6B2C3E]'>
                <MapPin className='h-4 w-4' />
                <span className='text-sm font-medium'>Shipping address</span>
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-1 sm:col-span-2'>
                  <Label htmlFor='fullName' className='text-[#6B2C3E]'>Full name</Label>
                  <Input id='fullName' className={velvetInputClass()} value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} />
                </div>
                <div className='space-y-1 sm:col-span-2'>
                  <Label htmlFor='address' className='text-[#6B2C3E]'>Address</Label>
                  <Input id='address' className={velvetInputClass()} value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })} />
                </div>
                <div className='space-y-1'>
                  <Label htmlFor='city' className='text-[#6B2C3E]'>City</Label>
                  <Input id='city' className={velvetInputClass()} value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
                </div>
                <div className='space-y-1'>
                  <Label htmlFor='postalCode' className='text-[#6B2C3E]'>Postal code</Label>
                  <Input id='postalCode' className={velvetInputClass()} value={shipping.postalCode}
                    onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })} />
                </div>
              </div>
              <div className='mt-6 space-y-3'>
                <div className='flex items-center gap-2 text-[#6B2C3E]'>
                  <Truck className='h-4 w-4' />
                  <Label>Shipping method</Label>
                </div>
                <div className='space-y-2'>
                  {(Object.entries(SHIPPING_OPTIONS) as [ShippingMethod, (typeof SHIPPING_OPTIONS)[ShippingMethod]][]).map(
                    ([key, option]) => (
                      <button
                        key={key}
                        type='button'
                        onClick={() => setShippingMethod(key)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors',
                          shippingMethod === key
                            ? 'border-[#6B2C3E] bg-[#FFF5F6]'
                            : 'border-[#E8D4D8] bg-white/50 hover:border-[#D4C4C8]'
                        )}
                      >
                        <MethodRadio selected={shippingMethod === key} />
                        <span className='flex-1 text-sm text-[#3D1F2A]'>{option.label}</span>
                        <span className='text-sm font-medium text-[#3D1F2A]'>
                          {formatMoney(option.fee)}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className='mt-6 flex items-center justify-between gap-3'>
                <button type='button' onClick={() => setStep(0)}
                  className='text-sm text-[#8B6B73] hover:text-[#6B2C3E]'>← Back to cart</button>
                <VelvetPillButton onClick={() => setStep(2)}>Continue to Payment</VelvetPillButton>
              </div>
            </GlassCard>
          )}

          {step === 2 && (
            <div className='grid gap-4 sm:gap-6 lg:grid-cols-2'>
              <GlassCard>
                <h2 className={velvetHeadingClass()}>Review Your Order</h2>
                {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}

                <div className='mt-6 space-y-3'>
                  {/* Credit Card */}
                  <div className={accordionClass(activeMethod === 'card')}>
                    <button type='button' className='flex w-full items-center gap-3 text-left'
                      onClick={() => setActiveMethod('card')}>
                      <MethodRadio selected={activeMethod === 'card'} />
                      <CreditCard className='h-4 w-4 text-[#6B2C3E]' />
                      <span className='flex-1 text-sm font-medium text-[#3D1F2A]'>Credit Card</span>
                      {activeMethod === 'card' ? (
                        <ChevronUp className='h-4 w-4 text-[#8B6B73]' />
                      ) : (
                        <ChevronDown className='h-4 w-4 text-[#8B6B73]' />
                      )}
                    </button>
                    {activeMethod === 'card' && (
                      <div className='mt-4 border-t border-[#E8D4D8]/60 pt-4'>
                        <div
                          className='rounded-lg border border-[#E8D4D8]/80 bg-gradient-to-br from-white/95 to-[#FFF5F6]/90 p-3 shadow-sm sm:rounded-xl sm:p-4 md:rounded-2xl'
                        >
                          <CondensedCardFormSlot
                            isReady={isCardReady}
                            containerId='velvet-checkout-card'
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Saved Cards */}
                  <div className={accordionClass(activeMethod === 'saved-card')}>
                    <button type='button' className='flex w-full items-center gap-3 text-left'
                      onClick={() => setActiveMethod('saved-card')}>
                      <MethodRadio selected={activeMethod === 'saved-card'} />
                      <Wallet className='h-4 w-4 text-[#6B2C3E]' />
                      <span className='flex-1 text-sm font-medium text-[#3D1F2A]'>Saved Cards</span>
                      {activeMethod === 'saved-card' ? (
                        <ChevronUp className='h-4 w-4 text-[#8B6B73]' />
                      ) : (
                        <ChevronDown className='h-4 w-4 text-[#8B6B73]' />
                      )}
                    </button>
                    {activeMethod === 'saved-card' && (
                      <div className='mt-4 border-t border-[#E8D4D8]/60 pt-4'>
                        {isSavedCardsLoading || !isSavedCardReady ? (
                          <SavedCardsCarousel>
                            {[0, 1].map((i) => (
                              <SavedCardSkeleton key={i} />
                            ))}
                          </SavedCardsCarousel>
                        ) : savedCards.length === 0 ? (
                          <p className='py-4 text-center text-sm text-[#8B6B73]'>
                            No saved cards found.
                          </p>
                        ) : (
                          <SavedCardsCarousel>
                            {savedCards.map((card) => (
                              <SavedCardTile
                                key={card.id}
                                card={card}
                                selected={selectedSavedCardId === card.id}
                                onSelect={() => setSelectedSavedCardId(card.id)}
                              />
                            ))}
                          </SavedCardsCarousel>
                        )}
                      </div>
                    )}
                  </div>

                  {capabilities?.googlePay?.supported !== false && (
                    <div className={accordionClass(activeMethod === 'google-pay')}>
                      <button
                        type='button'
                        className='flex w-full items-center gap-3 text-left'
                        onClick={() => setActiveMethod('google-pay')}
                      >
                        <MethodRadio selected={activeMethod === 'google-pay'} />
                        <span className='flex min-w-0 flex-1 items-center'>
                          <GooglePayMark />
                        </span>
                        {activeMethod === 'google-pay' ? (
                          <ChevronUp className='h-4 w-4 text-[#8B6B73]' />
                        ) : (
                          <ChevronDown className='h-4 w-4 text-[#8B6B73]' />
                        )}
                      </button>
                      {activeMethod === 'google-pay' && (
                        <p className='mt-4 border-t border-[#E8D4D8]/60 pt-4 text-sm text-[#8B6B73]'>
                          Use the button below to pay with Google Pay.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Apple Pay */}
                  {capabilities?.applePay?.supported !== false && (
                    <div className={accordionClass(activeMethod === 'apple-pay')}>
                      <button
                        type='button'
                        className='flex w-full items-center gap-3 text-left'
                        onClick={() => setActiveMethod('apple-pay')}
                      >
                        <MethodRadio selected={activeMethod === 'apple-pay'} />
                        <span className='flex min-w-0 flex-1 items-center'>
                          <ApplePayMark />
                        </span>
                        {activeMethod === 'apple-pay' ? (
                          <ChevronUp className='h-4 w-4 text-[#8B6B73]' />
                        ) : (
                          <ChevronDown className='h-4 w-4 text-[#8B6B73]' />
                        )}
                      </button>
                      {activeMethod === 'apple-pay' && (
                        <p className='mt-4 border-t border-[#E8D4D8]/60 pt-4 text-sm text-[#8B6B73]'>
                          Use the button below to pay with Apple Pay.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <PaymentActionZone
                  activeMethod={activeMethod}
                  isActiveMethodReady={isActiveMethodReady}
                  isProcessing={isProcessing}
                  isUpdatingOrder={isUpdatingOrder}
                  selectedSavedCardId={selectedSavedCardId}
                  total={total}
                  onPlaceOrder={placeOrder}
                  onPayWithSavedCard={payWithSavedCard}
                  isGooglePayReady={isGooglePayReady}
                  isApplePayReady={isApplePayReady}
                />

                <div className='mt-4 flex items-center justify-between gap-3'>
                  <button
                    type='button'
                    onClick={() => setStep(0)}
                    disabled={isProcessing}
                    className='text-sm text-[#8B6B73] hover:text-[#6B2C3E] disabled:opacity-50'
                  >
                    ← Return to Cart
                  </button>
                </div>

                <div className='mt-4 flex items-center justify-center gap-1.5 text-xs text-[#B8A8AC]'>
                  <Lock className='h-3 w-3' />
                  Secured by xMoney
                </div>
              </GlassCard>

              <GlassCard className='lg:sticky lg:top-4 lg:self-start'>
                <h2 className={cn(velvetHeadingClass(), 'text-2xl')}>Order Summary</h2>
                <div className='mt-4 max-h-56 space-y-4 overflow-y-auto pr-1'>
                  {items.map((item) => (
                    <div key={item.id} className='flex gap-3'>
                      {item.image && (
                        <img src={item.image} alt={item.name}
                          className='h-16 w-14 rounded-lg object-cover' />
                      )}
                      <div className='flex flex-1 flex-col'>
                        <p className='text-sm font-medium text-[#3D1F2A]'>{item.name}</p>
                        <p className='text-xs text-[#8B6B73]'>{item.description}</p>
                        <p className='text-xs text-[#8B6B73]'>Qty: {item.quantity}</p>
                      </div>
                      <p className='text-sm font-medium text-[#3D1F2A]'>
                        {formatMoney(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className='mt-4 flex gap-2'>
                  <Input placeholder='Enter code' className={cn(velvetInputClass(), 'flex-1')} disabled />
                  <Button variant='outline' disabled
                    className='shrink-0 rounded-full border-[#6B2C3E] text-[#6B2C3E] hover:bg-[#FFF5F6]'>
                    Apply
                  </Button>
                </div>
                <div className='mt-4 space-y-2 border-t border-[#E8D4D8]/60 pt-4 text-sm'>
                  <div className='flex justify-between text-[#8B6B73]'>
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal)}</span>
                  </div>
                  <div className='flex justify-between text-[#8B6B73]'>
                    <span>Shipping</span>
                    <span>{formatMoney(shippingFee)}</span>
                  </div>
                  <div className='flex justify-between border-t border-[#E8D4D8]/60 pt-3'>
                    <span className='text-lg font-semibold text-[#6B2C3E]'
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}>Total</span>
                    <span className='flex items-center gap-2 text-xl font-bold text-[#6B2C3E]'
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {isUpdatingOrder && <Loader2 className='h-4 w-4 animate-spin' />}
                      {formatMoney(total)}
                    </span>
                  </div>
                </div>
                <div className='mt-4 rounded-xl bg-[#FFF5F6]/80 p-3'>
                  <p className='mb-1 text-xs font-medium uppercase tracking-wide text-[#8B6B73]'>Ship to</p>
                  <p className='text-sm text-[#3D1F2A]'>
                    {shipping.fullName}<br />{shipping.address}<br />
                    {shipping.postalCode} {shipping.city}
                  </p>
                </div>
                {isProcessing && (
                  <p className='mt-4 flex items-center gap-2 text-xs font-medium text-[#8B3A4F]'>
                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                    Processing payment…
                  </p>
                )}
              </GlassCard>
            </div>
          )}
        </div>
      </VelvetPreview>
    </TwoColumnLayout>
  )
}
