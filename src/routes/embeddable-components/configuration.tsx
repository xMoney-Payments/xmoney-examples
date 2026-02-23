import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { getApiCredentials } from '@/lib/credentials'
import {
  Settings,
  Layers,
  Globe,
  Palette,
  SlidersHorizontal,
  AlertCircle,
  Check,
  Loader2,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ThreeColumnLayout,
  type CodeTab,
} from '@/components/three-column-layout'
import type { XMoneyPaymentCardConfig } from '@/types/xmoney-sdk/payment-card-sdk.types'
import type { XMoneyGooglePayConfig } from '@/types/xmoney-sdk/google-pay-sdk.types'
import type { XMoneyApplePayConfig } from '@/types/xmoney-sdk/apple-pay-sdk.types'
import type { XMoneySavedCardPaymentInstance } from '@/types/xmoney-sdk/saved-card-payment-sdk.types'
import type {
  ApplePayButtonStyle,
  ApplePayButtonType,
  FormButtonType,
  GooglePayButtonBorderType,
  GooglePayButtonColor,
  GooglePayButtonType,
  Locale,
  ValidationMode,
  XMoneyBaseInstance,
} from '@/types/xmoney-sdk/sdk-base.types'
import type { PaymentMethodCapabilities } from '@/types/xmoney-sdk/payment-method-capabilities.types'
import type { Card as SavedCard } from '@/types/checkout.types'
import { formatConfigToJS } from '@/lib/format-utils'

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

export const Route = createFileRoute('/embeddable-components/configuration')({
  component: EmbeddableConfigurationPage,
})

type EmbeddableType =
  | 'paymentCard'
  | 'googlePay'
  | 'applePay'
  | 'savedCardPayment'

function EmbeddableConfigurationPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentResult, setPaymentResult] = useState<{
    status: 'success' | 'error' | 'processing'
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
  const [locale, setLocale] = useState<Locale>('en-US')

  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'custom'>(
    'light'
  )

  const [themeOverrides, setThemeOverrides] = useState({
    colorPrimary: { enabled: false, color: '#009688' },
    colorDanger: { enabled: false, color: '#e53935' },
    colorBackground: { enabled: false, color: '#f5f5f5' },
    colorText: { enabled: false, color: '#212121' },
    colorTextSecondary: { enabled: false, color: '#757575' },
    colorBorder: { enabled: false, color: '#e0e0e0' },
    colorBorderFocus: { enabled: false, color: '#009688' },
    colorTextPlaceholder: { enabled: false, color: '#bdbdbd' },
    colorBackgroundFocus: { enabled: false, color: '#ffffff' },
    borderRadius: { enabled: false, value: '4px' },
  })

  const [cardConfig, setCardConfig] = useState({
    validationMode: 'onBlur' as ValidationMode,
    submitButtonVisible: true,
    submitButtonType: 'pay' as FormButtonType,
    savedCardsEnabled: false,
    savedCardsOptInVisible: false,
  })

  const [googlePayConfig, setGooglePayConfig] = useState({
    color: 'black' as GooglePayButtonColor,
    type: 'pay' as GooglePayButtonType,
    radius: 12,
    borderType: 'no_border' as GooglePayButtonBorderType,
  })

  const [applePayConfig, setApplePayConfig] = useState({
    style: 'black' as ApplePayButtonStyle,
    type: 'pay' as ApplePayButtonType,
    radius: 12,
  })

  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<number | null>(
    null
  )
  const [isSavedCardsLoading, setIsSavedCardsLoading] = useState(false)

  const [initData, setInitData] = useState<{
    publicKey: string
    payload: string
    checksum: string
  } | null>(null)

  const [capabilities, setCapabilities] =
    useState<PaymentMethodCapabilities | null>(null)
  const [capabilitiesError, setCapabilitiesError] = useState<string | null>(
    null
  )
  const [isEmbeddableSupported, setIsEmbeddableSupported] = useState(true)
  const [unsupportedReason, setUnsupportedReason] = useState<string | null>(
    null
  )

  const embeddableLabel = useMemo(() => {
    if (embeddableType === 'paymentCard') return 'Payment Card'
    if (embeddableType === 'googlePay') return 'Google Pay'
    if (embeddableType === 'applePay') return 'Apple Pay'
    return 'Saved Card Payment'
  }, [embeddableType])

  const isWalletEmbeddable =
    embeddableType === 'googlePay' || embeddableType === 'applePay'

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

  const createAppearance = () => {
    if (themeMode === 'custom') {
      const vars: any = {}
      if (themeOverrides.colorPrimary.enabled)
        vars.colorPrimary = themeOverrides.colorPrimary.color
      if (themeOverrides.colorDanger.enabled)
        vars.colorDanger = themeOverrides.colorDanger.color
      if (themeOverrides.colorBackground.enabled)
        vars.colorBackground = themeOverrides.colorBackground.color
      if (themeOverrides.colorText.enabled)
        vars.colorText = themeOverrides.colorText.color
      if (themeOverrides.colorTextSecondary.enabled)
        vars.colorTextSecondary = themeOverrides.colorTextSecondary.color
      if (themeOverrides.colorBorder.enabled)
        vars.colorBorder = themeOverrides.colorBorder.color
      if (themeOverrides.colorBorderFocus.enabled)
        vars.colorBorderFocus = themeOverrides.colorBorderFocus.color
      if (themeOverrides.colorTextPlaceholder.enabled)
        vars.colorTextPlaceholder = themeOverrides.colorTextPlaceholder.color
      if (themeOverrides.colorBackgroundFocus.enabled)
        vars.colorBackgroundFocus = themeOverrides.colorBackgroundFocus.color
      if (themeOverrides.borderRadius.enabled)
        vars.borderRadius = themeOverrides.borderRadius.value

      return { theme: 'custom', variables: vars }
    }
    return { theme: themeMode }
  }

  useEffect(() => {
    let mounted = true

    const loadCapabilities = async () => {
      try {
        if (!window.XMoney) {
          throw new Error('XMoney SDK is not available')
        }

        const data = await window.XMoney.getPaymentMethodCapabilities()
        if (!mounted) return
        setCapabilities(data)
        setCapabilitiesError(null)
      } catch (err) {
        console.error('Failed to load payment method capabilities', err)
        if (!mounted) return
        setCapabilitiesError(
          'Unable to detect wallet support on this browser/device.'
        )
      }
    }

    loadCapabilities()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initCheckout = async () => {
      setLoading(true)
      setError(null)
      setPaymentResult(null)
      setIsEmbeddableSupported(true)
      setUnsupportedReason(null)
      setSavedCards([])
      setSelectedSavedCardId(null)
      setIsSavedCardsLoading(false)

      try {
        if (!window.XMoney) {
          throw new Error('XMoney SDK is not available')
        }

        let methodCapabilities = capabilities
        if (isWalletEmbeddable) {
          if (!methodCapabilities) {
            methodCapabilities =
              await window.XMoney.getPaymentMethodCapabilities()
            if (!mounted) return
            setCapabilities(methodCapabilities)
          }

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
            description: `Embeddable Configuration - ${embeddableLabel}`,
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
                  setPaymentResult({
                    status: 'error',
                    message: typeof err === 'string' ? err : 'Payment failed',
                  })
                }
              },
              onPaymentComplete: (result: any) => {
                console.log('Payment complete', result)
                setPaymentResult({ status: 'success', data: result })
              },
              onPaymentProcessing: (isProcessing: boolean) => {
                if (mounted && isProcessing) {
                  setPaymentResult({
                    status: 'processing',
                  })
                }
              },
            })
          if (!mounted) return
          fetchSavedCards(() => mounted)
          return
        }

        const container = document.getElementById('config-embeddable')
        if (!container) return
        container.innerHTML = ''

        const baseConfig = {
          container: 'config-embeddable',
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
              validationMode: cardConfig.validationMode,
              savedCards: {
                enabled: cardConfig.savedCardsEnabled,
                optInVisible: cardConfig.savedCardsOptInVisible,
              },
              submitButton: {
                visible: cardConfig.submitButtonVisible,
                type: cardConfig.submitButtonType,
              },
            },
            options: {
              locale,
              appearance: createAppearance() as any,
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
                color: googlePayConfig.color,
                type: googlePayConfig.type,
                radius: googlePayConfig.radius,
                borderType: googlePayConfig.borderType,
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
              style: applePayConfig.style,
              type: applePayConfig.type,
              radius: applePayConfig.radius,
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

    const timer = setTimeout(initCheckout, 350)

    return () => {
      clearTimeout(timer)
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
  }, [
    embeddableType,
    embeddableLabel,
    isWalletEmbeddable,
    amount,
    currency,
    locale,
    themeMode,
    themeOverrides,
    cardConfig.validationMode,
    cardConfig.submitButtonVisible,
    cardConfig.submitButtonType,
    cardConfig.savedCardsEnabled,
    cardConfig.savedCardsOptInVisible,
    googlePayConfig.color,
    googlePayConfig.type,
    googlePayConfig.radius,
    googlePayConfig.borderType,
    applePayConfig.style,
    applePayConfig.type,
    applePayConfig.radius,
    capabilities,
  ])

  const codeTabs: CodeTab[] = [
    {
      value: 'client',
      label: `${embeddableType}.tsx`,
      language: 'javascript',
      content:
        embeddableType === 'paymentCard'
          ? `// Initialize the Payment Card component
const checkout = await window.XMoney.paymentCard({
  container: 'config-embeddable',
  publicKey: '${initData?.publicKey || '<YOUR_PUBLIC_KEY>'}',
  orderPayload: '${initData?.payload ? initData.payload.substring(0, 30) + '...' : '<YOUR_ORDER_PAYLOAD>'}',
  orderChecksum: '${initData?.checksum ? initData.checksum.substring(0, 30) + '...' : '<YOUR_ORDER_CHECKSUM>'}',
  card: {
    validationMode: '${cardConfig.validationMode}',
    savedCards: {
      enabled: ${cardConfig.savedCardsEnabled},
      optInVisible: ${cardConfig.savedCardsOptInVisible}
    },
    submitButton: {
      visible: ${cardConfig.submitButtonVisible},
      type: '${cardConfig.submitButtonType}'
    }
  },
  options: {
    locale: '${locale}',
    appearance: {
      theme: '${themeMode}'${
        themeMode === 'custom'
          ? `,
      variables: ${(() => {
        const str = formatConfigToJS(
          Object.keys(themeOverrides).reduce((acc: any, key) => {
            const override = themeOverrides[key as keyof typeof themeOverrides]
            if (override.enabled) {
              acc[key] = 'color' in override ? override.color : override.value
            }
            return acc
          }, {}),
          2
        )
        return str
          .split('\n')
          .map((line: string, i: number) => (i === 0 ? line : '      ' + line))
          .join('\n')
      })()}`
          : ''
      }
    }
  }
})`
          : embeddableType === 'googlePay'
            ? `// Check support before initializing Google Pay
const capabilities = await window.XMoney.getPaymentMethodCapabilities()
if (!capabilities.googlePay.supported) {
  console.warn(capabilities.googlePay.reason || 'Google Pay not supported')
  return
}

const checkout = await window.XMoney.googlePay({
  container: 'config-embeddable',
  publicKey: '${initData?.publicKey || '<YOUR_PUBLIC_KEY>'}',
  orderPayload: '${initData?.payload ? initData.payload.substring(0, 30) + '...' : '<YOUR_ORDER_PAYLOAD>'}',
  orderChecksum: '${initData?.checksum ? initData.checksum.substring(0, 30) + '...' : '<YOUR_ORDER_CHECKSUM>'}',
  options: {
    locale: '${locale}',
    appearance: {
      color: '${googlePayConfig.color}',
      type: '${googlePayConfig.type}',
      radius: ${googlePayConfig.radius},
      borderType: '${googlePayConfig.borderType}'
    }
  }
})`
            : embeddableType === 'applePay'
              ? `// Check support before initializing Apple Pay
const capabilities = await window.XMoney.getPaymentMethodCapabilities()
if (!capabilities.applePay.supported) {
  console.warn(capabilities.applePay.reason || 'Apple Pay not supported')
  return
}

const checkout = await window.XMoney.applePay({
  container: 'config-embeddable',
  publicKey: '${initData?.publicKey || '<YOUR_PUBLIC_KEY>'}',
  orderPayload: '${initData?.payload ? initData.payload.substring(0, 30) + '...' : '<YOUR_ORDER_PAYLOAD>'}',
  orderChecksum: '${initData?.checksum ? initData.checksum.substring(0, 30) + '...' : '<YOUR_ORDER_CHECKSUM>'}',
  options: {
    locale: '${locale}',
    appearance: {
      style: '${applePayConfig.style}',
      type: '${applePayConfig.type}',
      radius: ${applePayConfig.radius}
    }
  }
})`
              : `// Initialize Saved Card Payment (no container needed)
const checkout = await window.XMoney.savedCardPayment({
  publicKey: '${initData?.publicKey || '<YOUR_PUBLIC_KEY>'}',
  orderPayload: '${initData?.payload ? initData.payload.substring(0, 30) + '...' : '<YOUR_ORDER_PAYLOAD>'}',
  orderChecksum: '${initData?.checksum ? initData.checksum.substring(0, 30) + '...' : '<YOUR_ORDER_CHECKSUM>'}',
  onPaymentComplete: (result) => {
    console.log('Payment complete', result)
  },
  onError: (err) => {
    console.error('Payment error', err)
  },
  onPaymentProcessing: (isProcessing) => {
    console.log('Processing:', isProcessing)
  }
})

// Trigger payment for a specific saved card ID
checkout.pay({ cardId: ${selectedSavedCardId ?? '<CARD_ID>'} })`,
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
    description: 'Embeddable Configuration - ${embeddableLabel}',
    type: 'purchase',
    amount: ${amount},
    currency: '${currency}',
  },
  cardTransactionMode: 'authAndCapture',
  backUrl: 'https://mysite.com/return'
}

const apiKey = '<YOUR_API_KEY>'
const orderPayload = getBase64JsonRequest(orderData)
const orderChecksum = getBase64Checksum(orderData, apiKey)

// Return payload and checksum to frontend`,
    },
  ]

  return (
    <ThreeColumnLayout
      title='Embeddable Configuration'
      icon={<Settings className='w-4 h-4' />}
      loading={loading}
      error={error}
      themeMode={themeMode === 'dark' ? 'dark' : 'light'}
      onRefresh={() => window.location.reload()}
      codeTabs={codeTabs}
      sidebarContent={
        <Tabs defaultValue='features' className='flex flex-col h-full'>
          <div className='px-5 pt-3.5 pb-2 border-b border-slate-200'>
            <h2 className='text-sm font-semibold text-slate-900 mb-0.5'>
              Embeddable Configuration
            </h2>
            <p className='text-xs text-slate-500'>
              Configure {embeddableLabel} options
            </p>
          </div>

          <div className='px-5 pt-4 pb-3 border-b border-slate-200'>
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
                  onValueChange={(value) => {
                    setLoading(true)
                    setEmbeddableType(value as EmbeddableType)
                  }}
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
          </div>

          <div className='px-5 pt-3'>
            <TabsList className='w-full h-auto bg-transparent p-0 border-b border-slate-200 rounded-none'>
              <TabsTrigger
                value='features'
                className='flex-1 gap-2 rounded-none border-b-2 border-transparent data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-indigo-600 px-1 pb-3 pt-2 text-slate-500 data-[state=active]:text-indigo-600 hover:text-slate-700 transition-colors cursor-pointer'
              >
                <Layers className='w-4 h-4' /> Features
              </TabsTrigger>
              <TabsTrigger
                value='appearance'
                className='flex-1 gap-2 rounded-none border-b-2 border-transparent data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-indigo-600 px-1 pb-3 pt-2 text-slate-500 data-[state=active]:text-indigo-600 hover:text-slate-700 transition-colors cursor-pointer'
              >
                <Palette className='w-4 h-4' /> Appearance
              </TabsTrigger>
            </TabsList>
          </div>

          <div className='flex-1 overflow-y-auto'>
            <TabsContent
              value='features'
              className='m-0 p-5 space-y-6 animate-in slide-in-from-left-4 fade-in duration-300'
            >
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <SlidersHorizontal className='w-4 h-4 text-slate-600' />
                  <h3 className='text-sm font-semibold text-slate-900'>
                    Order
                  </h3>
                </div>
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
              </div>

              {embeddableType !== 'savedCardPayment' && (
                <>
                  <div className='h-px bg-slate-200' />

                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <Globe className='w-4 h-4 text-slate-600' />
                      <h3 className='text-sm font-semibold text-slate-900'>
                        Locale
                      </h3>
                    </div>
                    <div className='space-y-1.5'>
                      <Label htmlFor='locale' className='text-xs'>
                        Locale
                      </Label>
                      <Select
                        value={locale}
                        onValueChange={(value) => setLocale(value as Locale)}
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
                  </div>
                </>
              )}

              {embeddableType === 'paymentCard' && (
                <>
                  <div className='h-px bg-slate-200' />

                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <SlidersHorizontal className='w-4 h-4 text-slate-600' />
                      <h3 className='text-sm font-semibold text-slate-900'>
                        Card Options
                      </h3>
                    </div>
                    <div className='space-y-2.5'>
                      <div className='grid grid-cols-2 gap-3'>
                        <div className='space-y-1.5'>
                          <Label htmlFor='buttonType' className='text-xs'>
                            Button Type
                          </Label>
                          <Select
                            value={cardConfig.submitButtonType}
                            onValueChange={(value) =>
                              setCardConfig((prev) => ({
                                ...prev,
                                submitButtonType: value as FormButtonType,
                              }))
                            }
                          >
                            <SelectTrigger
                              id='buttonType'
                              className='h-9 text-sm'
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='pay'>Pay</SelectItem>
                              <SelectItem value='book'>Book</SelectItem>
                              <SelectItem value='buy'>Buy</SelectItem>
                              <SelectItem value='checkout'>Checkout</SelectItem>
                              <SelectItem value='donate'>Donate</SelectItem>
                              <SelectItem value='order'>Order</SelectItem>
                              <SelectItem value='subscribe'>
                                Subscribe
                              </SelectItem>
                              <SelectItem value='topUp'>Top Up</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-1.5'>
                          <Label htmlFor='validationMode' className='text-xs'>
                            Validation Mode
                          </Label>
                          <Select
                            value={cardConfig.validationMode}
                            onValueChange={(value) =>
                              setCardConfig((prev) => ({
                                ...prev,
                                validationMode: value as ValidationMode,
                              }))
                            }
                          >
                            <SelectTrigger
                              id='validationMode'
                              className='h-9 text-sm'
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='onSubmit'>
                                On Submit
                              </SelectItem>
                              <SelectItem value='onChange'>
                                On Change
                              </SelectItem>
                              <SelectItem value='onBlur'>On Blur</SelectItem>
                              <SelectItem value='onTouched'>
                                On Touched
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className='flex items-center justify-between'>
                        <Label
                          htmlFor='submitVisible'
                          className='text-xs font-normal'
                        >
                          Show Submit Button
                        </Label>
                        <Switch
                          id='submitVisible'
                          checked={cardConfig.submitButtonVisible}
                          onCheckedChange={(checked) =>
                            setCardConfig((prev) => ({
                              ...prev,
                              submitButtonVisible: checked,
                            }))
                          }
                        />
                      </div>

                      <div className='flex items-center justify-between'>
                        <Label
                          htmlFor='savedCardsEnabled'
                          className='text-xs font-normal'
                        >
                          Enable Saved Cards
                        </Label>
                        <Switch
                          id='savedCardsEnabled'
                          checked={cardConfig.savedCardsEnabled}
                          onCheckedChange={(checked) =>
                            setCardConfig((prev) => ({
                              ...prev,
                              savedCardsEnabled: checked,
                            }))
                          }
                        />
                      </div>

                      <div className='flex items-center justify-between'>
                        <Label
                          htmlFor='savedCardsOptInVisible'
                          className='text-xs font-normal'
                        >
                          Show Save Card Opt-in
                        </Label>
                        <Switch
                          id='savedCardsOptInVisible'
                          checked={cardConfig.savedCardsOptInVisible}
                          onCheckedChange={(checked) =>
                            setCardConfig((prev) => ({
                              ...prev,
                              savedCardsOptInVisible: checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

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
            </TabsContent>

            <TabsContent
              value='appearance'
              className='m-0 p-5 space-y-6 animate-in slide-in-from-right-4 fade-in duration-300'
            >
              {embeddableType === 'paymentCard' ? (
                <Tabs
                  value={themeMode}
                  onValueChange={(val) => {
                    const mode = val as 'light' | 'dark' | 'custom'
                    if (mode === 'light') {
                      setThemeMode('light')
                    } else if (mode === 'dark') {
                      setThemeMode('dark')
                      // Reset overrides when switching to preset
                      const newOverrides: any = { ...themeOverrides }
                      Object.keys(newOverrides).forEach((k) => {
                        newOverrides[k] = {
                          ...newOverrides[k],
                          enabled: false,
                        }
                      })
                      setThemeOverrides(newOverrides)
                    } else if (mode === 'custom') {
                      setThemeMode('custom')
                      const newOverrides: any = { ...themeOverrides }
                      Object.keys(newOverrides).forEach((k) => {
                        newOverrides[k] = {
                          ...newOverrides[k],
                          enabled: true,
                        }
                      })
                      setThemeOverrides(newOverrides)
                    }
                  }}
                  className='w-full space-y-4'
                >
                  <div className='space-y-4'>
                    <h3 className='text-sm font-bold text-slate-900'>Theme</h3>
                    <TabsList className='w-full grid grid-cols-3'>
                      <TabsTrigger value='light' className='cursor-pointer'>
                        Light
                      </TabsTrigger>
                      <TabsTrigger value='dark' className='cursor-pointer'>
                        Dark
                      </TabsTrigger>
                      <TabsTrigger value='custom' className='cursor-pointer'>
                        Custom
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent
                    value='light'
                    className='text-sm text-slate-500 pt-2'
                  >
                    Default light theme applied.
                  </TabsContent>
                  <TabsContent
                    value='dark'
                    className='text-sm text-slate-500 pt-2'
                  >
                    Dark theme applied.
                  </TabsContent>

                  <TabsContent value='custom' className='space-y-5 pt-2'>
                    <h3 className='text-sm font-bold text-slate-900'>
                      Variables
                    </h3>

                    <div className='grid grid-cols-1 gap-4'>
                      {[
                        { id: 'colorPrimary', label: 'Primary Color' },
                        { id: 'colorDanger', label: 'Danger Color' },
                        { id: 'colorBackground', label: 'Background Color' },
                        { id: 'colorText', label: 'Primary Text' },
                        { id: 'colorTextSecondary', label: 'Secondary Text' },
                        {
                          id: 'colorTextPlaceholder',
                          label: 'Placeholder Text',
                        },
                        { id: 'colorBorder', label: 'Border Color' },
                        { id: 'colorBorderFocus', label: 'Focus Border' },
                        {
                          id: 'colorBackgroundFocus',
                          label: 'Focus Background',
                        },
                      ].map((field) => (
                        <div
                          key={field.id}
                          className='flex items-center justify-between group'
                        >
                          <div className='flex flex-col'>
                            <Label className='font-normal text-sm text-slate-700'>
                              {field.label}
                            </Label>
                            <span className='text-[10px] text-slate-400 font-mono'>
                              {field.id}
                            </span>
                          </div>

                          <div className='flex items-center gap-3'>
                            <div className='flex items-center gap-2'>
                              <div className='relative w-8 h-8 rounded-full border border-gray-200 overflow-hidden shadow-sm shrink-0 ring-offset-2 ring-1 ring-transparent group-hover:ring-indigo-100 transition-all'>
                                <input
                                  type='color'
                                  value={themeOverrides[
                                    field.id as Exclude<
                                      keyof typeof themeOverrides,
                                      'borderRadius'
                                    >
                                  ].color.slice(0, 7)}
                                  onChange={(e) => {
                                    setThemeMode('custom')
                                    setThemeOverrides({
                                      ...themeOverrides,
                                      [field.id]: {
                                        ...themeOverrides[
                                          field.id as keyof typeof themeOverrides
                                        ],
                                        color: e.target.value,
                                        enabled: true,
                                      },
                                    })
                                  }}
                                  className='absolute -top-[50%] -left-[50%] w-[200%] h-[200%] cursor-pointer p-0 m-0 opacity-100'
                                />
                              </div>
                              <Input
                                className='w-20 h-7 text-xs font-mono uppercase p-1'
                                value={
                                  themeOverrides[
                                    field.id as Exclude<
                                      keyof typeof themeOverrides,
                                      'borderRadius'
                                    >
                                  ].color
                                }
                                onChange={(e) => {
                                  setThemeMode('custom')
                                  setThemeOverrides({
                                    ...themeOverrides,
                                    [field.id]: {
                                      ...themeOverrides[
                                        field.id as keyof typeof themeOverrides
                                      ],
                                      color: e.target.value,
                                      enabled: true,
                                    },
                                  })
                                }}
                              />
                            </div>
                            <Switch
                              checked={
                                themeOverrides[
                                  field.id as keyof typeof themeOverrides
                                ].enabled
                              }
                              onCheckedChange={(c) => {
                                const newOverrides = {
                                  ...themeOverrides,
                                  [field.id]: {
                                    ...themeOverrides[
                                      field.id as keyof typeof themeOverrides
                                    ],
                                    enabled: c,
                                  },
                                }
                                setThemeOverrides(newOverrides)
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className='flex items-center justify-between'>
                      <Label className='font-normal text-slate-600'>
                        Border Radius
                      </Label>
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-2'>
                          <Input
                            className='w-20 h-7 text-xs'
                            value={themeOverrides.borderRadius.value}
                            onChange={(e) => {
                              setThemeMode('custom')
                              setThemeOverrides({
                                ...themeOverrides,
                                borderRadius: {
                                  ...themeOverrides.borderRadius,
                                  value: e.target.value,
                                  enabled: true,
                                },
                              })
                            }}
                          />
                        </div>
                        <Switch
                          checked={themeOverrides.borderRadius.enabled}
                          onCheckedChange={(c) => {
                            const newOverrides = {
                              ...themeOverrides,
                              borderRadius: {
                                ...themeOverrides.borderRadius,
                                enabled: c,
                              },
                            }
                            setThemeOverrides(newOverrides)
                          }}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : embeddableType === 'googlePay' ? (
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Palette className='w-4 h-4 text-slate-600' />
                    <h3 className='text-sm font-semibold text-slate-900'>
                      Google Pay Appearance
                    </h3>
                  </div>
                  <div className='space-y-2.5'>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='space-y-1.5'>
                        <Label htmlFor='gpColor' className='text-xs'>
                          Color
                        </Label>
                        <Select
                          value={googlePayConfig.color}
                          onValueChange={(value) =>
                            setGooglePayConfig((prev) => ({
                              ...prev,
                              color: value as GooglePayButtonColor,
                            }))
                          }
                        >
                          <SelectTrigger id='gpColor' className='h-9 text-sm'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='black'>Black</SelectItem>
                            <SelectItem value='white'>White</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='space-y-1.5'>
                        <Label htmlFor='gpType' className='text-xs'>
                          Type
                        </Label>
                        <Select
                          value={googlePayConfig.type}
                          onValueChange={(value) =>
                            setGooglePayConfig((prev) => ({
                              ...prev,
                              type: value as GooglePayButtonType,
                            }))
                          }
                        >
                          <SelectTrigger id='gpType' className='h-9 text-sm'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='pay'>Pay</SelectItem>
                            <SelectItem value='buy'>Buy</SelectItem>
                            <SelectItem value='book'>Book</SelectItem>
                            <SelectItem value='checkout'>Checkout</SelectItem>
                            <SelectItem value='donate'>Donate</SelectItem>
                            <SelectItem value='order'>Order</SelectItem>
                            <SelectItem value='plain'>Plain</SelectItem>
                            <SelectItem value='subscribe'>Subscribe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='space-y-1.5'>
                        <Label htmlFor='gpBorder' className='text-xs'>
                          Border
                        </Label>
                        <Select
                          value={googlePayConfig.borderType}
                          onValueChange={(value) =>
                            setGooglePayConfig((prev) => ({
                              ...prev,
                              borderType: value as GooglePayButtonBorderType,
                            }))
                          }
                        >
                          <SelectTrigger id='gpBorder' className='h-9 text-sm'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='no_border'>No Border</SelectItem>
                            <SelectItem value='default_border'>
                              Default
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='space-y-1.5'>
                        <Label htmlFor='gpRadius' className='text-xs'>
                          Radius
                        </Label>
                        <Input
                          id='gpRadius'
                          type='number'
                          min={0}
                          value={googlePayConfig.radius}
                          onChange={(e) =>
                            setGooglePayConfig((prev) => ({
                              ...prev,
                              radius: Math.max(0, Number(e.target.value) || 0),
                            }))
                          }
                          className='h-9 text-sm'
                        />
                      </div>
                    </div>
                  </div>

                  {capabilitiesError && (
                    <div className='flex items-start gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md p-2'>
                      <AlertCircle className='w-3.5 h-3.5 text-slate-500 mt-0.5' />
                      <p>{capabilitiesError}</p>
                    </div>
                  )}
                </div>
              ) : embeddableType === 'applePay' ? (
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Palette className='w-4 h-4 text-slate-600' />
                    <h3 className='text-sm font-semibold text-slate-900'>
                      Apple Pay Appearance
                    </h3>
                  </div>
                  <div className='space-y-2.5'>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='space-y-1.5'>
                        <Label htmlFor='apStyle' className='text-xs'>
                          Style
                        </Label>
                        <Select
                          value={applePayConfig.style}
                          onValueChange={(value) =>
                            setApplePayConfig((prev) => ({
                              ...prev,
                              style: value as ApplePayButtonStyle,
                            }))
                          }
                        >
                          <SelectTrigger id='apStyle' className='h-9 text-sm'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='black'>Black</SelectItem>
                            <SelectItem value='white'>White</SelectItem>
                            <SelectItem value='white-outline'>
                              White Outline
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='space-y-1.5'>
                        <Label htmlFor='apType' className='text-xs'>
                          Type
                        </Label>
                        <Select
                          value={applePayConfig.type}
                          onValueChange={(value) =>
                            setApplePayConfig((prev) => ({
                              ...prev,
                              type: value as ApplePayButtonType,
                            }))
                          }
                        >
                          <SelectTrigger id='apType' className='h-9 text-sm'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='pay'>Pay</SelectItem>
                            <SelectItem value='buy'>Buy</SelectItem>
                            <SelectItem value='book'>Book</SelectItem>
                            <SelectItem value='checkout'>Checkout</SelectItem>
                            <SelectItem value='donate'>Donate</SelectItem>
                            <SelectItem value='order'>Order</SelectItem>
                            <SelectItem value='plain'>Plain</SelectItem>
                            <SelectItem value='subscribe'>Subscribe</SelectItem>
                            <SelectItem value='top-up'>Top Up</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='space-y-1.5'>
                        <Label htmlFor='apRadius' className='text-xs'>
                          Radius
                        </Label>
                        <Input
                          id='apRadius'
                          type='number'
                          min={0}
                          value={applePayConfig.radius}
                          onChange={(e) =>
                            setApplePayConfig((prev) => ({
                              ...prev,
                              radius: Math.max(0, Number(e.target.value) || 0),
                            }))
                          }
                          className='h-9 text-sm'
                        />
                      </div>
                    </div>
                  </div>

                  {capabilitiesError && (
                    <div className='flex items-start gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md p-2'>
                      <AlertCircle className='w-3.5 h-3.5 text-slate-500 mt-0.5' />
                      <p>{capabilitiesError}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Palette className='w-4 h-4 text-slate-600' />
                    <h3 className='text-sm font-semibold text-slate-900'>
                      Appearance
                    </h3>
                  </div>
                  <p className='text-xs text-slate-500'>
                    Saved Card Payment is a programmatic component — it does not
                    render a UI and has no appearance configuration.
                    <br /> Evrething that you see here is custom made and not
                    part of the SDK.
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
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
        <div className='flex items-center justify-center m-auto min-h-96 w-full p-4'>
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
                Select a saved card to charge programmatically.
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
                !selectedSavedCardId
              }
              onClick={() => {
                if (
                  savedCardPaymentInstanceRef.current &&
                  selectedSavedCardId
                ) {
                  savedCardPaymentInstanceRef.current.pay({
                    cardId: selectedSavedCardId,
                  })
                }
              }}
            >
              {paymentResult?.status === 'processing' ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <CreditCard className='w-4 h-4' />
              )}
              {paymentResult?.status === 'processing'
                ? 'Processing…'
                : 'Pay with saved card'}
            </Button>
          </div>
        </div>
      ) : (
        <div
          id='config-embeddable'
          className={cn(
            'transition-opacity duration-300 w-full',
            loading
              ? 'opacity-0 h-0 overflow-hidden'
              : 'opacity-100 flex-1 flex items-center justify-center m-auto min-h-96 p-4'
          )}
        />
      )}
    </ThreeColumnLayout>
  )
}
