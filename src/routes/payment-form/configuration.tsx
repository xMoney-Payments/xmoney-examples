import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Settings, Info, Palette, Check, AlertCircle } from 'lucide-react'
import { assertXMoneyLoaded, createOrder } from '@/lib/create-order'
import { createSdkLogEvent, type SdkLogEvent } from '@/lib/sdk-events'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PreviewState } from '@/components/preview-state'
import {
  ThreeColumnLayout,
  type CodeTab,
} from '@/components/three-column-layout'
import { formatConfigToJS } from '@/lib/format-utils'
import type {
  PaymentFormConfig,
  PaymentFormInstance,
} from '@/types/xmoney-sdk/payment-form-sdk.types'
import {
  buildAppearanceRules,
  buildAppearanceVariables,
  DEFAULT_APPEARANCE_VARIABLES,
  disableAllAppearanceVariables,
  enableAllAppearanceVariables,
  type AppearanceRuleEntry,
} from '@/lib/appearance-config'
import { AppearanceRulesEditor } from '@/components/appearance-rules-editor'
import { AppearanceVariablesEditor } from '@/components/appearance-variables-editor'
import type {
  ApplePayButtonStyle,
  ApplePayButtonType,
  CardInputGrouping,
  FormButtonType,
  GooglePayButtonColor,
  GooglePayButtonBorderType,
  GooglePayButtonType,
  Locale,
  PaymentChangeEvent,
  ValidationEvent,
  ValidationMode,
} from '@/types/xmoney-sdk/sdk-base.types'
import type { PaymentMethodCapabilities } from '@/types/xmoney-sdk/payment-method-capabilities.types'

export const Route = createFileRoute('/payment-form/configuration')({
  component: PaymentFormConfiguration,
})

function PaymentFormConfiguration() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Payment specifics (needed for init)
  const [amount, setAmount] = useState(100)
  const [currency, setCurrency] = useState('EUR')

  // Payment Form Configuration Default Options
  const [config, setConfig] = useState<{
    locale: Locale
    buttonType: FormButtonType
    displaySaveCardOption: boolean
    enableSavedCards: boolean
    displaySubmitButton: boolean
    enableGooglePay: boolean
    enableApplePay: boolean
    validationMode: ValidationMode
    inputGrouping: CardInputGrouping
  }>({
    locale: 'en-US',
    buttonType: 'pay',
    displaySaveCardOption: false,
    enableSavedCards: false,
    displaySubmitButton: true,
    enableGooglePay: false,
    enableApplePay: false,
    validationMode: 'onBlur',
    inputGrouping: 'spaced',
  })

  // Theme Configuration
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'custom'>(
    'light'
  )
  const [themeOverrides, setThemeOverrides] = useState(
    DEFAULT_APPEARANCE_VARIABLES
  )
  const [appearanceRuleEntries, setAppearanceRuleEntries] = useState<
    AppearanceRuleEntry[]
  >([])

  const getEffectiveConfigs = () => {
    if (themeMode === 'custom') {
      const variables = buildAppearanceVariables(themeOverrides)
      const rules = buildAppearanceRules(appearanceRuleEntries)

      return {
        theme: 'custom' as const,
        variables,
        ...(rules ? { rules } : {}),
      }
    }
    return { theme: themeMode }
  }

  const [googlePayAppearance, setGooglePayAppearance] = useState({
    color: 'black' as GooglePayButtonColor,
    type: 'pay' as GooglePayButtonType,
    radius: 12,
    height: 48,
    borderType: 'no_border' as GooglePayButtonBorderType,
  })
  const [applePayAppearance, setApplePayAppearance] = useState({
    style: 'black' as ApplePayButtonStyle,
    type: 'pay' as ApplePayButtonType,
    radius: 12,
    height: 48,
  })

  const [capabilities, setCapabilities] =
    useState<PaymentMethodCapabilities | null>(null)
  const [events, setEvents] = useState<SdkLogEvent[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [validationState, setValidationState] =
    useState<ValidationEvent | null>(null)
  const [paymentChange, setPaymentChange] = useState<PaymentChangeEvent | null>(
    null
  )
  const sdkInstanceRef = useRef<PaymentFormInstance | null>(null)

  const logEvent = (name: SdkLogEvent['name'], payload?: unknown) => {
    setEvents((prev) => [...prev, createSdkLogEvent(name, payload)])
  }

  const [paymentResult, setPaymentResult] = useState<{
    status: 'success' | 'error'
    message?: string
    data?: any
  } | null>(null)

  const [initData, setInitData] = useState<{
    publicKey: string
    payload: string
    checksum: string
  } | null>(null)

  const [sessionId, setSessionId] = useState(0)

  const restartPayment = () => {
    setPaymentResult(null)
    setError(null)
    setSessionId((n) => n + 1)
  }

  useEffect(() => {
    let mounted = true
    let sdkInstance: PaymentFormInstance | null = null

    const initCheckout = async () => {
      setLoading(true)
      setError(null)
      setPaymentResult(null)
      setIsProcessing(false)
      setValidationState(null)
      setPaymentChange(null)

      try {
        const data = await createOrder({
          amount,
          currency,
          description: 'Payment Form Config Demo',
        })
        const { publicKey } = data

        if (!mounted) return

        setInitData({
          publicKey,
          payload: data.payload,
          checksum: data.checksum,
        })

        assertXMoneyLoaded()
        const caps = await window.XMoney.getPaymentMethodCapabilities()
        if (mounted) setCapabilities(caps)

        const container = document.getElementById('config-payment-form-widget')
        if (!container) return
        container.innerHTML = ''

        const appearance = getEffectiveConfigs()

        const sdkConfig: PaymentFormConfig = {
          container: 'config-payment-form-widget',
          publicKey: publicKey,
          orderPayload: data.payload,
          orderChecksum: data.checksum,
          card: {
            savedCards: {
              enabled: config.enableSavedCards,
              optInVisible: config.displaySaveCardOption,
            },
            submitButton: {
              visible: config.displaySubmitButton,
              type: config.buttonType,
            },
            validationMode: config.validationMode,
            inputs: {
              grouping: config.inputGrouping,
            },
          },
          paymentMethods: {
            googlePay: {
              enabled: config.enableGooglePay,
              appearance: googlePayAppearance,
            },
            applePay: {
              enabled: config.enableApplePay,
              appearance: applePayAppearance,
            },
          },
          options: {
            locale: config.locale,
            appearance: appearance as any,
          },
          onReady: () => {
            if (mounted) setLoading(false)
            logEvent('onReady')
          },
          onError: (
            err: { code: number | string; message: string } | string
          ) => {
            logEvent('onError', err)
            if (mounted) {
              setLoading(false)
              setPaymentResult({
                status: 'error',
                message:
                  typeof err === 'string'
                    ? err
                    : err.message || 'Payment failed',
              })
            }
          },
          onPaymentComplete: (transaction) => {
            logEvent('onPaymentComplete', transaction)
            if (mounted) {
              setPaymentResult({ status: 'success', data: transaction })
            }
          },
          onPaymentProcessing: (processing) => {
            logEvent('onPaymentProcessing', { isProcessing: processing })
            if (mounted) setIsProcessing(processing)
          },
          onValidation: (event) => {
            logEvent('onValidation', event)
            if (mounted) setValidationState(event)
          },
          onPaymentChange: (event) => {
            logEvent('onPaymentChange', event)
            if (mounted) setPaymentChange(event)
          },
        }
        sdkInstance = await window.XMoney.paymentForm(sdkConfig)
        sdkInstanceRef.current = sdkInstance
      } catch (err) {
        console.error(err)
        if (mounted) {
          setLoading(false)
          setError(
            err instanceof Error ? err.message : 'Failed to initialize checkout'
          )
        }
      }
    }

    const timer = setTimeout(initCheckout, 500) // Debounce slightly
    return () => {
      clearTimeout(timer)
      mounted = false
      if (sdkInstance) {
        try {
          sdkInstance.destroy()
        } catch (e) {
          console.error(e)
        }
      }
      sdkInstanceRef.current = null
    }
  }, [
    config,
    amount,
    currency,
    sessionId,
    googlePayAppearance,
    applePayAppearance,
  ])

  useEffect(() => {
    if (!sdkInstanceRef.current) return

    const timer = setTimeout(() => {
      sdkInstanceRef.current?.updateAppearance(getEffectiveConfigs())
    }, 300)

    return () => clearTimeout(timer)
  }, [themeMode, themeOverrides, appearanceRuleEntries])

  const codeTabs: CodeTab[] = [
    {
      value: 'client',
      label: 'payment-form.tsx',
      language: 'javascript',
      content: `const xMoney = await window.XMoney.paymentForm({
  container: 'payment-form-widget',
  publicKey: '${initData?.publicKey || '<YOUR_PUBLIC_KEY>'}',
  orderPayload: '${initData?.payload ? initData.payload.substring(0, 30) + '...' : '<YOUR_ORDER_PAYLOAD>'}',
  orderChecksum: '${initData?.checksum ? initData.checksum.substring(0, 30) + '...' : '<YOUR_ORDER_CHECKSUM>'}',
  card: ${(() => {
    const str = formatConfigToJS(
      {
        submitButton: {
          visible: config.displaySubmitButton,
          type: config.buttonType,
        },
        savedCards: {
          enabled: config.enableSavedCards,
          optInVisible: config.displaySaveCardOption,
        },
        validationMode: config.validationMode,
        inputs: {
          grouping: config.inputGrouping,
        },
      },
      2
    )
    return str
      .split('\n')
      .map((line: string, i: number) => (i === 0 ? line : '  ' + line))
      .join('\n')
  })()},
    paymentMethods: ${(() => {
      const str = formatConfigToJS(
        {
          googlePay: {
            enabled: config.enableGooglePay,
            appearance: googlePayAppearance,
          },
          applePay: {
            enabled: config.enableApplePay,
            appearance: applePayAppearance,
          },
        },
        2
      )
      return str
        .split('\n')
        .map((line: string, i: number) => (i === 0 ? line : '  ' + line))
        .join('\n')
    })()},
  options: ${(() => {
    const str = formatConfigToJS(
      {
        locale: config.locale,
        appearance: getEffectiveConfigs(),
      },
      2
    )
    return str
      .split('\n')
      .map((line: string, i: number) => (i === 0 ? line : '  ' + line))
      .join('\n')
  })()},
  onReady: () => {
    console.log('Payment form ready')
  },
  onPaymentProcessing: (isProcessing) => {
    console.log('Processing', isProcessing)
  },
  onValidation: (event) => {
    console.log('Validation', event)
  },
  onPaymentChange: (event) => {
    console.log('Payment change', event)
  },
  onError: (error) => {
    console.error('Payment error', error)
  },
  onPaymentComplete: (data) => {
    console.log('Payment complete', data)
  }
})

${
  !config.displaySubmitButton
    ? `// External CTA when the iframe submit button is hidden
async function onPayClick() {
  const result = await xMoney.validate()
  if (result.isValid) xMoney.submit()
}
`
    : ''
}`,
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
    identifier: 'customer-12333',
    firstName: 'John',
    lastName: 'Doe',
    country: 'RO',
    city: 'Bucharest',
    email: 'john.doe@test.com',
  },
  order: {
    orderId: 'order-' + Date.now(),
    description: 'Payment Form Configuration',
    type: 'purchase',
    amount: ${amount},
    currency: '${currency}',
  },
  cardTransactionMode: 'authAndCapture',
  backUrl: 'https://mysite.com/return'
}

// Secret API Key (Keep this safe on your server)
const apiKey = '<YOUR_API_KEY>'

const payload = getBase64JsonRequest(orderData)
const checksum = getBase64Checksum(orderData, apiKey)

// Pass 'payload' and 'checksum' to your frontend`,
    },
  ]

  return (
    <ThreeColumnLayout
      title='Payment Form Configuration'
      icon={<Settings className='w-4 h-4' />}
      loading={loading}
      error={error}
      themeMode={themeMode === 'dark' ? 'dark' : 'light'}
      onRefresh={restartPayment}
      events={events}
      onClearEvents={() => setEvents([])}
      codeTabs={codeTabs}
      sidebarContent={
        <Tabs defaultValue='features' className='flex flex-col h-full'>
          {/* Tabs - Segmented Control Style */}
          <div className='px-4 pt-4 sm:px-6'>
            <TabsList className='w-full h-auto bg-transparent p-0 border-b border-slate-200 rounded-none'>
              <TabsTrigger
                value='features'
                className='flex-1 gap-2 rounded-none border-b-2 border-transparent data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-indigo-600 px-1 pb-3 pt-2 text-slate-500 data-[state=active]:text-indigo-600 hover:text-slate-700 transition-colors cursor-pointer'
              >
                <Star className='w-4 h-4' /> Features
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
              className='m-0 space-y-6 p-4 animate-in slide-in-from-left-4 fade-in duration-300 sm:space-y-8 sm:p-5 md:p-6'
            >
              {/* Section: Feature Toggles */}
              <div className='space-y-4'>
                <h3 className='text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Features & Toggles
                </h3>
                <div className='space-y-3'>
                  {[
                    {
                      id: 'displaySubmitButton',
                      label: 'Show Submit Button',
                      tooltip:
                        'Render the Pay button inside the iframe. If disabled, you must trigger submission externally.',
                    },
                    {
                      id: 'displaySaveCardOption',
                      label: 'Show Save Card Option',
                      tooltip:
                        'Show the option to allow users to save their card for future purchases.',
                    },
                    {
                      id: 'enableSavedCards',
                      label: 'Show Saved Cards',
                      tooltip:
                        'Show previously saved cards for faster checkout.',
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-2 flex-1'>
                        <Label
                          htmlFor={item.id}
                          className='cursor-pointer font-normal text-sm'
                        >
                          {item.label}
                        </Label>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Info className='w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent
                            className='max-w-[200px]'
                            side='right'
                          >
                            <p>{item.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Switch
                        id={item.id}
                        checked={
                          config[item.id as keyof typeof config] as boolean
                        }
                        onCheckedChange={(checked) =>
                          setConfig({ ...config, [item.id]: checked })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Section: Payment Methods */}
              <div className='space-y-4'>
                <h3 className='text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Payment Methods
                </h3>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Label className='font-normal text-sm text-slate-600'>
                        Card
                      </Label>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Info className='w-3.5 h-3.5 text-slate-400 cursor-help' />
                        </TooltipTrigger>
                        <TooltipContent side='right'>
                          <p>Card payments are enabled by default.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch checked={true} disabled />
                  </div>

                  {/* Google Pay & Apple Pay */}
                  {[
                    { id: 'enableGooglePay', label: 'Google Pay' },
                    { id: 'enableApplePay', label: 'Apple Pay' },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className='flex items-center justify-between'
                    >
                      <Label
                        htmlFor={item.id}
                        className='cursor-pointer flex-1 font-normal text-sm'
                      >
                        {item.label}
                      </Label>
                      <Switch
                        id={item.id}
                        checked={
                          config[item.id as keyof typeof config] as boolean
                        }
                        onCheckedChange={(checked) =>
                          setConfig({ ...config, [item.id]: checked })
                        }
                      />
                    </div>
                  ))}
                  {config.enableGooglePay &&
                    capabilities &&
                    !capabilities.googlePay.supported && (
                      <div className='flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800'>
                        <AlertCircle className='h-3.5 w-3.5 shrink-0 mt-0.5' />
                        Google Pay is not available here
                        {capabilities.googlePay.reason
                          ? `: ${capabilities.googlePay.reason}`
                          : '.'}
                      </div>
                    )}
                  {config.enableApplePay &&
                    capabilities &&
                    !capabilities.applePay.supported && (
                      <div className='flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800'>
                        <AlertCircle className='h-3.5 w-3.5 shrink-0 mt-0.5' />
                        Apple Pay needs HTTPS and a compatible browser
                        {capabilities.applePay.reason
                          ? `: ${capabilities.applePay.reason}`
                          : '.'}
                      </div>
                    )}
                  {config.enableGooglePay && (
                    <div className='space-y-2'>
                      <div className='grid grid-cols-2 gap-2'>
                        <div className='space-y-1'>
                          <Label className='text-xs'>GPay color</Label>
                          <Select
                            value={googlePayAppearance.color}
                            onValueChange={(val) =>
                              setGooglePayAppearance({
                                ...googlePayAppearance,
                                color: val as GooglePayButtonColor,
                              })
                            }
                          >
                            <SelectTrigger className='h-8'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='black'>Black</SelectItem>
                              <SelectItem value='white'>White</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-1'>
                          <Label className='text-xs'>GPay type</Label>
                          <Select
                            value={googlePayAppearance.type}
                            onValueChange={(val) =>
                              setGooglePayAppearance({
                                ...googlePayAppearance,
                                type: val as GooglePayButtonType,
                              })
                            }
                          >
                            <SelectTrigger className='h-8'>
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
                        <div className='space-y-1'>
                          <Label className='text-xs'>GPay border</Label>
                          <Select
                            value={googlePayAppearance.borderType}
                            onValueChange={(val) =>
                              setGooglePayAppearance({
                                ...googlePayAppearance,
                                borderType: val as GooglePayButtonBorderType,
                              })
                            }
                          >
                            <SelectTrigger className='h-8'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='no_border'>No border</SelectItem>
                              <SelectItem value='default_border'>Default</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-1'>
                          <Label className='text-xs'>GPay radius</Label>
                          <Input
                            type='number'
                            min={0}
                            value={googlePayAppearance.radius}
                            onChange={(e) =>
                              setGooglePayAppearance({
                                ...googlePayAppearance,
                                radius: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            className='h-8'
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {config.enableApplePay && (
                    <div className='space-y-2'>
                      <div className='grid grid-cols-2 gap-2'>
                        <div className='space-y-1'>
                          <Label className='text-xs'>Apple style</Label>
                          <Select
                            value={applePayAppearance.style}
                            onValueChange={(val) =>
                              setApplePayAppearance({
                                ...applePayAppearance,
                                style: val as ApplePayButtonStyle,
                              })
                            }
                          >
                            <SelectTrigger className='h-8'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='black'>Black</SelectItem>
                              <SelectItem value='white'>White</SelectItem>
                              <SelectItem value='white-outline'>
                                White outline
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-1'>
                          <Label className='text-xs'>Apple type</Label>
                          <Select
                            value={applePayAppearance.type}
                            onValueChange={(val) =>
                              setApplePayAppearance({
                                ...applePayAppearance,
                                type: val as ApplePayButtonType,
                              })
                            }
                          >
                            <SelectTrigger className='h-8'>
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
                        <div className='space-y-1'>
                          <Label className='text-xs'>Apple radius</Label>
                          <Input
                            type='number'
                            min={0}
                            value={applePayAppearance.radius}
                            onChange={(e) =>
                              setApplePayAppearance({
                                ...applePayAppearance,
                                radius: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            className='h-8'
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Section: Payment Options */}
              <div className='space-y-4'>
                <h3 className='text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Payment & Form Options
                </h3>

                <div className='space-y-4'>
                  <div className='space-y-1'>
                    <Label>Amount & Currency</Label>
                    <div className='flex gap-2'>
                      <Input
                        type='number'
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className='h-9'
                      />
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className='w-24 h-9'>
                          <SelectValue placeholder='Currency' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='EUR'>EUR</SelectItem>
                          <SelectItem value='USD'>USD</SelectItem>
                          <SelectItem value='RON'>RON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <Label htmlFor='locale'>Locale</Label>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Info className='w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent side='right'>
                            <p>
                              Language and formatting locale for the payment
                              form.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={config.locale}
                        onValueChange={(val) =>
                          setConfig({
                            ...config,
                            locale: val as Locale,
                          })
                        }
                      >
                        <SelectTrigger id='locale' className='h-9'>
                          <SelectValue placeholder='Select locale' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='en-US'>en-US</SelectItem>
                          <SelectItem value='el-GR'>el-GR</SelectItem>
                          <SelectItem value='ro-RO'>ro-RO</SelectItem>
                          <SelectItem value='bg-BG'>bg-BG</SelectItem>
                          <SelectItem value='hu-HU'>hu-HU</SelectItem>
                          <SelectItem value='pl-PL'>pl-PL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <Label htmlFor='buttonType'>Button Type</Label>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Info className='w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent side='right'>
                            <p>
                              The text label displayed on the submit button
                              (e.g., 'Pay', 'Book', 'Donate').
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={config.buttonType}
                        onValueChange={(val) =>
                          setConfig({
                            ...config,
                            buttonType: val as FormButtonType,
                          })
                        }
                      >
                        <SelectTrigger id='buttonType' className='h-9'>
                          <SelectValue placeholder='Select button type' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='pay'>Pay</SelectItem>
                          <SelectItem value='book'>Book</SelectItem>
                          <SelectItem value='buy'>Buy</SelectItem>
                          <SelectItem value='checkout'>Checkout</SelectItem>
                          <SelectItem value='donate'>Donate</SelectItem>
                          <SelectItem value='deposit'>Deposit</SelectItem>
                          <SelectItem value='order'>Order</SelectItem>
                          <SelectItem value='subscribe'>Subscribe</SelectItem>
                          <SelectItem value='topUp'>Top Up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <Label htmlFor='inputGrouping'>Input grouping</Label>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Info className='w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent side='right'>
                            <p>
                              Layout of card number, expiry, and CVV. Spaced
                              renders each field separately; condensed groups
                              them into a single card-style block.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={config.inputGrouping}
                        onValueChange={(val) =>
                          setConfig({
                            ...config,
                            inputGrouping: val as CardInputGrouping,
                          })
                        }
                      >
                        <SelectTrigger id='inputGrouping' className='h-9'>
                          <SelectValue placeholder='Select grouping' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='spaced'>Spaced</SelectItem>
                          <SelectItem value='condensed'>Condensed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <Label htmlFor='validationMode'>Validation Mode</Label>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Info className='w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent side='right'>
                            <p>When to trigger form validation.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={config.validationMode}
                        onValueChange={(val) =>
                          setConfig({
                            ...config,
                            validationMode: val as ValidationMode,
                          })
                        }
                      >
                        <SelectTrigger id='validationMode' className='h-9'>
                          <SelectValue placeholder='Select validation mode' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='onSubmit'>On Submit</SelectItem>
                          <SelectItem value='onChange'>On Change</SelectItem>
                          <SelectItem value='onBlur'>On Blur</SelectItem>
                          <SelectItem value='onTouched'>On Touched</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {(validationState || paymentChange || isProcessing) && (
                <div className='space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3'>
                  {isProcessing && (
                    <p className='text-xs font-medium text-amber-700'>
                      Payment is processing…
                    </p>
                  )}
                  {paymentChange && (
                    <p className='text-xs text-slate-600'>
                      CTA: {paymentChange.button.label}
                      {paymentChange.installments.available
                        ? ` · ${paymentChange.installments.count} installments (${paymentChange.installments.formattedAmount})`
                        : ''}
                    </p>
                  )}
                  {validationState && (
                    <p className='text-xs text-slate-600'>
                      Form {validationState.isValid ? 'is valid' : 'has errors'}{' '}
                      ({validationState.trigger})
                    </p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent
              value='appearance'
              className='m-0 space-y-6 p-4 animate-in slide-in-from-right-4 fade-in duration-300 sm:space-y-8 sm:p-5 md:p-6'
            >
              <Tabs
                value={themeMode}
                onValueChange={(val) => {
                  const mode = val as 'light' | 'dark' | 'custom'
                  if (mode === 'light') {
                    setThemeMode('light')
                  } else if (mode === 'dark') {
                    setThemeMode('dark')
                    setThemeOverrides(
                      disableAllAppearanceVariables(themeOverrides)
                    )
                  } else if (mode === 'custom') {
                    setThemeMode('custom')
                    setThemeOverrides(
                      enableAllAppearanceVariables(themeOverrides)
                    )
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

                <TabsContent value='custom' className='min-w-0 space-y-5 pt-2'>
                  <Tabs defaultValue='variables' className='w-full space-y-4'>
                    <TabsList className='grid w-full grid-cols-2'>
                      <TabsTrigger value='variables' className='cursor-pointer'>
                        Variables
                      </TabsTrigger>
                      <TabsTrigger value='rules' className='cursor-pointer'>
                        Rules
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value='variables' className='pt-2'>
                      <AppearanceVariablesEditor
                        overrides={themeOverrides}
                        onChange={setThemeOverrides}
                        onCustomMode={() => setThemeMode('custom')}
                      />
                    </TabsContent>

                    <TabsContent value='rules' className='pt-2'>
                      <AppearanceRulesEditor
                        rules={appearanceRuleEntries}
                        onChange={setAppearanceRuleEntries}
                      />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </div>
        </Tabs>
      }
    >
      {/* Success and Error Views */}
      {paymentResult?.status === 'success' && (
        <PreviewState>
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
            onClick={restartPayment}
            className='inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white w-full shadow-md'
          >
            Start New Payment
          </button>
        </PreviewState>
      )}

      {paymentResult?.status === 'error' && (
        <PreviewState>
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
            onClick={restartPayment}
            className='inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white w-full shadow-md'
          >
            Try Again
          </button>
        </PreviewState>
      )}

      {/* Widget Container */}
      <div
        id='config-payment-form-widget'
        className={cn(
          'transition-opacity duration-300 w-full',
          loading || paymentResult
            ? 'opacity-0 h-0 overflow-hidden'
            : 'opacity-100 flex-1'
        )}
      />
      {!loading && !paymentResult && !config.displaySubmitButton && (
        <div className='flex gap-2 p-4 border-t border-slate-100'>
          <Button
            type='button'
            variant='outline'
            className='flex-1'
            disabled={isProcessing}
            onClick={async () => {
              const result = await sdkInstanceRef.current?.validate()
              logEvent('onValidation', result)
              setValidationState(result ?? null)
            }}
          >
            Validate
          </Button>
          <Button
            type='button'
            className='flex-1 bg-indigo-600 hover:bg-indigo-700'
            disabled={isProcessing}
            onClick={() => sdkInstanceRef.current?.submit()}
          >
            {isProcessing ? 'Processing…' : 'Pay now'}
          </Button>
        </div>
      )}
    </ThreeColumnLayout>
  )
}
