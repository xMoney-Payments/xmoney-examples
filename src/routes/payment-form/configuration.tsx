import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { getApiCredentials } from '@/lib/credentials'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Settings, Info, Palette, Check } from 'lucide-react'
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
import {
  ThreeColumnLayout,
  type CodeTab,
} from '@/components/three-column-layout'
import { formatConfigToJS } from '@/lib/format-utils'

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
  const [config, setConfig] = useState({
    locale: 'en-US',
    buttonType: 'pay',
    displaySaveCardOption: false,
    enableSavedCards: false,
    displaySubmitButton: true,
    enableGooglePay: false,
    enableApplePay: false,
    validationMode: 'onBlur',
  })

  // Theme Configuration
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'custom'>(
    'light'
  )
  // Detailed Theme overrides
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

  // Determine the efficient theme value to pass to SDK
  const getEffectiveConfigs = () => {
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

  useEffect(() => {
    let mounted = true
    let sdkInstance: any = null

    const initCheckout = async () => {
      setLoading(true)
      setError(null)
      setPaymentResult(null)

      try {
        const { publicKey, apiKey } = getApiCredentials()

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount,
            currency: currency,
            description: 'Payment Form Config Demo',
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

        // @ts-ignore
        if (window.XMoneyPaymentForm) {
          const container = document.getElementById(
            'config-payment-form-widget'
          )
          // Ensure container exists and is empty
          if (!container) return
          container.innerHTML = ''

          const options: any = {
            locale: config.locale,
            buttonType: config.buttonType,
            displaySaveCardOption: config.displaySaveCardOption,
            displaySubmitButton: config.displaySubmitButton,
            enableSavedCards: config.enableSavedCards,
          }

          if (config.enableGooglePay) {
            options.googlePay = { enabled: true }
          }
          // @ts-ignore
          options.validationMode = config.validationMode

          if (config.enableApplePay) {
            options.applePay = { enabled: true }
          }

          const sdkConfig: any = {
            container: 'config-payment-form-widget',
            publicKey: publicKey,
            orderPayload: data.payload,
            orderChecksum: data.checksum,
            options: {
              ...options,
              appearance: getEffectiveConfigs(),
            },
            onReady: () => {
              if (mounted) setLoading(false)
              console.log('Payment form ready')
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
            onPaymentComplete: (data: any) => {
              console.log('Payment complete', data)
              if (mounted) {
                setPaymentResult({ status: 'success', data })
              }
            },
          }
          // @ts-ignore
          sdkInstance = new window.XMoneyPaymentForm(sdkConfig)
        }
      } catch (err) {
        console.error(err)
        if (mounted) {
          setLoading(false)
          setError('Failed to initialize checkout')
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
    }
  }, [config, amount, currency, themeMode, themeOverrides])

  const codeTabs: CodeTab[] = [
    {
      value: 'client',
      label: 'payment-form.tsx',
      language: 'javascript',
      content: `const xMoney = new XMoneyPaymentForm({
  container: 'payment-form-widget',
  publicKey: '${initData?.publicKey || '<YOUR_PUBLIC_KEY>'}',
  orderPayload: '${initData?.payload ? initData.payload.substring(0, 30) + '...' : '<YOUR_ORDER_PAYLOAD>'}',
  orderChecksum: '${initData?.checksum ? initData.checksum.substring(0, 30) + '...' : '<YOUR_ORDER_CHECKSUM>'}',
  options: ${(() => {
    const str = formatConfigToJS(
      {
        locale: config.locale,
        buttonType: config.buttonType,
        displaySaveCardOption: config.displaySaveCardOption,
        displaySubmitButton: config.displaySubmitButton,
        enableSavedCards: config.enableSavedCards,
        googlePay: config.enableGooglePay ? { enabled: true } : undefined,
        applePay: config.enableApplePay ? { enabled: true } : undefined,
        validationMode: config.validationMode,
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
  onError: (error) => {
    console.error('Payment error', error)
  },
  onPaymentComplete: (data) => {
    console.log('Payment complete', data)
  }
})`,
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
      onRefresh={() => {
        setLoading(true)
        // Quick hack to force re-render
        const currentAmount = amount
        setAmount(0)
        setTimeout(() => setAmount(currentAmount), 10)
      }}
      codeTabs={codeTabs}
      sidebarContent={
        <Tabs defaultValue='features' className='flex flex-col h-full'>
          {/* Tabs - Segmented Control Style */}
          <div className='px-6 pt-4'>
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
              className='m-0 p-6 space-y-8 animate-in slide-in-from-left-4 fade-in duration-300'
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
                          setConfig({ ...config, locale: val })
                        }
                      >
                        <SelectTrigger id='locale' className='h-9'>
                          <SelectValue placeholder='Select locale' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='en-US'>en-US</SelectItem>
                          <SelectItem value='el-GR'>el-GR</SelectItem>
                          <SelectItem value='ro-RO'>ro-RO</SelectItem>
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
                          setConfig({ ...config, buttonType: val })
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
                          <SelectItem value='order'>Order</SelectItem>
                          <SelectItem value='subscribe'>Subscribe</SelectItem>
                          <SelectItem value='topUp'>Top Up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-1 col-span-2'>
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
                          setConfig({ ...config, validationMode: val })
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
            </TabsContent>

            <TabsContent
              value='appearance'
              className='m-0 p-6 space-y-8 animate-in slide-in-from-right-4 fade-in duration-300'
            >
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
                      { id: 'colorTextPlaceholder', label: 'Placeholder Text' },
                      { id: 'colorBorder', label: 'Border Color' },
                      { id: 'colorBorderFocus', label: 'Focus Border' },
                      { id: 'colorBackgroundFocus', label: 'Focus Background' },
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
            </TabsContent>
          </div>
        </Tabs>
      }
    >
      {/* Success and Error Views */}
      {paymentResult?.status === 'success' && (
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
      )}

      {paymentResult?.status === 'error' && (
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
    </ThreeColumnLayout>
  )
}
