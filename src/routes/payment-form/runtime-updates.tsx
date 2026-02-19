import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getApiCredentials } from '@/lib/credentials'
import { Settings, Globe, Palette, RefreshCw } from 'lucide-react'
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

export const Route = createFileRoute('/payment-form/runtime-updates')({
  component: RuntimeUpdatesPage,
})

function RuntimeUpdatesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const sdkInstanceRef = useRef<any>(null)

  // Order state (for form inputs)
  const [amount, setAmount] = useState(100)
  const [currency, setCurrency] = useState('EUR')

  // Locale state (for form inputs)
  const [locale, setLocale] = useState('en-US')

  // Appearance state (for form inputs)
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'custom'>(
    'light'
  )
  const [colorPrimary, setColorPrimary] = useState('#4f46e5')

  // Applied state (what's actually applied to the SDK - used in code tabs)
  const [appliedAmount, setAppliedAmount] = useState(100)
  const [appliedCurrency, setAppliedCurrency] = useState('EUR')
  const [appliedLocale, setAppliedLocale] = useState('en-US')
  const [appliedThemeMode, setAppliedThemeMode] = useState<
    'light' | 'dark' | 'custom'
  >('light')
  const [appliedColorPrimary, setAppliedColorPrimary] = useState('#4f46e5')

  const [initData, setInitData] = useState<{
    publicKey: string
    payload: string
    checksum: string
  } | null>(null)

  // Initialize payment form
  useEffect(() => {
    let mounted = true

    const initCheckout = async () => {
      setLoading(true)
      setError(null)

      try {
        const { publicKey, apiKey } = getApiCredentials()

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount,
            currency: currency,
            description: 'Runtime Updates Demo',
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

        if (window.XMoney) {
          const container = document.getElementById(
            'runtime-updates-payment-form'
          )
          if (!container) return
          container.innerHTML = ''

          const sdkConfig: any = {
            container: 'runtime-updates-payment-form',
            publicKey: publicKey,
            orderPayload: data.payload,
            orderChecksum: data.checksum,
            options: {
              locale: locale,
              buttonType: 'pay',
              displaySubmitButton: true,
              displaySaveCardOption: false,
              enableSavedCards: false,
              validationMode: 'onBlur',
              appearance: {
                theme: themeMode,
                variables:
                  themeMode === 'custom'
                    ? {
                        colorPrimary: colorPrimary,
                        borderRadius: '6px',
                      }
                    : undefined,
              },
            },
            onReady: () => {
              if (mounted) setLoading(false)
              console.log('Payment form ready')
            },
            onError: (err: any) => {
              console.error('Payment error', err)
              if (mounted) {
                setLoading(false)
                setError(typeof err === 'string' ? err : 'Payment failed')
              }
            },
            onPaymentComplete: (data: any) => {
              console.log('Payment complete', data)
            },
          }
          sdkInstanceRef.current = new window.XMoneyPaymentForm(sdkConfig)
        }
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
    }
  }, []) // Only run once on mount

  // Update order without reloading
  const handleUpdateOrder = async () => {
    if (!sdkInstanceRef.current) return

    try {
      const { publicKey, apiKey } = getApiCredentials()

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          currency: currency,
          description: 'Updated Order',
          publicKey,
          apiKey,
        }),
      })

      if (!response.ok) throw new Error('Failed to update order')
      const data = await response.json()

      // Update the form instance without reloading
      sdkInstanceRef.current.updateOrder(data.payload, data.checksum)
      setInitData({
        publicKey,
        payload: data.payload,
        checksum: data.checksum,
      })
      // Update applied state only after button click
      setAppliedAmount(amount)
      setAppliedCurrency(currency)
    } catch (err) {
      console.error('Failed to update order', err)
      setError('Failed to update order')
    }
  }

  // Update locale without reloading
  const handleUpdateLocale = () => {
    if (!sdkInstanceRef.current) return
    sdkInstanceRef.current.updateLocale(locale)
    // Update applied state only after button click
    setAppliedLocale(locale)
  }

  // Update appearance without reloading
  const handleUpdateAppearance = () => {
    if (!sdkInstanceRef.current) return
    const appearance: any = {
      theme: themeMode,
    }
    if (themeMode === 'custom') {
      appearance.variables = {
        colorPrimary: colorPrimary,
        borderRadius: '6px',
      }
    }
    sdkInstanceRef.current.updateAppearance(appearance)
    // Update applied state only after button click
    setAppliedThemeMode(themeMode)
    setAppliedColorPrimary(colorPrimary)
  }

  const codeTabs: CodeTab[] = [
    {
      value: 'client',
      label: 'payment-form.tsx',
      language: 'javascript',
      content: `// Initialize the payment form
const checkout = await window.XMoney.paymentForm({
  container: 'payment-form-widget',
  publicKey: '${initData?.publicKey || '<YOUR_PUBLIC_KEY>'}',
  orderPayload: '${initData?.payload ? initData.payload.substring(0, 30) + '...' : '<YOUR_ORDER_PAYLOAD>'}',
  orderChecksum: '${initData?.checksum ? initData.checksum.substring(0, 30) + '...' : '<YOUR_ORDER_CHECKSUM>'}',
  options: {
    locale: '${appliedLocale}',
    appearance: {
      theme: '${appliedThemeMode}',
      ${appliedThemeMode === 'custom' ? `variables: { colorPrimary: '${appliedColorPrimary}' }` : ''}
    }
  },
  onReady: () => {
    console.log('Payment form ready')
  }
})

// Update order dynamically (e.g., when cart changes)
async function updateOrderAmount(newAmount, newCurrency) {
  // Get new payload and checksum from your backend
  const response = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ amount: newAmount, currency: newCurrency })
  })
  const { payload, checksum } = await response.json()
  
  // Update without reloading the form
  checkout.updateOrder(payload, checksum)
}

// Update locale dynamically
function changeLanguage(newLocale) {
  checkout.updateLocale(newLocale)
  // Example: checkout.updateLocale('ro-RO')
}

// Update appearance dynamically
function changeTheme(newTheme) {
  checkout.updateAppearance({
    theme: newTheme,
    variables: {
      colorPrimary: '#6366f1',
      borderRadius: '8px'
    }
  })
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
    identifier: 'customer-123',
    firstName: 'John',
    lastName: 'Doe',
    country: 'RO',
    city: 'Bucharest',
    email: 'john.doe@test.com',
  },
  order: {
    orderId: 'order-' + Date.now(),
    description: 'Runtime Updates Demo',
    type: 'purchase',
    amount: ${appliedAmount},
    currency: '${appliedCurrency}',
  },
  cardTransactionMode: 'authAndCapture',
  backUrl: 'https://mysite.com/return'
}

const apiKey = '<YOUR_API_KEY>'
const payload = getBase64JsonRequest(orderData)
const checksum = getBase64Checksum(orderData, apiKey)

// Return payload and checksum to frontend
// Frontend can call checkout.updateOrder(payload, checksum) to update`,
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
              Update the form without reloading
            </p>
          </div>

          <div className='flex-1 overflow-y-auto p-5 space-y-6'>
            {/* Update Order */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <RefreshCw className='w-4 h-4 text-slate-600' />
                <h3 className='text-sm font-semibold text-slate-900'>
                  updateOrder()
                </h3>
              </div>
              <p className='text-xs text-slate-600'>
                Update transaction details (amount, currency) without reloading
                the form.
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
                >
                  Update Order
                </Button>
              </div>
            </div>

            <div className='h-px bg-slate-200' />

            {/* Update Locale */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Globe className='w-4 h-4 text-slate-600' />
                <h3 className='text-sm font-semibold text-slate-900'>
                  updateLocale()
                </h3>
              </div>
              <p className='text-xs text-slate-600'>
                Change the language of the form dynamically.
              </p>
              <div className='space-y-2.5'>
                <div className='space-y-1.5'>
                  <Label htmlFor='locale' className='text-xs'>
                    Locale
                  </Label>
                  <Select value={locale} onValueChange={setLocale}>
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

            {/* Update Appearance */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Palette className='w-4 h-4 text-slate-600' />
                <h3 className='text-sm font-semibold text-slate-900'>
                  updateAppearance()
                </h3>
              </div>
              <p className='text-xs text-slate-600'>
                Change the theme and styling at runtime.
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
          </div>
        </div>
      }
    >
      <div id='runtime-updates-payment-form' />
    </ThreeColumnLayout>
  )
}
