import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getApiCredentials } from '@/lib/credentials'
import { Check, ShoppingCart, Info, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { formatConfigToJS } from '@/lib/format-utils'
import { TwoColumnLayout, type CodeTab } from '@/components/two-column-layout'

export const Route = createFileRoute('/examples/checkout')({
  component: CheckoutPage,
})

interface CartItem {
  id: string
  name: string
  quantity: number
  price: number
  image?: string
}

const sampleItems: CartItem[] = [
  {
    id: '1',
    name: 'Classic White T-Shirt',
    quantity: 1,
    price: 24.99,
    image:
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: '2',
    name: 'Slim Fit Jeans',
    quantity: 1,
    price: 59.99,
    image:
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop&auto=format',
  },
]

function CheckoutPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  const [items, setItems] = useState<CartItem[]>(sampleItems)
  const [currency, setCurrency] = useState<'EUR' | 'RON'>('EUR')

  // Exchange rate: 1 EUR = 4.97 RON (approximate)
  const EUR_TO_RON_RATE = 4.97

  const convertAmount = (
    amount: number,
    from: 'EUR' | 'RON',
    to: 'EUR' | 'RON'
  ) => {
    if (from === to) return amount
    if (from === 'EUR' && to === 'RON') return amount * EUR_TO_RON_RATE
    if (from === 'RON' && to === 'EUR') return amount / EUR_TO_RON_RATE
    return amount
  }

  const subtotalEUR = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const subtotal = convertAmount(subtotalEUR, 'EUR', currency)
  const tax = 0 // Tax will be calculated when address is entered
  const total = subtotal + tax

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    )
  }

  const updatePrice = (id: string, price: string) => {
    const newPrice = parseFloat(price)
    if (isNaN(newPrice) || newPrice < 0.01) return
    // Convert the price back to EUR for storage (items are stored in EUR)
    const priceInEUR = convertAmount(newPrice, currency, 'EUR')
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, price: Math.max(0.01, priceInEUR) } : item
      )
    )
  }

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
            amount: total,
            currency: currency,
            description: `Order: ${items.map((i) => i.name).join(', ')}`,
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
        if (window.XMoney) {
          const container = document.getElementById('checkout-payment-form')
          if (!container) return
          container.innerHTML = ''

          const sdkConfig: any = {
            container: 'checkout-payment-form',
            publicKey: publicKey,
            orderPayload: data.payload,
            orderChecksum: data.checksum,
            options: {
              locale: 'en-US',
              buttonType: 'pay',
              displaySubmitButton: true,
              displaySaveCardOption: true,
              enableSavedCards: false,
              validationMode: 'onBlur',
              googlePay: { enabled: true, appearance: { color: 'black' } },
              applePay: { enabled: true, appearance: { style: 'black' } },
              appearance: {
                theme: 'custom',
                variables: {
                  colorPrimary: '#4f46e5', // Indigo-600 for buttons and focus
                  colorDanger: '#dc2626', // Red-600 for errors
                  colorBackground: '#ffffff', // White background
                  colorText: '#111827', // Gray-900 for primary text
                  colorTextSecondary: '#6b7280', // Gray-500 for labels
                  colorBorder: '#f3f4f6', // Gray-100 for borders
                  colorBorderFocus: '#4f46e5', // Indigo-600 for focus
                  colorTextPlaceholder: '#9ca3af', // Gray-400 for placeholders
                  borderRadius: '6px', // Rounded-md equivalent
                },
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
          sdkInstance = await window.XMoney.paymentForm(sdkConfig)
        }
      } catch (err) {
        console.error(err)
        if (mounted) {
          setLoading(false)
          setError('Failed to initialize checkout')
        }
      }
    }

    const timer = setTimeout(initCheckout, 500)
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
  }, [total, items, currency])

  const handleRefresh = () => {
    window.location.reload()
  }

  const formatPrice = (price: number, curr: 'EUR' | 'RON' = currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
    }).format(price)
  }

  const codeTabs: CodeTab[] = [
    {
      value: 'client',
      label: 'checkout.tsx',
      language: 'javascript',
      content: `const xMoney = await window.XMoney.paymentForm({
  container: 'checkout-payment-form',
  publicKey: '${initData?.publicKey || '<YOUR_PUBLIC_KEY>'}',
  orderPayload: '${initData?.payload ? initData.payload.substring(0, 30) + '...' : '<YOUR_ORDER_PAYLOAD>'}',
  orderChecksum: '${initData?.checksum ? initData.checksum.substring(0, 30) + '...' : '<YOUR_ORDER_CHECKSUM>'}',
  options: ${(() => {
    const str = formatConfigToJS(
      {
        locale: 'en-US',
        buttonType: 'pay',
        displaySubmitButton: true,
        displaySaveCardOption: true,
        enableSavedCards: false,
        validationMode: 'onBlur',
        googlePay: { enabled: true, appearance: { color: 'black' } },
        applePay: { enabled: true, appearance: { style: 'black' } },
        appearance: {
          theme: 'custom',
          variables: {
            colorPrimary: '#4f46e5',
            colorDanger: '#dc2626',
            colorBackground: '#ffffff',
            colorText: '#111827',
            colorTextSecondary: '#6b7280',
            colorBorder: '#f3f4f6',
            colorBorderFocus: '#4f46e5',
            colorTextPlaceholder: '#9ca3af',
            borderRadius: '6px',
          },
        },
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
    description: 'Checkout Order',
    type: 'purchase',
    amount: ${total},
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
    <TwoColumnLayout
      title='Checkout'
      icon={<ShoppingCart className='w-4 h-4' />}
      codeTabs={codeTabs}
      onRefresh={handleRefresh}
      loading={loading}
    >
      <div className='bg-gray-50 min-h-full'>
        {/* Success State */}
        {paymentResult?.status === 'success' && (
          <div className='max-w-6xl mx-auto flex items-center justify-center min-h-[600px]'>
            <div className='max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center animate-in zoom-in-95 duration-300'>
              <div className='w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg'>
                <Check className='w-10 h-10 text-white' />
              </div>
              <h2 className='text-3xl font-bold text-gray-900 mb-2'>
                Payment Successful!
              </h2>
              <p className='text-gray-600 mb-8'>
                Your order has been processed successfully.
              </p>
              <button
                onClick={() => window.location.reload()}
                className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl'
              >
                Start New Order
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {paymentResult?.status === 'error' && (
          <div className='max-w-6xl mx-auto flex items-center justify-center min-h-[600px]'>
            <div className='max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center animate-in zoom-in-95 duration-300'>
              <div className='w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg'>
                <div className='text-white font-bold text-3xl'>!</div>
              </div>
              <h2 className='text-3xl font-bold text-gray-900 mb-2'>
                Payment Failed
              </h2>
              <p className='text-gray-600 mb-8'>{paymentResult.message}</p>
              <button
                onClick={() => {
                  setPaymentResult(null)
                  window.location.reload()
                }}
                className='w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl'
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Main Checkout Layout */}
        {!paymentResult && (
          <div className='max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5'>
            {/* Left Column - Order Summary */}
            <div className='px-8 lg:px-12 py-10 border-r border-gray-100 bg-white lg:col-span-2'>
              {/* Items */}
              <div className='mb-10 space-y-6'>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className='pb-6 border-b border-gray-100 last:border-0 last:pb-0'
                  >
                    <div className='flex items-start gap-4 mb-3'>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className='w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0'
                        />
                      )}
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-semibold text-gray-900 text-sm sm:text-[15px] leading-tight mb-1'>
                          {item.name}
                        </h3>
                        <p className='text-xs text-gray-500'>
                          {item.id === '1'
                            ? '100% cotton, comfortable fit'
                            : 'Classic denim, regular fit'}
                        </p>
                      </div>
                    </div>

                    {/* Inputs on separate line below image and description */}
                    <div className='flex items-center justify-end gap-4 pl-0 sm:pl-24'>
                      {/* Quantity UI */}
                      <div className='flex items-center gap-2'>
                        <span className='text-[10px] sm:text-[11px] font-medium text-gray-400 uppercase tracking-wider'>
                          Qty
                        </span>
                        <div className='flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm'>
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className='p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-900'
                            title='Decrease quantity'
                          >
                            <Minus className='w-3 h-3' />
                          </button>
                          <span className='w-6 text-center text-xs font-semibold text-gray-900'>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className='p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-900'
                            title='Increase quantity'
                          >
                            <Plus className='w-3 h-3' />
                          </button>
                        </div>
                      </div>

                      {/* Price Input UI */}
                      <div className='flex items-center gap-2'>
                        <span className='text-[10px] sm:text-[11px] font-medium text-gray-400 uppercase tracking-wider'>
                          Price
                        </span>
                        <div className='relative flex items-center bg-white border border-gray-200 rounded-lg px-2 h-7 shadow-sm group focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all'>
                          <span className='text-gray-400 text-[10px] mr-0.5 font-medium'>
                            {currency === 'EUR' ? '€' : 'lei'}
                          </span>
                          <input
                            type='number'
                            step='0.01'
                            min='0.01'
                            value={convertAmount(
                              item.price * item.quantity,
                              'EUR',
                              currency
                            ).toFixed(2)}
                            onChange={(e) => {
                              const newTotal = parseFloat(e.target.value)
                              if (isNaN(newTotal) || newTotal < 0.01) return
                              const newUnitPrice = convertAmount(
                                newTotal / item.quantity,
                                currency,
                                'EUR'
                              )
                              // Ensure we preserve precision for very small amounts and enforce minimum
                              const roundedUnitPrice = Math.max(
                                0.01,
                                Math.round(newUnitPrice * 100) / 100
                              )
                              updatePrice(item.id, roundedUnitPrice.toString())
                            }}
                            className='w-16 bg-transparent border-none p-0 text-xs font-semibold text-gray-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-right'
                            title='Change total amount (minimum 0.01)'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className='space-y-4 pt-8 border-t border-gray-100'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Subtotal</span>
                  <span className='text-gray-900 font-medium'>
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
                <div className='flex justify-between text-sm items-start'>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-gray-600'>Tax</span>
                    <Info className='w-3.5 h-3.5 text-gray-400 flex-shrink-0' />
                  </div>
                  <span className='text-gray-500 text-xs text-right'>
                    Enter address to calculate
                  </span>
                </div>
                <div className='flex justify-between pt-4 border-t border-gray-200'>
                  <span className='font-semibold text-gray-900 text-base'>
                    Total due
                  </span>
                  <span className='font-semibold text-gray-900 text-base'>
                    {formatPrice(total, currency)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className='mt-12 pt-8 border-t border-gray-100'>
                <div className='flex items-center gap-3 text-xs'>
                  <span className='text-gray-400'>Powered by</span>
                  <span className='text-gray-700 font-medium'>xMoney</span>
                  <div className='h-3 w-px bg-gray-300'></div>
                  <Link
                    to='/'
                    className='text-gray-400 hover:text-gray-600 transition-colors'
                  >
                    Terms
                  </Link>
                  <Link
                    to='/'
                    className='text-gray-400 hover:text-gray-600 transition-colors'
                  >
                    Privacy
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Form */}
            <div className='px-8 lg:px-12 py-10 lg:col-span-3 bg-white'>
              {/* Currency Selection */}
              <div className='mb-6'>
                <div className='flex items-center justify-center gap-3'>
                  <button
                    onClick={() => setCurrency('EUR')}
                    className={cn(
                      'group relative flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ease-out w-44',
                      'hover:scale-[1.02] hover:shadow-lg',
                      currency === 'EUR'
                        ? 'border-gray-900 bg-gray-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <span className='text-xl transition-transform duration-200 group-hover:scale-110'>
                      🇪🇺
                    </span>
                    <span className='text-sm font-semibold text-gray-900'>
                      {formatPrice(
                        convertAmount(subtotalEUR, 'EUR', 'EUR'),
                        'EUR'
                      )}
                    </span>
                    {currency === 'EUR' && (
                      <div className='absolute -top-1 -right-1 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center'>
                        <Check className='w-2.5 h-2.5 text-white' />
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => setCurrency('RON')}
                    className={cn(
                      'group relative flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ease-out w-44',
                      'hover:scale-[1.02] hover:shadow-lg',
                      currency === 'RON'
                        ? 'border-gray-900 bg-gray-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <span className='text-xl transition-transform duration-200 group-hover:scale-110'>
                      🇷🇴
                    </span>
                    <span className='text-sm font-semibold text-gray-900'>
                      {formatPrice(
                        convertAmount(subtotalEUR, 'EUR', 'RON'),
                        'RON'
                      )}
                    </span>
                    {currency === 'RON' && (
                      <div className='absolute -top-1 -right-1 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center'>
                        <Check className='w-2.5 h-2.5 text-white' />
                      </div>
                    )}
                  </button>
                </div>
                <p className='text-xs text-gray-500 text-center mt-4'>
                  1 EUR = {EUR_TO_RON_RATE.toFixed(4)} RON
                </p>
              </div>

              {error && (
                <div className='mb-6 p-4 bg-red-50 border border-red-100 rounded-md'>
                  <p className='text-sm text-red-600'>{error}</p>
                </div>
              )}

              {loading && (
                <div className='space-y-5 animate-pulse'>
                  {/* Wallet Buttons */}
                  <div className='space-y-3'>
                    <Skeleton className='h-12 w-full rounded-md' />
                  </div>

                  {/* Card Number */}
                  <div className='space-y-2'>
                    <Skeleton className='h-3 w-20 rounded' />
                    <Skeleton className='h-14 w-full rounded-md' />
                  </div>

                  {/* Expiry and CVC */}
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Skeleton className='h-3 w-16 rounded' />
                      <Skeleton className='h-14 w-full rounded-md' />
                    </div>
                    <div className='space-y-2'>
                      <Skeleton className='h-3 w-12 rounded' />
                      <Skeleton className='h-14 w-full rounded-md' />
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div className='space-y-2'>
                    <Skeleton className='h-3 w-24 rounded' />
                    <Skeleton className='h-14 w-full rounded-md' />
                  </div>

                  {/* Save Card Option */}
                  <div className='flex items-center gap-3'>
                    <Skeleton className='h-5 w-5 rounded' />
                    <Skeleton className='h-4 w-48 rounded' />
                  </div>

                  {/* Submit Button */}
                  <Skeleton className='h-12 w-full rounded-md mt-2' />
                </div>
              )}

              {/* Payment Form */}
              <div
                id='checkout-payment-form'
                className={cn(
                  'transition-all duration-300',
                  loading ? 'opacity-0 pointer-events-none' : 'opacity-100'
                )}
              />
            </div>
          </div>
        )}
      </div>
    </TwoColumnLayout>
  )
}
