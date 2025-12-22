import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getApiCredentials } from '@/lib/credentials'
import { cn } from '@/lib/utils'
import {
  ShieldCheck,
  UserSquare2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TestTube,
  Check,
} from 'lucide-react'
import {
  ThreeColumnLayout,
  type CodeTab,
} from '@/components/three-column-layout'
import {
  MatchStatusEnum,
  type CardHolderVerificationResult,
} from '@/lib/card-holder-verification-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const Route = createFileRoute('/payment-form/card-holder-verification')({
  component: CardHolderVerification,
})

function CardHolderVerification() {
  const [loading, setLoading] = useState(true)

  // Payment specifics
  const [amount] = useState(50)
  const [currency] = useState('EUR')

  // Card Holder Verification Data
  const [verificationData, setVerificationData] = useState({
    firstName: 'John',
    middleName: '',
    lastName: 'Doe',
  })

  // Test scenario mapping
  const testScenarios = [
    {
      status: 'MATCHED' as const,
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'John Doe',
    },
    {
      status: 'NOT_MATCHED' as const,
      firstName: 'Michael',
      lastName: 'Brown',
      displayName: 'Michael Brown',
    },
    {
      status: 'PARTIAL_MATCHED' as const,
      firstName: 'Sarah',
      lastName: 'Johnson',
      displayName: 'Sarah Johnson',
    },
    {
      status: 'NOT_VERIFIED' as const,
      firstName: 'David',
      lastName: 'Smith',
      displayName: 'David Smith',
    },
    {
      status: 'NOT_SUPPORTED' as const,
      firstName: 'Emily',
      lastName: 'Davis',
      displayName: 'Emily Davis',
    },
  ]

  // Verification result
  const [verificationResult, setVerificationResult] =
    useState<CardHolderVerificationResult | null>(null)

  // Payment result
  const [paymentResult, setPaymentResult] = useState<{
    status: 'success' | 'error'
    message?: string
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

      try {
        const { publicKey, apiKey } = getApiCredentials()

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount,
            currency: currency,
            description: 'Card Holder Verification Demo',
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
            'card-holder-verification-payment-form'
          )
          if (!container) return
          container.innerHTML = ''

          const sdkConfig: any = {
            container: 'card-holder-verification-payment-form',
            publicKey: publicKey,
            orderPayload: data.payload,
            orderChecksum: data.checksum,
            options: {
              locale: 'en-US',
              buttonType: 'pay',
              displaySubmitButton: true,
              displaySaveCardOption: false,
              enableSavedCards: false,
              validationMode: 'onBlur',
              cardHolderVerification: {
                name: {
                  firstName: verificationData.firstName,
                  middleName: verificationData.middleName,
                  lastName: verificationData.lastName,
                },
                onCardHolderVerification: (
                  result: CardHolderVerificationResult
                ) => {
                  console.log('Card holder verification result:', result)
                  setVerificationResult(result)
                  // Proceed only if status is MATCHED
                  return result.status === MatchStatusEnum.Matched
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
                  message:
                    typeof err === 'string'
                      ? err
                      : err?.message || 'Payment failed',
                })
              }
            },
            onPaymentComplete: (data: any) => {
              console.log('Payment complete', data)
              if (mounted) {
                setLoading(false)
                setPaymentResult({
                  status: 'success',
                })
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
        }
      }
    }

    initCheckout()

    return () => {
      mounted = false
      if (sdkInstance) {
        try {
          sdkInstance.destroy()
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [
    verificationData.firstName,
    verificationData.middleName,
    verificationData.lastName,
  ])

  const getStatusIcon = (status: MatchStatusEnum) => {
    switch (status) {
      case MatchStatusEnum.Matched:
        return <CheckCircle2 className='w-4 h-4 text-green-600' />
      case MatchStatusEnum.NotMatched:
        return <XCircle className='w-4 h-4 text-red-600' />
      case MatchStatusEnum.PartialMatched:
        return <AlertCircle className='w-4 h-4 text-yellow-600' />
      case MatchStatusEnum.NotVerified:
        return <AlertCircle className='w-4 h-4 text-gray-600' />
      case MatchStatusEnum.NotSupported:
        return <AlertCircle className='w-4 h-4 text-gray-600' />
      default:
        return null
    }
  }

  const getStatusColor = (status: MatchStatusEnum) => {
    switch (status) {
      case MatchStatusEnum.Matched:
        return 'text-green-600 font-medium'
      case MatchStatusEnum.NotMatched:
        return 'text-red-600 font-medium'
      case MatchStatusEnum.PartialMatched:
        return 'text-yellow-600 font-medium'
      case MatchStatusEnum.NotVerified:
        return 'text-gray-600'
      case MatchStatusEnum.NotSupported:
        return 'text-gray-600'
      default:
        return 'text-slate-600'
    }
  }

  const codeTabs: CodeTab[] = [
    {
      value: 'client',
      label: 'payment-form.tsx',
      language: 'typescript',
      content: `enum MatchStatusEnum {
  Matched = 'MATCHED',
  NotMatched = 'NOT_MATCHED',
  NotVerified = 'NOT_VERIFIED',
  PartialMatched = 'PARTIAL_MATCHED',
  NotSupported = 'NOT_SUPPORTED',
}

interface CardHolderVerificationResult {
  status: MatchStatusEnum
  firstNameStatus?: MatchStatusEnum
  middleNameStatus?: MatchStatusEnum
  lastNameStatus?: MatchStatusEnum
}

// Initialize the payment form with card holder verification
const checkout = new XMoneyPaymentForm({
  container: 'payment-form-widget',
  publicKey: '${initData?.publicKey || '<YOUR_PUBLIC_KEY>'}',
  orderPayload: '${initData?.payload ? initData.payload.substring(0, 30) + '...' : '<YOUR_ORDER_PAYLOAD>'}',
  orderChecksum: '${initData?.checksum ? initData.checksum.substring(0, 30) + '...' : '<YOUR_ORDER_CHECKSUM>'}',
  options: {
    cardHolderVerification: {
      name: {
        firstName: '${verificationData.firstName}',
        middleName: '${verificationData.middleName}',
        lastName: '${verificationData.lastName}'
      },
      onCardHolderVerification: (result: CardHolderVerificationResult) => {
        console.log('Card holder verification result:', result)
        // result.status: MatchStatusEnum (MATCHED | NOT_MATCHED | NOT_VERIFIED | PARTIAL_MATCHED | NOT_SUPPORTED)
        // result.firstNameStatus?: MatchStatusEnum
        // result.middleNameStatus?: MatchStatusEnum
        // result.lastNameStatus?: MatchStatusEnum
        
        // Proceed with payment only if status is MATCHED
        return result.status === MatchStatusEnum.Matched
      }
    }
  },
  onReady: () => {
    console.log('Payment form ready')
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
    identifier: 'customer-123',
    firstName: 'John',
    lastName: 'Doe',
    country: 'RO',
    city: 'Bucharest',
    email: 'john.doe@test.com',
  },
  order: {
    orderId: 'order-' + Date.now(),
    description: 'Card Holder Verification Demo',
    type: 'purchase',
    amount: ${amount},
    currency: '${currency}',
  },
  cardTransactionMode: 'authAndCapture',
  backUrl: 'https://mysite.com/return'
}

const apiKey = '<YOUR_API_KEY>'
const payload = getBase64JsonRequest(orderData)
const checksum = getBase64Checksum(orderData, apiKey)

// Return payload and checksum to frontend`,
    },
  ]

  return (
    <ThreeColumnLayout
      title='Card Holder Verification'
      icon={<UserSquare2 className='w-4 h-4' />}
      loading={loading}
      onRefresh={() => {
        setLoading(true)
        // Force re-render hack
        window.location.reload()
      }}
      codeTabs={codeTabs}
      sidebarContent={
        <div className='flex flex-col h-full'>
          <div className='px-6 pt-4 pb-2 border-b border-slate-200'>
            <h2 className='text-sm font-semibold text-slate-900 mb-1'>
              Card Holder Name Verification
            </h2>
            <p className='text-xs text-slate-500'>
              Verify the cardholder's name against bank records during payment
              to enhance security.
            </p>
          </div>
          <div className='flex-1 overflow-y-auto p-6 space-y-6'>
            {/* Test Combinations */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <TestTube className='w-4 h-4 text-slate-600' />
                <h3 className='text-sm font-semibold text-slate-900'>
                  Test Combinations
                </h3>
              </div>
              <p className='text-xs text-slate-600'>
                Select a test scenario to simulate different verification
                results
              </p>
              <Select
                value={
                  testScenarios.find(
                    (scenario) =>
                      scenario.firstName === verificationData.firstName &&
                      scenario.lastName === verificationData.lastName
                  )?.status || ''
                }
                onValueChange={(value) => {
                  const scenario = testScenarios.find((s) => s.status === value)
                  if (scenario) {
                    setVerificationData({
                      firstName: scenario.firstName,
                      middleName: '',
                      lastName: scenario.lastName,
                    })
                  }
                }}
              >
                <SelectTrigger className='h-9 text-sm'>
                  <SelectValue placeholder='Select test scenario' />
                </SelectTrigger>
                <SelectContent>
                  {testScenarios.map((scenario) => (
                    <SelectItem key={scenario.status} value={scenario.status}>
                      {scenario.status} - {scenario.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='h-px bg-slate-200' />

            {/* Verification Result */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <ShieldCheck className='w-4 h-4 text-slate-600' />
                <h3 className='text-sm font-semibold text-slate-900'>
                  Verification Result
                </h3>
              </div>
              {verificationResult ? (
                <div className='bg-white border-2 border-slate-200 rounded-lg overflow-hidden'>
                  {/* Overall Status */}
                  <div className='p-4 bg-slate-50 border-b border-slate-200'>
                    <div className='flex items-center gap-3'>
                      <div className='flex-shrink-0'>
                        {verificationResult.status ===
                        MatchStatusEnum.Matched ? (
                          <div className='w-10 h-10 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-center'>
                            <CheckCircle2 className='w-6 h-6 text-green-600' />
                          </div>
                        ) : verificationResult.status ===
                          MatchStatusEnum.NotMatched ? (
                          <div className='w-10 h-10 bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center'>
                            <XCircle className='w-6 h-6 text-red-600' />
                          </div>
                        ) : verificationResult.status ===
                          MatchStatusEnum.PartialMatched ? (
                          <div className='w-10 h-10 bg-yellow-50 border-2 border-yellow-200 rounded-lg flex items-center justify-center'>
                            <AlertCircle className='w-6 h-6 text-yellow-600' />
                          </div>
                        ) : (
                          <div className='w-10 h-10 bg-slate-50 border-2 border-slate-200 rounded-lg flex items-center justify-center'>
                            <AlertCircle className='w-6 h-6 text-slate-600' />
                          </div>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div
                          className={cn(
                            'text-base font-semibold',
                            getStatusColor(verificationResult.status)
                          )}
                        >
                          {verificationResult.status.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  {(verificationResult.firstNameStatus ||
                    verificationResult.lastNameStatus ||
                    verificationResult.middleNameStatus) && (
                    <div className='p-4 space-y-3'>
                      <div className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                        Name Components
                      </div>
                      <div className='space-y-2'>
                        {verificationResult.firstNameStatus && (
                          <div className='flex items-center justify-between py-2 border-b border-slate-100 last:border-0'>
                            <span className='text-sm text-slate-700'>
                              First Name
                            </span>
                            <div className='flex items-center gap-2'>
                              {getStatusIcon(
                                verificationResult.firstNameStatus
                              )}
                              <span
                                className={cn(
                                  'text-sm font-medium',
                                  getStatusColor(
                                    verificationResult.firstNameStatus
                                  )
                                )}
                              >
                                {verificationResult.firstNameStatus.replace(
                                  /_/g,
                                  ' '
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                        {verificationResult.middleNameStatus && (
                          <div className='flex items-center justify-between py-2 border-b border-slate-100 last:border-0'>
                            <span className='text-sm text-slate-700'>
                              Middle Name
                            </span>
                            <div className='flex items-center gap-2'>
                              {getStatusIcon(
                                verificationResult.middleNameStatus
                              )}
                              <span
                                className={cn(
                                  'text-sm font-medium',
                                  getStatusColor(
                                    verificationResult.middleNameStatus
                                  )
                                )}
                              >
                                {verificationResult.middleNameStatus.replace(
                                  /_/g,
                                  ' '
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                        {verificationResult.lastNameStatus && (
                          <div className='flex items-center justify-between py-2 border-b border-slate-100 last:border-0'>
                            <span className='text-sm text-slate-700'>
                              Last Name
                            </span>
                            <div className='flex items-center gap-2'>
                              {getStatusIcon(verificationResult.lastNameStatus)}
                              <span
                                className={cn(
                                  'text-sm font-medium',
                                  getStatusColor(
                                    verificationResult.lastNameStatus
                                  )
                                )}
                              >
                                {verificationResult.lastNameStatus.replace(
                                  /_/g,
                                  ' '
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className='bg-slate-50 border border-slate-200 rounded-lg p-4'>
                  <div className='flex items-center gap-3'>
                    <AlertCircle className='w-5 h-5 text-slate-400 flex-shrink-0' />
                    <div className='flex-1'>
                      <div className='text-xs text-slate-500'>
                        Submit the payment form to see the verification result
                        here.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      }
    >
      {/* Success State */}
      {paymentResult?.status === 'success' && (
        <div className='flex-1 flex flex-col items-center justify-center text-center p-8 animate-in zoom-in-95 duration-300'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm'>
            <Check className='w-8 h-8 text-green-600' />
          </div>
          <h3 className='text-xl font-bold text-slate-900 mb-2'>
            Payment Successful!
          </h3>
          <p className='text-sm text-slate-500 mb-8 max-w-[300px] mx-auto'>
            Your payment has been processed successfully.
          </p>
          <button
            onClick={() => {
              setPaymentResult(null)
              setVerificationResult(null)
              window.location.reload()
            }}
            className='inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md'
          >
            Start New Payment
          </button>
        </div>
      )}

      {/* Error State */}
      {paymentResult?.status === 'error' && (
        <div className='flex-1 flex flex-col items-center justify-center text-center p-8 animate-in zoom-in-95 duration-300'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-sm'>
            <XCircle className='w-8 h-8 text-red-600' />
          </div>
          <h3 className='text-xl font-bold text-slate-900 mb-2'>
            Payment Failed
          </h3>
          <p className='text-sm text-slate-500 mb-8 max-w-[300px] mx-auto'>
            {paymentResult.message ||
              'An error occurred during payment processing.'}
          </p>
          <button
            onClick={() => {
              setPaymentResult(null)
              window.location.reload()
            }}
            className='inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md'
          >
            Try Again
          </button>
        </div>
      )}

      {/* Payment Form Container */}
      <div
        id='card-holder-verification-payment-form'
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
