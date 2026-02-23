import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getApiCredentials } from '@/lib/credentials'
import {
  Settings,
  Globe,
  Palette,
  RefreshCw,
  Layers,
  AlertCircle,
  CreditCard,
  Loader2,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ThreeColumnLayout,
  type CodeTab,
} from '@/components/three-column-layout'
import type { XMoneyPaymentCardConfig } from '@/types/xmoney-sdk/payment-card-sdk.types'
import type { XMoneyGooglePayConfig } from '@/types/xmoney-sdk/google-pay-sdk.types'
import type { XMoneyApplePayConfig } from '@/types/xmoney-sdk/apple-pay-sdk.types'
import type { XMoneySavedCardPaymentInstance } from '@/types/xmoney-sdk/saved-card-payment-sdk.types'
import type { XMoneyBaseInstance } from '@/types/xmoney-sdk/sdk-base.types'
import type { PaymentMethodCapabilities } from '@/types/xmoney-sdk/payment-method-capabilities.types'
import type { Card as SavedCard } from '@/types/checkout.types'

export const Route = createFileRoute('/embeddable-components/runtime-updates')({
  component: RuntimeUpdatesPage,
})

type EmbeddableType =
  | 'paymentCard'
  | 'googlePay'
  | 'applePay'
  | 'savedCardPayment'

const CUSTOMER_IDENTIFIER = 'customer-12333'

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
    <span className='rounded bg-slate-100 px-1 py-0.5 text-[10px] font-bold text-slate-500'>
      {type.toUpperCase()}
    </span>
  )
}

function RuntimeUpdatesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentResult, setPaymentResult] = useState<{
    status: 'success' | 'error'
    message?: string
    data?: any
  } | null>(null)
  const sdkInstanceRef = useRef<XMoneyBaseInstance | null>(null)
  const savedCardPaymentInstanceRef =
    useRef<XMoneySavedCardPaymentInstance | null>(null)

  const [embeddableType, setEmbeddableType] =
    useState<EmbeddableType>('paymentCard')

  const [amount, setAmount] = useState(100)
  const [currency, setCurrency] = useState('EUR')

  const [locale, setLocale] = useState<'en-US' | 'el-GR' | 'ro-RO'>('en-US')

  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'custom'>(
    'light'
  )
  const [colorPrimary, setColorPrimary] = useState('#4f46e5')

  const [appliedAmount, setAppliedAmount] = useState(100)
  const [appliedCurrency, setAppliedCurrency] = useState('EUR')
  const [appliedLocale, setAppliedLocale] = useState<
    'en-US' | 'el-GR' | 'ro-RO'
  >('en-US')
  const [appliedThemeMode, setAppliedThemeMode] = useState<
    'light' | 'dark' | 'custom'
  >('light')
  const [appliedColorPrimary, setAppliedColorPrimary] = useState('#4f46e5')

  const [initData, setInitData] = useState<{
    publicKey: string
    payload: string
    checksum: string
  } | null>(null)

  const [capabilities, setCapabilities] =
    useState<PaymentMethodCapabilities | null>(null)
  const [isEmbeddableSupported, setIsEmbeddableSupported] = useState(true)
  const [unsupportedReason, setUnsupportedReason] = useState<string | null>(
    null
  )

  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<number | null>(
    null
  )
  const [isSavedCardsLoading, setIsSavedCardsLoading] = useState(false)
  const [savedCardPaymentStatus, setSavedCardPaymentStatus] = useState<
    'idle' | 'processing'
  >('idle')

  const supportsLocaleAndAppearance = embeddableType === 'paymentCard'
  const isWalletEmbeddable =
    embeddableType === 'googlePay' || embeddableType === 'applePay'

  const embeddableLabel = useMemo(() => {
    if (embeddableType === 'paymentCard') return 'Payment Card'
    if (embeddableType === 'googlePay') return 'Google Pay'
    if (embeddableType === 'applePay') return 'Apple Pay'
    return 'Saved Card Payment'
  }, [embeddableType])

  const fetchSavedCards = async (isMounted: () => boolean) => {
    setIsSavedCardsLoading(true)
    const { apiKey, isLive } = getApiCredentials()
    if (!apiKey) {
      if (isMounted()) setIsSavedCardsLoading(false)
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
      if (!isMounted()) return
      if (!response.ok) {
        setSavedCards([])
        setSelectedSavedCardId(null)
        return
      }
      const data = await response.json()
      if (!isMounted()) return
      const cards = Array.isArray(data.data) ? (data.data as SavedCard[]) : []
      setSavedCards(cards)
      setSelectedSavedCardId(cards[0]?.id ?? null)
    } catch {
      if (isMounted()) {
        setSavedCards([])
        setSelectedSavedCardId(null)
      }
    } finally {
      if (isMounted()) setIsSavedCardsLoading(false)
    }
  }

  const createAppearance = () => ({
    theme: themeMode,
    variables:
      themeMode === 'custom'
        ? {
            colorPrimary,
            borderRadius: '6px',
          }
        : undefined,
  })

  useEffect(() => {
    let mounted = true

    const initCheckout = async () => {
      setLoading(true)
      setError(null)
      setPaymentResult(null)
      setIsEmbeddableSupported(true)
      setUnsupportedReason(null)
      setSavedCardPaymentStatus('idle')
      setSavedCards([])
      setSelectedSavedCardId(null)
      setIsSavedCardsLoading(false)

      try {
        if (!window.XMoney) {
          throw new Error('XMoney SDK is not available')
        }

        if (isWalletEmbeddable) {
          const methodCapabilities =
            await window.XMoney.getPaymentMethodCapabilities()
          if (!mounted) return

          setCapabilities(methodCapabilities)

          const selectedCapabilities =
            embeddableType === 'googlePay'
              ? methodCapabilities.googlePay
              : methodCapabilities.applePay

          if (!selectedCapabilities.supported) {
            setIsEmbeddableSupported(false)
            setUnsupportedReason(
              selectedCapabilities.reason ||
                `${embeddableLabel} is not available on this browser/device.`
            )
            setLoading(false)
            return
          }
        }

        const { publicKey, apiKey } = getApiCredentials()

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            currency,
            description: `Runtime Updates Demo - ${embeddableLabel}`,
            publicKey,
            apiKey,
          }),
        })

        if (!response.ok) throw new Error('Failed to init checkout')
        const data = await response.json()

        if (!mounted) return

        setInitData({
          publicKey,
          payload: data.payload,
          checksum: data.checksum,
        })

        if (embeddableType === 'savedCardPayment') {
          savedCardPaymentInstanceRef.current =
            await window.XMoney.savedCardPayment({
              publicKey,
              orderPayload: data.payload,
              orderChecksum: data.checksum,
              onReady: () => {
                if (mounted) setLoading(false)
              },
              onError: (err: any) => {
                console.error('Payment error', err)
                if (mounted) {
                  setSavedCardPaymentStatus('idle')
                  setPaymentResult({
                    status: 'error',
                    message:
                      typeof err === 'string'
                        ? err
                        : (err?.message ?? 'Payment failed'),
                  })
                }
              },
              onPaymentComplete: (result: any) => {
                if (mounted) {
                  setSavedCardPaymentStatus('idle')
                  setPaymentResult({ status: 'success', data: result })
                }
              },
              onPaymentProcessing: (isProcessing: boolean) => {
                if (mounted)
                  setSavedCardPaymentStatus(
                    isProcessing ? 'processing' : 'idle'
                  )
              },
            })
          if (!mounted) return
          fetchSavedCards(() => mounted)
          return
        }

        const container = document.getElementById('runtime-updates-embeddable')
        if (!container) return
        container.innerHTML = ''

        const baseConfig = {
          container: 'runtime-updates-embeddable',
          publicKey,
          orderPayload: data.payload,
          orderChecksum: data.checksum,
          onReady: () => {
            if (mounted) setLoading(false)
            console.log(`${embeddableLabel} ready`)
          },
          onError: (err: any) => {
            console.error('Payment error', err)
            if (mounted) {
              setLoading(false)
              setPaymentResult({
                status: 'error',
                message: typeof err === 'string' ? err : 'Payment failed',
              })
            }
          },
          onPaymentComplete: (result: any) => {
            if (mounted) {
              setPaymentResult({ status: 'success', data: result })
            }
          },
        }

        if (embeddableType === 'paymentCard') {
          const sdkConfig: XMoneyPaymentCardConfig = {
            ...baseConfig,
            card: {
              validationMode: 'onBlur',
              submitButton: {
                type: 'pay',
              },
              savedCards: {
                enabled: false,
                optInVisible: false,
              },
            },
            options: {
              locale,
              appearance: createAppearance(),
            },
          }
          sdkInstanceRef.current = await window.XMoney.paymentCard(sdkConfig)
          return
        }

        if (embeddableType === 'googlePay') {
          const sdkConfig: XMoneyGooglePayConfig = {
            ...baseConfig,
            options: {
              locale,
              appearance: {
                color: themeMode === 'dark' ? 'white' : 'black',
                type: 'pay',
                radius: 12,
                borderType: 'no_border',
              },
            },
          }
          sdkInstanceRef.current = await window.XMoney.googlePay(sdkConfig)
          return
        }

        const sdkConfig: XMoneyApplePayConfig = {
          ...baseConfig,
          options: {
            locale,
            appearance: {
              style: themeMode === 'dark' ? 'white' : 'black',
              type: 'pay',
              radius: 12,
            },
          },
        }
        sdkInstanceRef.current = await window.XMoney.applePay(sdkConfig)
      } catch (err) {
        console.error(err)
        if (mounted) {
          setLoading(false)
          setError('Failed to initialize checkout')
        }
      }
    }

    initCheckout()

    return () => {
      mounted = false
      if (sdkInstanceRef.current) {
        try {
          sdkInstanceRef.current.destroy()
        } catch (e) {
          console.error(e)
        }
      }
      if (savedCardPaymentInstanceRef.current) {
        try {
          savedCardPaymentInstanceRef.current.destroy()
        } catch (e) {
          console.error(e)
        }
        savedCardPaymentInstanceRef.current = null
      }
    }
  }, [embeddableLabel, embeddableType, isWalletEmbeddable])

  const handleUpdateOrder = async () => {
    const instance =
      embeddableType === 'savedCardPayment'
        ? savedCardPaymentInstanceRef.current
        : sdkInstanceRef.current
    if (!instance) return

    try {
      const { publicKey, apiKey } = getApiCredentials()

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          description: 'Updated Order',
          publicKey,
          apiKey,
        }),
      })

      if (!response.ok) throw new Error('Failed to update order')
      const data = await response.json()

      instance.updateOrder({
        orderPayload: data.payload,
        orderChecksum: data.checksum,
      })
      setInitData({
        publicKey,
        payload: data.payload,
        checksum: data.checksum,
      })
      setAppliedAmount(amount)
      setAppliedCurrency(currency)
    } catch (err) {
      console.error('Failed to update order', err)
      setError('Failed to update order')
    }
  }

  const handleUpdateLocale = () => {
    if (!supportsLocaleAndAppearance || !sdkInstanceRef.current) return
    ;(sdkInstanceRef.current as any).updateLocale(locale)
    setAppliedLocale(locale)
  }

  const handleUpdateAppearance = () => {
    if (!supportsLocaleAndAppearance || !sdkInstanceRef.current) return
    ;(sdkInstanceRef.current as any).updateAppearance(createAppearance())
    setAppliedThemeMode(themeMode)
    setAppliedColorPrimary(colorPrimary)
  }

  const codeTabs: CodeTab[] = [
    {
      value: 'client',
      label: `${embeddableType}.tsx`,
      language: 'javascript',
      content:
        embeddableType === 'paymentCard'
          ? `// Initialize the Payment Card component
const checkout = await window.XMoney.paymentCard({
  container: 'runtime-updates-embeddable',
  publicKey: '${initData?.publicKey || '<YOUR_PUBLIC_KEY>'}',
  orderPayload: '${initData?.payload ? initData.payload.substring(0, 30) + '...' : '<YOUR_ORDER_PAYLOAD>'}',
  orderChecksum: '${initData?.checksum ? initData.checksum.substring(0, 30) + '...' : '<YOUR_ORDER_CHECKSUM>'}',
  options: {
    locale: '${appliedLocale}',
    appearance: {
      theme: '${appliedThemeMode}',
      ${appliedThemeMode === 'custom' ? `variables: { colorPrimary: '${appliedColorPrimary}' }` : ''}
    }
  }
})

// Runtime updates
checkout.updateOrder({ orderPayload: '<NEW_PAYLOAD>', orderChecksum: '<NEW_CHECKSUM>' })
checkout.updateLocale('ro-RO')
checkout.updateAppearance({ theme: 'dark' })`
          : embeddableType === 'savedCardPayment'
            ? `// Initialize Saved Card Payment (no container needed)
const checkout = await window.XMoney.savedCardPayment({
  publicKey: '${initData?.publicKey || '<YOUR_PUBLIC_KEY>'}',
  orderPayload: '${initData?.payload ? initData.payload.substring(0, 30) + '...' : '<YOUR_ORDER_PAYLOAD>'}',
  orderChecksum: '${initData?.checksum ? initData.checksum.substring(0, 30) + '...' : '<YOUR_ORDER_CHECKSUM>'}',
  onPaymentComplete: (result) => console.log('Payment complete', result),
  onError: (err) => console.error('Payment error', err),
})

// Trigger payment with selected saved card
checkout.pay({ cardId: ${selectedSavedCardId ?? '<CARD_ID>'} })

// Runtime update - change the order amount/currency
checkout.updateOrder({ orderPayload: '<NEW_PAYLOAD>', orderChecksum: '<NEW_CHECKSUM>' })`
            : embeddableType === 'googlePay'
              ? `// Check support before initializing Google Pay
const capabilities = await window.XMoney.getPaymentMethodCapabilities()
if (!capabilities.googlePay.supported) {
  console.warn(capabilities.googlePay.reason || 'Google Pay not supported')
  return
}

// Initialize Google Pay component
const checkout = await window.XMoney.googlePay({
  container: 'runtime-updates-embeddable',
  publicKey: '${initData?.publicKey || '<YOUR_PUBLIC_KEY>'}',
  orderPayload: '${initData?.payload ? initData.payload.substring(0, 30) + '...' : '<YOUR_ORDER_PAYLOAD>'}',
  orderChecksum: '${initData?.checksum ? initData.checksum.substring(0, 30) + '...' : '<YOUR_ORDER_CHECKSUM>'}',
  options: {
    locale: '${appliedLocale}',
    appearance: { color: '${appliedThemeMode === 'dark' ? 'white' : 'black'}', type: 'pay', radius: 12, borderType: 'no_border' }
  }
})

// Runtime updates
checkout.updateOrder({ orderPayload: '<NEW_PAYLOAD>', orderChecksum: '<NEW_CHECKSUM>' })
// Google Pay instance supports updateOrder. For locale/appearance changes, re-initialize with new config.`
              : `// Check support before initializing Apple Pay
const capabilities = await window.XMoney.getPaymentMethodCapabilities()
if (!capabilities.applePay.supported) {
  console.warn(capabilities.applePay.reason || 'Apple Pay not supported')
  return
}

// Initialize Apple Pay component
const checkout = await window.XMoney.applePay({
  container: 'runtime-updates-embeddable',
  publicKey: '${initData?.publicKey || '<YOUR_PUBLIC_KEY>'}',
  orderPayload: '${initData?.payload ? initData.payload.substring(0, 30) + '...' : '<YOUR_ORDER_PAYLOAD>'}',
  orderChecksum: '${initData?.checksum ? initData.checksum.substring(0, 30) + '...' : '<YOUR_ORDER_CHECKSUM>'}',
  options: {
    locale: '${appliedLocale}',
    appearance: { style: '${appliedThemeMode === 'dark' ? 'white' : 'black'}', type: 'pay', radius: 12 }
  }
})

// Runtime updates
checkout.updateOrder({ orderPayload: '<NEW_PAYLOAD>', orderChecksum: '<NEW_CHECKSUM>' })
// Apple Pay instance supports updateOrder. For locale/appearance changes, re-initialize with new config.`,
    },
    {
      value: 'server',
      label: 'api.ts',
      language: 'typescript',
      content: `import { getBase64JsonRequest, getBase64Checksum } from 'xmoney'

// This should be done on your backend
const orderData = {
  publicKey: '${initData?.publicKey || '<YOUR_PUBLIC_KEY>'}',
  customer: {
    identifier: 'customer-123',
    firstName: 'John',
    lastName: 'Doe',
    country: 'RO',
    city: 'Bucharest',
    email: 'john.doe@test.com',
  },
  order: {
    orderId: 'order-' + Date.now(),
    description: 'Runtime Updates Demo - ${embeddableLabel}',
    type: 'purchase',
    amount: ${appliedAmount},
    currency: '${appliedCurrency}',
  },
  cardTransactionMode: 'authAndCapture',
  backUrl: 'https://mysite.com/return'
}

const apiKey = '<YOUR_API_KEY>'
const orderPayload = getBase64JsonRequest(orderData)
const orderChecksum = getBase64Checksum(orderData, apiKey)

// Return payload + checksum to frontend and call checkout.updateOrder(...)`,
    },
  ]

  return (
    <ThreeColumnLayout
      title='Runtime Updates'
      icon={<Settings className='w-4 h-4' />}
      loading={loading}
      error={error}
      themeMode={appliedThemeMode === 'dark' ? 'dark' : 'light'}
      onRefresh={() => window.location.reload()}
      codeTabs={codeTabs}
      sidebarContent={
        <div className='flex flex-col h-full'>
          <div className='px-5 pt-3.5 pb-2 border-b border-slate-200'>
            <h2 className='text-sm font-semibold text-slate-900 mb-0.5'>
              Runtime Updates
            </h2>
            <p className='text-xs text-slate-500'>
              Update {embeddableLabel} without reloading
            </p>
          </div>

          <div className='flex-1 overflow-y-auto p-5 space-y-6'>
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Layers className='w-4 h-4 text-slate-600' />
                <h3 className='text-sm font-semibold text-slate-900'>
                  Embeddable
                </h3>
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='embeddableType' className='text-xs'>
                  Component
                </Label>
                <Select
                  value={embeddableType}
                  onValueChange={(value) =>
                    setEmbeddableType(value as EmbeddableType)
                  }
                >
                  <SelectTrigger id='embeddableType' className='h-9 text-sm'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='paymentCard'>Payment Card</SelectItem>
                    <SelectItem value='googlePay'>Google Pay</SelectItem>
                    <SelectItem value='applePay'>Apple Pay</SelectItem>
                    <SelectItem value='savedCardPayment'>
                      Saved Card Payment
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='h-px bg-slate-200' />

            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <RefreshCw className='w-4 h-4 text-slate-600' />
                <h3 className='text-sm font-semibold text-slate-900'>
                  updateOrder()
                </h3>
              </div>
              <p className='text-xs text-slate-600'>
                Update transaction details (amount, currency) without reloading
                the component.
              </p>
              <div className='space-y-2.5'>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='amount' className='text-xs'>
                      Amount
                    </Label>
                    <Input
                      id='amount'
                      type='number'
                      value={amount}
                      onChange={(e) =>
                        setAmount(parseFloat(e.target.value) || 0)
                      }
                      className='h-9 text-sm'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='currency' className='text-xs'>
                      Currency
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id='currency' className='h-9 text-sm'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='EUR'>EUR</SelectItem>
                        <SelectItem value='USD'>USD</SelectItem>
                        <SelectItem value='RON'>RON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleUpdateOrder}
                  className='w-full h-9 text-sm'
                  size='sm'
                  disabled={
                    (isWalletEmbeddable && !isEmbeddableSupported) ||
                    (embeddableType === 'savedCardPayment' &&
                      !savedCardPaymentInstanceRef.current)
                  }
                >
                  Update Order
                </Button>
              </div>
            </div>

            {isWalletEmbeddable && (
              <>
                <div className='h-px bg-slate-200' />
                <div className='space-y-2'>
                  <h3 className='text-sm font-semibold text-slate-900'>
                    Capability Status
                  </h3>
                  <p className='text-xs text-slate-600'>
                    {isEmbeddableSupported
                      ? `${embeddableLabel} is supported on this browser/device.`
                      : `${embeddableLabel} is not supported on this browser/device.`}
                  </p>
                  {!isEmbeddableSupported && unsupportedReason && (
                    <p className='text-xs text-slate-500'>
                      {unsupportedReason}
                    </p>
                  )}
                </div>
              </>
            )}

            {supportsLocaleAndAppearance && (
              <>
                <div className='h-px bg-slate-200' />

                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Globe className='w-4 h-4 text-slate-600' />
                    <h3 className='text-sm font-semibold text-slate-900'>
                      updateLocale()
                    </h3>
                  </div>
                  <p className='text-xs text-slate-600'>
                    Change language dynamically.
                  </p>
                  <div className='space-y-2.5'>
                    <div className='space-y-1.5'>
                      <Label htmlFor='locale' className='text-xs'>
                        Locale
                      </Label>
                      <Select
                        value={locale}
                        onValueChange={(value) =>
                          setLocale(value as 'en-US' | 'el-GR' | 'ro-RO')
                        }
                      >
                        <SelectTrigger id='locale' className='h-9 text-sm'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='en-US'>English (US)</SelectItem>
                          <SelectItem value='el-GR'>Greek</SelectItem>
                          <SelectItem value='ro-RO'>Romanian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleUpdateLocale}
                      className='w-full h-9 text-sm'
                      size='sm'
                    >
                      Update Locale
                    </Button>
                  </div>
                </div>

                <div className='h-px bg-slate-200' />

                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Palette className='w-4 h-4 text-slate-600' />
                    <h3 className='text-sm font-semibold text-slate-900'>
                      updateAppearance()
                    </h3>
                  </div>
                  <p className='text-xs text-slate-600'>
                    Change theme and styling dynamically.
                  </p>
                  <div className='space-y-2.5'>
                    <div className='space-y-1.5'>
                      <Label htmlFor='theme' className='text-xs'>
                        Theme
                      </Label>
                      <Select
                        value={themeMode}
                        onValueChange={(value: 'light' | 'dark' | 'custom') =>
                          setThemeMode(value)
                        }
                      >
                        <SelectTrigger id='theme' className='h-9 text-sm'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='light'>Light</SelectItem>
                          <SelectItem value='dark'>Dark</SelectItem>
                          <SelectItem value='custom'>Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {themeMode === 'custom' && (
                      <div className='space-y-1.5'>
                        <Label htmlFor='colorPrimary' className='text-xs'>
                          Primary Color
                        </Label>
                        <div className='flex gap-2'>
                          <Input
                            id='colorPrimary'
                            type='color'
                            value={colorPrimary}
                            onChange={(e) => setColorPrimary(e.target.value)}
                            className='h-9 w-20 p-1'
                          />
                          <Input
                            type='text'
                            value={colorPrimary}
                            onChange={(e) => setColorPrimary(e.target.value)}
                            className='h-9 flex-1 text-sm font-mono'
                            placeholder='#4f46e5'
                          />
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={handleUpdateAppearance}
                      className='w-full h-9 text-sm'
                      size='sm'
                    >
                      Update Appearance
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      }
    >
      {paymentResult?.status === 'success' ? (
        <div className='flex-1 flex flex-col items-center justify-center text-center p-8 animate-in zoom-in-95 duration-300'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm'>
            <Check className='w-8 h-8 text-green-600' />
          </div>
          <h3 className='text-xl font-bold text-slate-900 mb-2'>
            Payment Successful!
          </h3>
          <p className='text-sm text-slate-500 mb-8 max-w-[250px] mx-auto'>
            Your transaction has been processed securely.
          </p>
          <div className='w-full bg-slate-50 rounded-lg border border-slate-200 p-4 text-left mb-6 overflow-hidden shadow-inner'>
            <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3'>
              Transaction Data
            </p>
            <pre className='text-[10px] text-slate-700 font-mono overflow-auto max-h-[120px]'>
              {JSON.stringify(paymentResult.data, null, 2)}
            </pre>
          </div>
          <button
            onClick={() => {
              setPaymentResult(null)
              setLoading(true)
              setTimeout(() => {
                setLoading(false)
                window.location.reload()
              }, 100)
            }}
            className='inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white w-full shadow-md'
          >
            Start New Payment
          </button>
        </div>
      ) : paymentResult?.status === 'error' ? (
        <div className='flex-1 flex flex-col items-center justify-center text-center p-8 animate-in zoom-in-95 duration-300'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-sm'>
            <div className='text-red-600 font-bold text-2xl'>!</div>
          </div>
          <h3 className='text-xl font-bold text-slate-900 mb-2'>
            Payment Failed
          </h3>
          <p className='text-sm text-slate-500 mb-8 max-w-[250px] mx-auto'>
            {paymentResult.message}
          </p>
          <button
            onClick={() => {
              setPaymentResult(null)
              window.location.reload()
            }}
            className='inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white w-full shadow-md'
          >
            Try Again
          </button>
        </div>
      ) : isWalletEmbeddable && !isEmbeddableSupported ? (
        <div className='flex items-center justify-center m-auto h-96 w-full p-4'>
          <div className='w-full max-w-[420px] rounded-xl border border-slate-200 bg-white p-5 space-y-3 text-center'>
            <div className='mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center'>
              <AlertCircle className='w-5 h-5 text-slate-500' />
            </div>
            <h3 className='text-sm font-semibold text-slate-900'>
              {embeddableLabel} unavailable
            </h3>
            <p className='text-xs text-slate-600'>
              This payment method is not supported on your current browser or
              device.
            </p>
            <div className='rounded-md bg-slate-50 border border-slate-200 p-3 text-left'>
              <p className='text-[11px] font-medium text-slate-700 mb-1'>
                Reason
              </p>
              <p className='text-xs text-slate-600'>
                {unsupportedReason ||
                  'No additional reason was provided by the SDK.'}
              </p>
            </div>
            {capabilities && (
              <p className='text-[11px] text-slate-500'>
                Google Pay:{' '}
                {capabilities.googlePay.supported
                  ? 'Supported'
                  : 'Not supported'}
                {' • '}Apple Pay:{' '}
                {capabilities.applePay.supported
                  ? 'Supported'
                  : 'Not supported'}
              </p>
            )}
          </div>
        </div>
      ) : embeddableType === 'savedCardPayment' ? (
        <div className='flex items-center justify-center m-auto w-full p-4'>
          <div className='w-full max-w-[420px] rounded-xl border border-slate-200 bg-white p-6 space-y-5'>
            <div className='space-y-1'>
              <h3 className='text-sm font-semibold text-slate-900'>
                Saved Card Payment
              </h3>
              <p className='text-xs text-slate-500'>
                Select a saved card and trigger payment programmatically.
              </p>
            </div>

            {isSavedCardsLoading || loading ? (
              <div className='space-y-2'>
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className='h-14 animate-pulse rounded-xl bg-slate-100'
                  />
                ))}
              </div>
            ) : savedCards.length === 0 ? (
              <p className='py-4 text-center text-sm text-slate-400'>
                No saved cards found for this customer.
              </p>
            ) : (
              <div className='space-y-2'>
                {savedCards.map((card) => {
                  const last4 = card.cardNumber.replace(/\*/g, '').slice(-4)
                  const isSelected = selectedSavedCardId === card.id
                  return (
                    <button
                      key={card.id}
                      type='button'
                      onClick={() => setSelectedSavedCardId(card.id)}
                      className={`w-full rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-indigo-400/70 bg-indigo-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && (
                            <span className='h-1.5 w-1.5 rounded-full bg-white' />
                          )}
                        </span>
                        <div className='flex min-w-0 flex-1 items-center gap-2'>
                          <CardBrandBadge type={card.type} />
                          <span className='text-sm font-medium text-slate-800'>
                            •••• •••• •••• {last4}
                          </span>
                        </div>
                        <span className='text-xs text-slate-400'>
                          {card.expiryMonth}/{card.expiryYear}
                        </span>
                      </div>
                      {card.nameOnCard && (
                        <p className='mt-1.5 pl-7 text-xs text-slate-400'>
                          {card.nameOnCard}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            <Button
              className='w-full gap-2'
              disabled={
                loading ||
                isSavedCardsLoading ||
                !savedCardPaymentInstanceRef.current ||
                !selectedSavedCardId ||
                savedCardPaymentStatus === 'processing'
              }
              onClick={() => {
                if (
                  savedCardPaymentInstanceRef.current &&
                  selectedSavedCardId
                ) {
                  setSavedCardPaymentStatus('processing')
                  savedCardPaymentInstanceRef.current.pay({
                    cardId: selectedSavedCardId,
                  })
                }
              }}
            >
              {savedCardPaymentStatus === 'processing' ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <CreditCard className='w-4 h-4' />
              )}
              {savedCardPaymentStatus === 'processing'
                ? 'Processing…'
                : 'Pay with saved card'}
            </Button>
          </div>
        </div>
      ) : (
        <div
          id='runtime-updates-embeddable'
          className={cn(
            'transition-opacity duration-300 w-full',
            loading
              ? 'opacity-0 h-0 overflow-hidden'
              : 'opacity-100 flex-1 flex items-center justify-center m-auto h-96 p-4'
          )}
        />
      )}
    </ThreeColumnLayout>
  )
}
