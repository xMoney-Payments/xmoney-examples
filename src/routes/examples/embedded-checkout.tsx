import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Code2,
  Copy,
  CreditCard,
  FileCode,
  LayoutTemplate,
  Loader2,
  Lock,
  MapPin,
  Minus,
  Plus,
  RotateCw,
  ShoppingCart,
  Wallet,
  X,
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getApiCredentials } from '@/lib/credentials'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type {
  Card as SavedCard,
  TransactionDetails,
} from '@/types/checkout.types'
import type { XMoneyPaymentCardInstance } from '@/types/xmoney-sdk/payment-card-sdk.types'
import type { XMoneySavedCardPaymentInstance } from '@/types/xmoney-sdk/saved-card-payment-sdk.types'
import type { XMoneyGooglePayInstance } from '@/types/xmoney-sdk/google-pay-sdk.types'
import type { XMoneyApplePayInstance } from '@/types/xmoney-sdk/apple-pay-sdk.types'
import type { PaymentMethodCapabilities } from '@/types/xmoney-sdk/payment-method-capabilities.types'
import { TestCards } from '@/components/test-cards'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/examples/embedded-checkout')({
  component: RouteComponent,
})

type PaymentMethod = 'card' | 'saved-card' | 'google-pay' | 'apple-pay'

type OrderItem = {
  id: number
  name: string
  description: string
  emoji: string
  price: number
  quantity: number
}

const DELIVERY_THRESHOLD = 30
const DELIVERY_FEE = 0.1
const UPDATE_ORDER_DEBOUNCE_MS = 500
const CUSTOMER_IDENTIFIER = 'customer-12333'

const MENU: Omit<OrderItem, 'quantity'>[] = [
  {
    id: 1,
    name: 'Margherita',
    description: 'Tomato sauce, fresh mozzarella, basil',
    emoji: '🍕',
    price: 12.99,
  },
  {
    id: 2,
    name: 'Pepperoni',
    description: 'Tomato sauce, mozzarella, pepperoni',
    emoji: '🍕',
    price: 14.99,
  },
  {
    id: 3,
    name: 'Quattro Formaggi',
    description: 'Mozzarella, gorgonzola, parmesan, fontina',
    emoji: '🧀',
    price: 16.99,
  },
]

function getInitialItems() {
  return MENU.map((item) => ({ ...item, quantity: 1 }))
}

function CardBrandBadge({ type }: { type: string }) {
  const brand = type.toLowerCase()
  if (brand === 'visa') {
    return (
      <span className='rounded border border-blue-200 bg-blue-50 px-1 py-0.5 text-[10px] font-extrabold tracking-tight text-blue-700'>
        VISA
      </span>
    )
  }
  if (brand === 'mastercard') {
    return (
      <span className='flex items-center'>
        <span className='-mr-2.5 inline-block h-4 w-4 rounded-full bg-red-500 opacity-90' />
        <span className='inline-block h-4 w-4 rounded-full bg-yellow-400 opacity-90' />
      </span>
    )
  }
  return (
    <span className='rounded bg-muted px-1 py-0.5 text-[10px] font-bold text-muted-foreground'>
      {type.toUpperCase()}
    </span>
  )
}

function GooglePayBadge() {
  return (
    <span className='flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 bg-white shadow-sm'>
      <svg
        className='h-4 w-4'
        viewBox='0 0 24 24'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          fill='#4285F4'
          d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
        />
        <path
          fill='#34A853'
          d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
        />
        <path
          fill='#FBBC05'
          d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
        />
        <path
          fill='#EA4335'
          d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
        />
      </svg>
    </span>
  )
}

function ApplePayBadge() {
  return (
    <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-black'>
      <svg
        className='h-[18px] w-[18px] text-white'
        viewBox='0 0 24 24'
        fill='currentColor'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
      </svg>
    </span>
  )
}

function RouteComponent() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false)
  const [paymentResult, setPaymentResult] = useState<TransactionDetails | null>(
    null
  )

  const [orderItems, setOrderItems] = useState<OrderItem[]>(getInitialItems())
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('card')

  const [intentData, setIntentData] = useState<{
    publicKey: string
    payload: string
    checksum: string
  } | null>(null)

  const [capabilities, setCapabilities] =
    useState<PaymentMethodCapabilities | null>(null)
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<number | null>(
    null
  )
  const [isCardReady, setIsCardReady] = useState(false)
  const [isSavedCardReady, setIsSavedCardReady] = useState(false)
  const [isGooglePayReady, setIsGooglePayReady] = useState(false)
  const [isApplePayReady, setIsApplePayReady] = useState(false)
  const [isSavedCardsLoading, setIsSavedCardsLoading] = useState(true)

  const paymentCardRef = useRef<XMoneyPaymentCardInstance | null>(null)
  const savedCardPaymentRef = useRef<XMoneySavedCardPaymentInstance | null>(
    null
  )
  const googlePayRef = useRef<XMoneyGooglePayInstance | null>(null)
  const applePayRef = useRef<XMoneyApplePayInstance | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSyncedAmountRef = useRef<number | null>(null)

  const [deliveryForm, setDeliveryForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    notes: '',
  })

  const subtotal = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [orderItems]
  )
  const deliveryFee = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee

  const isActiveMethodReady =
    activeMethod === 'card'
      ? isCardReady
      : activeMethod === 'saved-card'
        ? isSavedCardReady
        : true

  const createOrder = async (amount: number) => {
    const { publicKey, apiKey } = getApiCredentials()
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(amount * 100) / 100,
        currency: 'EUR',
        description: 'Advanced Embedded Checkout',
        publicKey,
        apiKey,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create order')
    }

    const data = await response.json()

    return {
      publicKey,
      payload: data.payload as string,
      checksum: data.checksum as string,
    }
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
      // Failing to load saved cards is non-fatal; show empty state
      setSavedCards([])
      setSelectedSavedCardId(null)
    } finally {
      setIsSavedCardsLoading(false)
    }
  }

  const handlePaymentComplete = (result: TransactionDetails) => {
    setIsProcessing(false)
    setPaymentResult(result)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePaymentError = (err: unknown) => {
    console.error(err)
    setIsProcessing(false)
    setError('Payment failed. Please try again.')
  }

  const updateOrderAcrossInstances = async (amount: number) => {
    setIsUpdatingOrder(true)
    try {
      const next = await createOrder(amount)
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
    } catch (err) {
      console.error(err)
      setError('Failed to update order amount. Please try again.')
    } finally {
      setIsUpdatingOrder(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      setLoading(true)
      setError(null)
      try {
        if (!window.XMoney) {
          throw new Error('XMoney SDK is not available')
        }

        // Create the order first — required before any SDK call.
        const initialOrder = await createOrder(total)

        if (!mounted) return

        setIntentData(initialOrder)
        lastSyncedAmountRef.current = total

        // Load capabilities non-blocking so the grid (and card container)
        // render immediately. Wallet methods show optimistically and hide only
        // if capabilities explicitly return supported=false. Calling this after
        // createOrder ensures the XMoney SDK has finished initialising.
        window.XMoney.getPaymentMethodCapabilities()
          .then((capabilityData) => {
            if (!mounted) return
            setCapabilities(capabilityData)
          })
          .catch((err) => {
            console.warn('Could not load payment method capabilities:', err)
          })

        await fetchSavedCards()
      } catch (err) {
        console.error(err)
        if (!mounted) return
        setError('Failed to initialize checkout. Please refresh and try again.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initialize()

    return () => {
      mounted = false
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      paymentCardRef.current?.destroy()
      savedCardPaymentRef.current?.destroy()
      googlePayRef.current?.destroy()
      applePayRef.current?.destroy()
    }
  }, [])

  useEffect(() => {
    if (!intentData || !window.XMoney || loading) return

    // Clean up existing instance when switching away from card
    if (activeMethod !== 'card') {
      if (paymentCardRef.current) {
        paymentCardRef.current.destroy()
        paymentCardRef.current = null
        setIsCardReady(false)
      }
      return
    }

    // Skip if already initialized for this method
    if (paymentCardRef.current) return

    const container = document.getElementById('advanced-checkout-card')
    if (!container) return
    container.innerHTML = ''

    window.XMoney.paymentCard({
      container: 'advanced-checkout-card',
      publicKey: intentData.publicKey,
      orderPayload: intentData.payload,
      orderChecksum: intentData.checksum,
      card: {
        validationMode: 'onBlur',
        savedCards: { enabled: false, optInVisible: false },
        submitButton: { visible: false },
      },
      options: {
        locale: 'en-US',
      },
      onReady: () => setIsCardReady(true),
      onPaymentProcessing: setIsProcessing,
      onPaymentComplete: handlePaymentComplete,
      onError: handlePaymentError,
    })
      .then((instance) => {
        paymentCardRef.current = instance
      })
      .catch(handlePaymentError)
  }, [activeMethod, intentData, loading])

  useEffect(() => {
    if (!intentData || savedCardPaymentRef.current || !window.XMoney) return

    window.XMoney.savedCardPayment({
      publicKey: intentData.publicKey,
      orderPayload: intentData.payload,
      orderChecksum: intentData.checksum,
      onReady: () => setIsSavedCardReady(true),
      onPaymentProcessing: setIsProcessing,
      onPaymentComplete: handlePaymentComplete,
      onError: handlePaymentError,
    })
      .then((instance) => {
        savedCardPaymentRef.current = instance
      })
      .catch(handlePaymentError)
  }, [intentData])

  useEffect(() => {
    if (!intentData || !window.XMoney) return

    // Destroy instance when switching away from google-pay
    if (activeMethod !== 'google-pay') {
      if (googlePayRef.current) {
        googlePayRef.current.destroy()
        googlePayRef.current = null
        setIsGooglePayReady(false)
      }
      return
    }

    // Skip if already initialized — order updates are handled via updateOrder()
    if (googlePayRef.current) return

    const container = document.getElementById('advanced-checkout-google-pay')
    if (!container) return
    container.innerHTML = ''

    window.XMoney.googlePay({
      container: 'advanced-checkout-google-pay',
      publicKey: intentData.publicKey,
      orderPayload: intentData.payload,
      orderChecksum: intentData.checksum,
      options: {
        locale: 'en-US',
        appearance: {
          color: 'black',
          type: 'pay',
        },
      },
      onReady: () => setIsGooglePayReady(true),
      onPaymentProcessing: setIsProcessing,
      onPaymentComplete: handlePaymentComplete,
      onError: handlePaymentError,
    })
      .then((instance) => {
        googlePayRef.current = instance
      })
      .catch(handlePaymentError)
  }, [activeMethod, intentData])

  useEffect(() => {
    if (!intentData || !window.XMoney) return

    // Destroy instance when switching away from apple-pay
    if (activeMethod !== 'apple-pay') {
      if (applePayRef.current) {
        applePayRef.current.destroy()
        applePayRef.current = null
        setIsApplePayReady(false)
      }
      return
    }

    // Skip if already initialized — order updates are handled via updateOrder()
    if (applePayRef.current) return

    const container = document.getElementById('advanced-checkout-apple-pay')
    if (!container) return
    container.innerHTML = ''

    window.XMoney.applePay({
      container: 'advanced-checkout-apple-pay',
      publicKey: intentData.publicKey,
      orderPayload: intentData.payload,
      orderChecksum: intentData.checksum,
      options: {
        locale: 'en-US',
        appearance: {
          style: 'black',
          type: 'pay',
        },
      },
      onReady: () => setIsApplePayReady(true),
      onPaymentProcessing: setIsProcessing,
      onPaymentComplete: handlePaymentComplete,
      onError: handlePaymentError,
    })
      .then((instance) => {
        applePayRef.current = instance
      })
      .catch(handlePaymentError)
  }, [activeMethod, intentData])

  useEffect(() => {
    if (!intentData) return
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
  }, [total, intentData])

  const [activeCodeTab, setActiveCodeTab] = useState('card')
  const [copied, setCopied] = useState(false)
  const [codePanelOpen, setCodePanelOpen] = useState(false)

  const codeTabs = [
    {
      value: 'card',
      label: 'paymentCard.tsx',
      language: 'typescript',
      content: `// 1. Create an order on your server and get payload + checksum
const { payload, checksum } = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 49.97, currency: 'EUR' }),
}).then(r => r.json())

// 2. Mount the Payment Card component
const instance = await window.XMoney.paymentCard({
  container: 'payment-card-container', // id of the DOM element
  publicKey: 'your-public-key',
  orderPayload: payload,
  orderChecksum: checksum,
  card: {
    validationMode: 'onBlur',
    savedCards: {
      enabled: true,
      customerId: 'customer-12333', // unique per user
      optIn: { visible: true },
    },
    submitButton: { visible: false }, // use your own button
  },
  options: { locale: 'en-US' },
  onReady: () => console.log('Card form ready'),
  onPaymentProcessing: (processing) => setIsProcessing(processing),
  onPaymentComplete: (result) => {
    console.log('Payment complete', result)
  },
  onError: (err) => console.error('Payment error', err),
})

// 3. Trigger payment from your own "Place Order" button
instance.submit()

// 4. Update the order amount when the cart changes
instance.updateOrder({ orderPayload, orderChecksum })

// 5. Clean up when unmounting
instance.destroy()`,
    },
    {
      value: 'saved-card',
      label: 'savedCard.tsx',
      language: 'typescript',
      content: `// Initialize the Saved Card Payment component (no container needed —
// it manages payment headlessly, you supply your own card list UI)
const instance = await window.XMoney.savedCardPayment({
  publicKey: 'your-public-key',
  orderPayload: payload,
  orderChecksum: checksum,
  options: { locale: 'en-US' },
  onReady: () => setIsSavedCardReady(true),
  onPaymentProcessing: (processing) => setIsProcessing(processing),
  onPaymentComplete: (result) => {
    console.log('Saved card payment complete', result)
  },
  onError: (err) => console.error('Error', err),
})

// Fetch saved cards for the customer via your backend
const cards = await fetch('/api/saved-cards?customerId=customer-12333')
  .then(r => r.json())

// Trigger payment with the selected saved card id
instance.pay({ cardId: selectedCardId })

// Update order amount when the cart changes
instance.updateOrder({ orderPayload, orderChecksum })

// Clean up
instance.destroy()`,
    },
    {
      value: 'google-pay',
      label: 'googlePay.tsx',
      language: 'typescript',
      content: `
// Check support before initializing Google Pay
const capabilities = await window.XMoney.getPaymentMethodCapabilities()
if (!capabilities.googlePay.supported) {
  console.warn(capabilities.googlePay.reason || 'Google Pay not supported')
  return
}

// Mount the Google Pay button
const instance = await window.XMoney.googlePay({
  container: 'google-pay-container', // id of the DOM element
  publicKey: 'your-public-key',
  orderPayload: payload,
  orderChecksum: checksum,
  options: {
    locale: 'en-US',
    appearance: {
      color: 'black',   // 'black' | 'white' | 'default'
      type: 'pay',      // 'buy' | 'pay' | 'checkout' | ...
      radius: 12,
      borderType: 'no_border', // 'no_border' | 'rectangle'
    },
  },
  onReady: () => setIsGooglePayReady(true),
  onPaymentProcessing: (processing) => setIsProcessing(processing),
  onPaymentComplete: (result) => {
    console.log('Google Pay complete', result)
  },
  onError: (err) => console.error('Error', err),
})

// Update order amount when the cart changes
instance.updateOrder({ orderPayload, orderChecksum })

// Clean up
instance.destroy()`,
    },
    {
      value: 'apple-pay',
      label: 'applePay.tsx',
      language: 'typescript',
      content: `
// Check support before initializing Apple Pay
const capabilities = await window.XMoney.getPaymentMethodCapabilities()
if (!capabilities.applePay.supported) {
  console.warn(capabilities.applePay.reason || 'Apple Pay not supported')
  return
}

// Mount the Apple Pay button
const instance = await window.XMoney.applePay({
  container: 'apple-pay-container', // id of the DOM element
  publicKey: 'your-public-key',
  orderPayload: payload,
  orderChecksum: checksum,
  options: {
    locale: 'en-US',
    appearance: {
      style: 'black', // 'black' | 'white' | 'white-outline'
      type: 'pay',    // 'buy' | 'pay' | 'check-out' | ...
      radius: 12,
    },
  },
  onReady: () => setIsApplePayReady(true),
  onPaymentProcessing: (processing) => setIsProcessing(processing),
  onPaymentComplete: (result) => {
    console.log('Apple Pay complete', result)
  },
  onError: (err) => console.error('Error', err),
})

// Update order amount when the cart changes
instance.updateOrder({ orderPayload, orderChecksum })

// Clean up
instance.destroy()`,
    },
    {
      value: 'server',
      label: 'server.ts',
      language: 'typescript',
      content: `import express from 'express'
const app = express()
app.use(express.json())

// POST /api/orders — create a payment order and return
// the signed payload + checksum for the frontend SDK
app.post('/api/orders', async (req, res) => {
  const { amount, currency, description } = req.body

  const response = await fetch('https://api.xmoney.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: \`Bearer \${process.env.XMONEY_API_KEY}\`,
    },
    body: JSON.stringify({
      amount,
      currency,          // e.g. 'EUR'
      description,
      publicKey: process.env.XMONEY_PUBLIC_KEY,
      returnUrl: 'https://yoursite.com/payment/complete',
      cancelUrl: 'https://yoursite.com/payment/cancel',
    }),
  })

  if (!response.ok) {
    return res.status(502).json({ error: 'Failed to create order' })
  }

  const order = await response.json()

  // Return only payload + checksum — never expose your API key
  res.json({
    payload: order.payload,
    checksum: order.checksum,
  })
})`,
    },
  ]

  const updateItemQuantity = (id: number, delta: number) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    )
  }

  const placeOrder = () => {
    if (!paymentCardRef.current) return
    paymentCardRef.current.submit()
  }

  const payWithSavedCard = () => {
    if (!savedCardPaymentRef.current || !selectedSavedCardId) return
    setIsProcessing(true)
    savedCardPaymentRef.current.pay({ cardId: selectedSavedCardId })
  }

  return (
    <div className='relative h-[calc(100vh-56px)] overflow-hidden'>
      <div className='h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10'>
        <div className='flex items-center gap-2'>
          <div className='h-8 w-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center'>
            <LayoutTemplate className='w-4 h-4' />
          </div>
          <h1 className='text-sm font-semibold text-slate-900'>
            Embedded Checkout
          </h1>
        </div>
        <div className='flex items-center gap-2'>
          <TestCards />

          <button
            onClick={() => {
              window.location.reload()
            }}
            className='p-2 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-900 transition-colors'
            title='Refresh'
          >
            <RotateCw
              className={cn('w-4 h-4', loading ? 'animate-spin' : '')}
            />
          </button>
        </div>
      </div>
      {/* Checkout content — full width, scrollable */}
      <div className='h-full overflow-y-auto'>
        <div className='mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6'>
          {error && (
            <div className='flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
              <AlertCircle className='mt-0.5 h-4 w-4' />
              <div className='flex-1'>{error}</div>
              <Button variant='ghost' size='sm' onClick={() => setError(null)}>
                Dismiss
              </Button>
            </div>
          )}

          {paymentResult && <PaymentSuccessCard result={paymentResult} />}

          {loading ? (
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start'>
              {/* Delivery skeleton */}
              <Card className='overflow-hidden border-border/70 lg:col-span-4 pt-0'>
                <CardHeader className='border-b bg-gradient-to-r from-primary/[0.06] to-transparent pt-6'>
                  <div className='flex items-center gap-3'>
                    <div className='h-8 w-8 animate-pulse rounded-full bg-muted' />
                    <div className='space-y-1.5'>
                      <div className='h-4 w-32 animate-pulse rounded bg-muted' />
                      <div className='h-3 w-44 animate-pulse rounded bg-muted' />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4 pt-6'>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-1.5'>
                      <div className='h-3 w-16 animate-pulse rounded bg-muted' />
                      <div className='h-9 animate-pulse rounded-md bg-muted' />
                    </div>
                    <div className='space-y-1.5'>
                      <div className='h-3 w-16 animate-pulse rounded bg-muted' />
                      <div className='h-9 animate-pulse rounded-md bg-muted' />
                    </div>
                  </div>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className='space-y-1.5'>
                      <div className='h-3 w-20 animate-pulse rounded bg-muted' />
                      <div className='h-9 animate-pulse rounded-md bg-muted' />
                    </div>
                  ))}
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-1.5'>
                      <div className='h-3 w-12 animate-pulse rounded bg-muted' />
                      <div className='h-9 animate-pulse rounded-md bg-muted' />
                    </div>
                    <div className='space-y-1.5'>
                      <div className='h-3 w-16 animate-pulse rounded bg-muted' />
                      <div className='h-9 animate-pulse rounded-md bg-muted' />
                    </div>
                  </div>
                  <div className='space-y-1.5'>
                    <div className='h-3 w-24 animate-pulse rounded bg-muted' />
                    <div className='h-16 animate-pulse rounded-md bg-muted' />
                  </div>
                  <div className='h-12 animate-pulse rounded-lg bg-muted' />
                </CardContent>
              </Card>

              {/* Payment skeleton */}
              <Card className='overflow-hidden border-border/70 lg:col-span-4 pt-0'>
                <CardHeader className='border-b bg-gradient-to-r from-sky-50 to-transparent pt-6'>
                  <div className='flex items-center gap-3'>
                    <div className='h-8 w-8 animate-pulse rounded-full bg-muted' />
                    <div className='space-y-1.5'>
                      <div className='h-4 w-28 animate-pulse rounded bg-muted' />
                      <div className='h-3 w-40 animate-pulse rounded bg-muted' />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3 pt-6'>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className='h-14 animate-pulse rounded-2xl bg-muted'
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Order skeleton */}
              <Card className='overflow-hidden border-border/70 lg:col-span-4 pt-0'>
                <CardHeader className='border-b bg-gradient-to-r from-amber-50 to-transparent pt-6'>
                  <div className='flex items-center gap-3'>
                    <div className='h-8 w-8 animate-pulse rounded-full bg-muted' />
                    <div className='space-y-1.5'>
                      <div className='h-4 w-28 animate-pulse rounded bg-muted' />
                      <div className='h-3 w-32 animate-pulse rounded bg-muted' />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4 pt-6'>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className='flex items-center justify-between gap-3'
                    >
                      <div className='flex flex-1 gap-2'>
                        <div className='h-7 w-7 animate-pulse rounded bg-muted' />
                        <div className='space-y-1.5'>
                          <div className='h-3.5 w-24 animate-pulse rounded bg-muted' />
                          <div className='h-3 w-16 animate-pulse rounded bg-muted' />
                        </div>
                      </div>
                      <div className='h-7 w-20 animate-pulse rounded-md bg-muted' />
                    </div>
                  ))}
                  <div className='h-px animate-pulse bg-muted' />
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <div className='h-3.5 w-14 animate-pulse rounded bg-muted' />
                      <div className='h-3.5 w-16 animate-pulse rounded bg-muted' />
                    </div>
                    <div className='flex justify-between'>
                      <div className='h-3.5 w-12 animate-pulse rounded bg-muted' />
                      <div className='h-3.5 w-10 animate-pulse rounded bg-muted' />
                    </div>
                    <div className='h-px animate-pulse bg-muted' />
                    <div className='flex justify-between pt-1'>
                      <div className='h-5 w-10 animate-pulse rounded bg-muted' />
                      <div className='h-7 w-24 animate-pulse rounded bg-muted' />
                    </div>
                  </div>
                  <div className='h-12 animate-pulse rounded-xl bg-muted' />
                </CardContent>
              </Card>
            </div>
          ) : !paymentResult ? (
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start'>
              {/* Delivery Details */}
              <Card className='overflow-hidden border-border/70 lg:col-span-4 pt-0'>
                <CardHeader className='border-b bg-gradient-to-r from-primary/[0.06] to-transparent pt-6'>
                  <CardTitle className='flex items-center gap-3'>
                    <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary'>
                      <MapPin className='h-4 w-4' />
                    </span>
                    Delivery Details
                  </CardTitle>
                  <CardDescription>
                    Where should we deliver your pizza?
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4 pt-6'>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-1.5'>
                      <Label
                        htmlFor='first-name'
                        className='text-xs uppercase text-muted-foreground'
                      >
                        First Name
                      </Label>
                      <Input
                        id='first-name'
                        placeholder='John'
                        value={deliveryForm.firstName}
                        onChange={(e) =>
                          setDeliveryForm((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label
                        htmlFor='last-name'
                        className='text-xs uppercase text-muted-foreground'
                      >
                        Last Name
                      </Label>
                      <Input
                        id='last-name'
                        placeholder='Doe'
                        value={deliveryForm.lastName}
                        onChange={(e) =>
                          setDeliveryForm((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='email'
                      className='text-xs uppercase text-muted-foreground'
                    >
                      Email
                    </Label>
                    <Input
                      id='email'
                      type='email'
                      placeholder='john@example.com'
                      value={deliveryForm.email}
                      onChange={(e) =>
                        setDeliveryForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='phone'
                      className='text-xs uppercase text-muted-foreground'
                    >
                      Phone
                    </Label>
                    <Input
                      id='phone'
                      placeholder='+1 (555) 000-0000'
                      value={deliveryForm.phone}
                      onChange={(e) =>
                        setDeliveryForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='address'
                      className='text-xs uppercase text-muted-foreground'
                    >
                      Delivery Address
                    </Label>
                    <Input
                      id='address'
                      placeholder='123 Main Street, Apt 4B'
                      value={deliveryForm.address}
                      onChange={(e) =>
                        setDeliveryForm((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-1.5'>
                      <Label
                        htmlFor='city'
                        className='text-xs uppercase text-muted-foreground'
                      >
                        City
                      </Label>
                      <Input
                        id='city'
                        placeholder='New York'
                        value={deliveryForm.city}
                        onChange={(e) =>
                          setDeliveryForm((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label
                        htmlFor='zip-code'
                        className='text-xs uppercase text-muted-foreground'
                      >
                        ZIP Code
                      </Label>
                      <Input
                        id='zip-code'
                        placeholder='10001'
                        value={deliveryForm.zipCode}
                        onChange={(e) =>
                          setDeliveryForm((prev) => ({
                            ...prev,
                            zipCode: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='notes'
                      className='text-xs uppercase text-muted-foreground'
                    >
                      Delivery Notes
                    </Label>
                    <textarea
                      id='notes'
                      className='border-input focus-visible:ring-ring/50 focus-visible:ring-[3px] h-16 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none'
                      placeholder='Ring the bell, leave at the door...'
                      value={deliveryForm.notes}
                      onChange={(e) =>
                        setDeliveryForm((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className='flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-emerald-700'>
                    <Clock3 className='mt-0.5 h-4 w-4 shrink-0' />
                    <div className='text-xs'>
                      <p className='font-semibold'>
                        Estimated delivery: 25-35 min
                      </p>
                      <p>Free delivery on orders over 30 EUR</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className='overflow-hidden border-border/70 lg:col-span-4 pt-0'>
                <CardHeader className='border-b bg-gradient-to-r from-sky-50 to-transparent pt-6'>
                  <CardTitle className='flex items-center gap-3'>
                    <span className='flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600'>
                      <CreditCard className='h-4 w-4' />
                    </span>
                    Payment Method
                  </CardTitle>
                  <CardDescription>
                    Choose how you'd like to pay
                  </CardDescription>
                </CardHeader>

                <CardContent className='space-y-3 pt-6'>
                  <>
                    {/* Credit / Debit Card */}
                    <div
                      className={`rounded-2xl border p-4 transition-colors ${
                        activeMethod === 'card'
                          ? 'border-primary/70 bg-primary/5'
                          : 'border-border'
                      }`}
                    >
                      <button
                        type='button'
                        className='flex w-full items-center gap-3 text-left'
                        onClick={() => setActiveMethod('card')}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            activeMethod === 'card'
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground/40'
                          }`}
                        >
                          {activeMethod === 'card' && (
                            <span className='h-2 w-2 rounded-full bg-white' />
                          )}
                        </span>
                        <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                          <CreditCard className='h-4 w-4' />
                        </span>
                        <span className='min-w-0 flex-1'>
                          <span className='block text-sm font-semibold'>
                            Credit / Debit Card
                          </span>
                          <span className='block text-xs text-muted-foreground'>
                            Visa, Mastercard, Maestro
                          </span>
                        </span>
                        {activeMethod === 'card' ? (
                          <ChevronUp className='h-4 w-4 text-muted-foreground' />
                        ) : (
                          <ChevronDown className='h-4 w-4 text-muted-foreground' />
                        )}
                      </button>

                      {activeMethod === 'card' && (
                        <>
                          <Separator className='my-4' />
                          {!isCardReady && (
                            <div className='space-y-3'>
                              <div className='h-10 animate-pulse rounded-lg bg-muted' />
                              <div className='grid grid-cols-2 gap-3'>
                                <div className='h-10 animate-pulse rounded-lg bg-muted' />
                                <div className='h-10 animate-pulse rounded-lg bg-muted' />
                              </div>
                              <div className='h-10 animate-pulse rounded-lg bg-muted' />
                              <div className='h-11 animate-pulse rounded-xl bg-muted' />
                            </div>
                          )}
                          <div
                            id='advanced-checkout-card'
                            className={!isCardReady ? 'hidden' : ''}
                          />
                        </>
                      )}
                    </div>

                    {/* Saved Cards */}
                    <div
                      className={`rounded-2xl border p-4 transition-colors ${
                        activeMethod === 'saved-card'
                          ? 'border-primary/70 bg-primary/5'
                          : 'border-border'
                      }`}
                    >
                      <button
                        type='button'
                        className='flex w-full items-center gap-3 text-left'
                        onClick={() => setActiveMethod('saved-card')}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            activeMethod === 'saved-card'
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground/40'
                          }`}
                        >
                          {activeMethod === 'saved-card' && (
                            <span className='h-2 w-2 rounded-full bg-white' />
                          )}
                        </span>
                        <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-lime-100 text-lime-700'>
                          <Wallet className='h-4 w-4' />
                        </span>
                        <span className='min-w-0 flex-1'>
                          <span className='block text-sm font-semibold'>
                            Saved Cards
                          </span>
                          <span className='block text-xs text-muted-foreground'>
                            Pay with a previously saved card
                          </span>
                        </span>
                        {activeMethod === 'saved-card' ? (
                          <ChevronUp className='h-4 w-4 text-muted-foreground' />
                        ) : (
                          <ChevronDown className='h-4 w-4 text-muted-foreground' />
                        )}
                      </button>

                      {activeMethod === 'saved-card' && (
                        <>
                          <Separator className='my-4' />
                          {isSavedCardsLoading || !isSavedCardReady ? (
                            <div className='space-y-2'>
                              {[0, 1].map((i) => (
                                <div
                                  key={i}
                                  className='h-14 animate-pulse rounded-xl bg-muted'
                                />
                              ))}
                            </div>
                          ) : savedCards.length === 0 ? (
                            <p className='py-4 text-center text-sm text-muted-foreground'>
                              No saved cards found.
                            </p>
                          ) : (
                            <div className='space-y-2'>
                              {savedCards.map((card) => {
                                const last4 = card.cardNumber
                                  .replace(/\*/g, '')
                                  .slice(-4)
                                const isSelected =
                                  selectedSavedCardId === card.id
                                return (
                                  <button
                                    key={card.id}
                                    type='button'
                                    onClick={() =>
                                      setSelectedSavedCardId(card.id)
                                    }
                                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                                      isSelected
                                        ? 'border-primary/70 bg-primary/5 shadow-sm'
                                        : 'border-border hover:border-primary/40 hover:bg-muted/40'
                                    }`}
                                  >
                                    <div className='flex items-center gap-3'>
                                      <span
                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                                          isSelected
                                            ? 'border-primary bg-primary'
                                            : 'border-muted-foreground/40'
                                        }`}
                                      >
                                        {isSelected && (
                                          <span className='h-1.5 w-1.5 rounded-full bg-white' />
                                        )}
                                      </span>
                                      <div className='flex min-w-0 flex-1 items-center gap-2'>
                                        <CardBrandBadge type={card.type} />
                                        <span className='text-sm font-medium'>
                                          •••• •••• •••• {last4}
                                        </span>
                                      </div>
                                      <span className='text-xs text-muted-foreground'>
                                        {card.expiryMonth}/{card.expiryYear}
                                      </span>
                                    </div>
                                    {card.nameOnCard && (
                                      <p className='mt-1.5 pl-7 text-xs text-muted-foreground'>
                                        {card.nameOnCard}
                                      </p>
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Google Pay */}
                    {capabilities?.googlePay?.supported !== false && (
                      <div
                        className={`rounded-2xl border p-4 transition-colors ${
                          activeMethod === 'google-pay'
                            ? 'border-primary/70 bg-primary/5'
                            : 'border-border'
                        }`}
                      >
                        <button
                          type='button'
                          className='flex w-full items-center gap-3 text-left'
                          onClick={() => setActiveMethod('google-pay')}
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                              activeMethod === 'google-pay'
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground/40'
                            }`}
                          >
                            {activeMethod === 'google-pay' && (
                              <span className='h-2 w-2 rounded-full bg-white' />
                            )}
                          </span>
                          <GooglePayBadge />
                          <span className='min-w-0 flex-1'>
                            <span className='block text-sm font-semibold'>
                              Google Pay
                            </span>
                            <span className='block text-xs text-muted-foreground'>
                              Fast checkout with Google
                            </span>
                          </span>
                          {activeMethod === 'google-pay' ? (
                            <ChevronUp className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <ChevronDown className='h-4 w-4 text-muted-foreground' />
                          )}
                        </button>
                        {activeMethod === 'google-pay' && (
                          <>
                            <Separator className='my-4' />
                            <p className='text-center text-sm text-muted-foreground'>
                              The Google Pay button will appear in the order
                              summary.
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    {/* Apple Pay */}
                    {capabilities?.applePay?.supported !== false && (
                      <div
                        className={`rounded-2xl border p-4 transition-colors ${
                          activeMethod === 'apple-pay'
                            ? 'border-primary/70 bg-primary/5'
                            : 'border-border'
                        }`}
                      >
                        <button
                          type='button'
                          className='flex w-full items-center gap-3 text-left'
                          onClick={() => setActiveMethod('apple-pay')}
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                              activeMethod === 'apple-pay'
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground/40'
                            }`}
                          >
                            {activeMethod === 'apple-pay' && (
                              <span className='h-2 w-2 rounded-full bg-white' />
                            )}
                          </span>
                          <ApplePayBadge />
                          <span className='min-w-0 flex-1'>
                            <span className='block text-sm font-semibold'>
                              Apple Pay
                            </span>
                            <span className='block text-xs text-muted-foreground'>
                              Secure payment with Apple
                            </span>
                          </span>
                          {activeMethod === 'apple-pay' ? (
                            <ChevronUp className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <ChevronDown className='h-4 w-4 text-muted-foreground' />
                          )}
                        </button>
                        {activeMethod === 'apple-pay' && (
                          <>
                            <Separator className='my-4' />
                            <p className='text-center text-sm text-muted-foreground'>
                              The Apple Pay button will appear in the order
                              summary.
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className='sticky top-20 overflow-hidden border-border/70 lg:col-span-4 pt-0'>
                <CardHeader className='border-b bg-gradient-to-r from-amber-50 to-transparent pt-6'>
                  <CardTitle className='flex items-center gap-3'>
                    <span className='flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700'>
                      <ShoppingCart className='h-4 w-4' />
                    </span>
                    Order Summary
                  </CardTitle>
                  <CardDescription>
                    {orderItems.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                    items in your cart
                  </CardDescription>
                </CardHeader>

                <CardContent className='space-y-4 pt-6'>
                  {orderItems.map((item) => (
                    <div
                      key={item.id}
                      className='flex items-start justify-between gap-3'
                    >
                      <div className='flex min-w-0 flex-1 gap-2'>
                        <span className='text-xl'>{item.emoji}</span>
                        <div className='min-w-0'>
                          <p className='truncate text-sm font-semibold'>
                            {item.name}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {item.price.toFixed(2)} EUR
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <button
                          type='button'
                          className='flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted'
                          onClick={() => updateItemQuantity(item.id, -1)}
                        >
                          <Minus className='h-3 w-3' />
                        </button>
                        <span className='w-4 text-center text-sm font-medium'>
                          {item.quantity}
                        </span>
                        <button
                          type='button'
                          className='flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted'
                          onClick={() => updateItemQuantity(item.id, 1)}
                        >
                          <Plus className='h-3 w-3' />
                        </button>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className='space-y-2 text-sm'>
                    <div className='flex items-center justify-between text-muted-foreground'>
                      <span>Subtotal</span>
                      <span>{subtotal.toFixed(2)} EUR</span>
                    </div>
                    <div className='flex items-center justify-between text-muted-foreground'>
                      <span>Delivery</span>
                      <span
                        className={
                          deliveryFee === 0 ? 'font-semibold text-lime-600' : ''
                        }
                      >
                        {deliveryFee === 0
                          ? 'FREE'
                          : `${deliveryFee.toFixed(2)} EUR`}
                      </span>
                    </div>
                    <Separator />
                    <div className='flex items-center justify-between font-bold'>
                      <span className='text-xl'>Total</span>
                      <div className='flex items-center gap-2'>
                        {isUpdatingOrder && (
                          <Loader2 className='h-4 w-4 animate-spin text-primary' />
                        )}
                        <span className='text-[30px] leading-none'>
                          {total.toFixed(2)} EUR
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Wallet payment containers — always mounted so getElementById never misses */}
                  <div
                    className={
                      activeMethod === 'google-pay' ? 'block' : 'hidden'
                    }
                  >
                    <div className='relative h-12'>
                      {!isGooglePayReady && (
                        <div className='absolute inset-0 animate-pulse rounded-xl bg-muted' />
                      )}
                      <div
                        id='advanced-checkout-google-pay'
                        className='min-h-[48px]'
                        style={{ opacity: isGooglePayReady ? 1 : 0 }}
                      />
                    </div>
                  </div>
                  <div
                    className={
                      activeMethod === 'apple-pay' ? 'block' : 'hidden'
                    }
                  >
                    <div className='relative h-12'>
                      {!isApplePayReady && (
                        <div className='absolute inset-0 animate-pulse rounded-xl bg-muted' />
                      )}
                      <div
                        id='advanced-checkout-apple-pay'
                        className='min-h-[48px]'
                        style={{ opacity: isApplePayReady ? 1 : 0 }}
                      />
                    </div>
                  </div>

                  {/* Fixed-height button zone — skeleton → button, no layout shift */}
                  {(activeMethod === 'card' ||
                    activeMethod === 'saved-card') && (
                    <div className='h-12'>
                      {!isActiveMethodReady ? (
                        <div className='h-12 animate-pulse rounded-xl bg-muted' />
                      ) : isProcessing ? (
                        <Button
                          className='h-12 w-full rounded-xl text-base'
                          disabled
                        >
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Processing…
                        </Button>
                      ) : activeMethod === 'card' ? (
                        <Button
                          className='h-12 w-full rounded-xl text-base'
                          disabled={isUpdatingOrder}
                          onClick={placeOrder}
                        >
                          <Lock className='mr-2 h-4 w-4' />
                          Place Order
                        </Button>
                      ) : (
                        <Button
                          className='h-12 w-full rounded-xl text-base'
                          disabled={isUpdatingOrder || !selectedSavedCardId}
                          onClick={payWithSavedCard}
                        >
                          <Lock className='mr-2 h-4 w-4' />
                          Pay with Saved Card
                        </Button>
                      )}
                    </div>
                  )}

                  <p className='flex items-center justify-center gap-2 text-xs text-muted-foreground'>
                    <Lock className='h-3.5 w-3.5 text-lime-600' />
                    Secured by xMoney
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </div>

      {/* Toggle button — floating bottom-right */}
      <button
        onClick={() => setCodePanelOpen((o) => !o)}
        className='absolute bottom-6 right-6 z-30 hidden lg:flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg ring-1 ring-slate-700 hover:bg-slate-800 transition-colors'
      >
        <Code2 className='w-4 h-4 text-blue-400' />
        {codePanelOpen ? 'Hide code' : 'View code'}
      </button>

      {/* Backdrop */}
      {codePanelOpen && (
        <div
          className='absolute inset-0 z-20 bg-black/20 backdrop-blur-[1px] hidden lg:block'
          onClick={() => setCodePanelOpen(false)}
        />
      )}

      {/* Code panel — overlay from right */}
      <div
        className={`absolute right-0 top-0 z-20 hidden lg:flex h-full w-[720px] flex-col bg-[#0F172A] border-l border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out ${
          codePanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <Tabs
          value={activeCodeTab}
          onValueChange={setActiveCodeTab}
          className='flex flex-col h-full'
        >
          {/* Header */}
          <div className='bg-[#1E293B] border-b border-slate-700/50 px-4 flex items-center justify-between shrink-0 h-12'>
            <div className='flex items-center h-full'>
              <TabsList className='bg-transparent border-0 p-0 h-full gap-5'>
                {codeTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className='h-full px-0 gap-1.5 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-blue-400 data-[state=active]:text-blue-400 text-slate-400 hover:text-slate-300 transition-all rounded-none bg-transparent data-[state=active]:bg-transparent shadow-none'
                  >
                    <FileCode className='w-3.5 h-3.5' />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => {
                  const content =
                    codeTabs.find((t) => t.value === activeCodeTab)?.content ||
                    ''
                  navigator.clipboard.writeText(content)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className='text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono bg-white/5 hover:bg-white/10 px-2 py-1 rounded cursor-pointer'
              >
                {copied ? (
                  <Check className='w-3.5 h-3.5' />
                ) : (
                  <Copy className='w-3.5 h-3.5' />
                )}
                <span>Copy</span>
              </button>
              <button
                onClick={() => setCodePanelOpen(false)}
                className='text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          </div>

          {/* Code content */}
          <div className='flex-1 overflow-auto flex flex-col'>
            {codeTabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className='m-0 flex-1 flex flex-col min-h-0'
              >
                <SyntaxHighlighter
                  language={tab.language}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    background: 'transparent',
                    fontFamily:
                      'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
                    height: '100%',
                  }}
                  showLineNumbers={true}
                  lineNumberStyle={{
                    minWidth: '2.5em',
                    paddingRight: '1em',
                    color: '#4b5563',
                    textAlign: 'right',
                    fontSize: '12px',
                    opacity: 0.5,
                  }}
                  wrapLines={true}
                >
                  {tab.content}
                </SyntaxHighlighter>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PaymentSuccessCard
// ---------------------------------------------------------------------------

interface DetailRowProps {
  label: string
  value: string
  mono?: boolean
  badge?: boolean
  badgeFailed?: boolean
}

function DetailRow({ label, value, mono, badge, badgeFailed }: DetailRowProps) {
  return (
    <div className='flex items-center justify-between py-2.5 first:pt-0 last:pb-0'>
      <span className='text-sm text-[var(--color-neutral-500)]'>{label}</span>
      {badge ? (
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeFailed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
        >
          {value}
        </span>
      ) : (
        <span
          className={`text-sm font-medium text-[var(--color-neutral-800)] ${mono ? 'font-mono' : ''}`}
        >
          {value}
        </span>
      )}
    </div>
  )
}

function formatSuccessDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTransactionStatus(status: string): string {
  if (status === 'complete-ok') return 'Completed'
  return 'Failed'
}

function PaymentSuccessCard({ result }: { result: TransactionDetails }) {
  const [expanded, setExpanded] = useState(false)
  const isSuccess = result.transactionStatus === 'complete-ok'

  return (
    <div className='w-full mx-auto max-w-md mt-6 animate-[slideInDown_0.35s_ease]'>
      <div className='overflow-hidden w-full rounded-2xl border border-[var(--color-neutral-100)] bg-white shadow-[0_8px_40px_rgba(22,20,26,0.10)]'>
        {/* Header */}
        <div
          className={`px-6 py-8 text-center text-white bg-gradient-to-br ${
            isSuccess
              ? 'from-green-400 to-green-500'
              : 'from-red-400 to-red-500'
          }`}
        >
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur'>
            <svg
              className='h-8 w-8'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth={2.5}
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              {isSuccess ? (
                <polyline points='20 6 9 17 4 12' />
              ) : (
                <>
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </>
              )}
            </svg>
          </div>
          <h3 className='m-0 text-xl font-bold'>
            {isSuccess ? 'Payment Successful' : 'Payment Failed'}
          </h3>
          <p className='m-0 mt-1 text-sm text-white/80'>
            {isSuccess
              ? 'Your order has been confirmed'
              : 'Your payment could not be processed'}
          </p>
          <div className='mt-5'>
            <span className='text-3xl font-bold tracking-tight'>
              {result.amount} {result.currencyKey}
            </span>
          </div>
        </div>

        {/* Main details */}
        <div className='flex flex-col gap-4 p-6'>
          <div className='divide-y divide-[var(--color-neutral-100)]'>
            <DetailRow label='Transaction ID' value={`#${result.id}`} mono />
            <DetailRow
              label='Order ID'
              value={`#${result.externalOrderId}`}
              mono
            />
            <DetailRow
              label='Status'
              value={formatTransactionStatus(result.transactionStatus)}
              badge
              badgeFailed={!isSuccess}
            />
            {result.customerData?.creationDate && (
              <DetailRow
                label='Date'
                value={formatSuccessDate(result.customerData.creationDate)}
              />
            )}
            {result.customerData?.email && (
              <DetailRow
                label='Receipt sent to'
                value={result.customerData.email}
              />
            )}
          </div>

          {/* Expand toggle */}
          <button
            type='button'
            onClick={() => setExpanded((v) => !v)}
            className='flex w-full cursor-pointer items-center justify-between border-0 bg-transparent px-0 py-2 text-sm font-medium
              text-[var(--color-neutral-500)] transition-colors duration-200 hover:text-[var(--color-neutral-700)]'
          >
            <span>{expanded ? 'Hide details' : 'More details'}</span>
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M6 9l6 6 6-6' />
            </svg>
          </button>

          {/* Expanded details */}
          {expanded && (
            <div className='divide-y divide-[var(--color-neutral-100)] border-t border-[var(--color-neutral-100)]'>
              {result.customerData?.firstName && (
                <DetailRow
                  label='Customer'
                  value={`${result.customerData.firstName} ${result.customerData.lastName}`}
                />
              )}
              {result.customerData?.phone && (
                <DetailRow label='Phone' value={result.customerData.phone} />
              )}
              {result.customerData?.country && (
                <DetailRow
                  label='Country'
                  value={result.customerData.country}
                />
              )}
              {result.amountInEuro && (
                <DetailRow
                  label='Amount (EUR)'
                  value={`€${result.amountInEuro}`}
                />
              )}
              {result.description && (
                <DetailRow label='Description' value={result.description} />
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className='flex flex-col gap-3 px-6 pb-6'>
          <button
            type='button'
            onClick={() => window.location.reload()}
            className='flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-neutral-200)]
              bg-[var(--color-neutral-50)] px-6 py-3 text-sm font-semibold
              text-[var(--color-neutral-700)] transition-all duration-200
              hover:border-[var(--color-neutral-300)] hover:bg-[var(--color-neutral-100)] active:scale-[0.98]'
          >
            <svg
              className='h-4 w-4'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' />
              <path d='M3 3v5h5' />
            </svg>
            Try new transaction
          </button>
          <div className='flex items-center justify-center gap-2 rounded-xl border border-green-100 bg-green-50 py-3'>
            <svg
              className='h-4 w-4'
              viewBox='0 0 24 24'
              fill='none'
              stroke='var(--color-green-600)'
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <rect x='3' y='11' width='18' height='11' rx='2' ry='2' />
              <path d='M7 11V7a5 5 0 0 1 10 0v4' />
            </svg>
            <span className='text-xs font-medium text-green-700'>
              Secured by xMoney
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
