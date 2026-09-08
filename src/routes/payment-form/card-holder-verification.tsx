import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
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
  Pencil,
  PlayCircle,
} from 'lucide-react'
import { PreviewState } from '@/components/preview-state'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createSdkLogEvent, type SdkLogEvent } from '@/lib/sdk-events'
import { assertXMoneyLoaded } from '@/lib/create-order'
import type {
  PaymentFormConfig,
  PaymentFormInstance,
} from '@/types/xmoney-sdk/payment-form-sdk.types'

type VerificationBehavior = 'auto' | 'always_continue' | 'always_cancel'

const STORAGE_KEY = 'chv-settings'

interface ChvPersistedSettings {
  firstName: string
  middleName: string
  lastName: string
  behavior: VerificationBehavior
}

function loadPersistedSettings(): ChvPersistedSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    firstName: 'John',
    middleName: '',
    lastName: 'Doe',
    behavior: 'auto',
  }
}

function persistSettings(settings: ChvPersistedSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {}
}

const testScenarios = [
  { status: 'MATCHED' as const, firstName: 'John', lastName: 'Doe' },
  { status: 'NOT_MATCHED' as const, firstName: 'Michael', lastName: 'Brown' },
  {
    status: 'PARTIAL_MATCHED' as const,
    firstName: 'Sarah',
    lastName: 'Johnson',
  },
  { status: 'NOT_VERIFIED' as const, firstName: 'David', lastName: 'Smith' },
  { status: 'NOT_SUPPORTED' as const, firstName: 'Emily', lastName: 'Davis' },
]

export const Route = createFileRoute('/payment-form/card-holder-verification')({
  component: CardHolderVerification,
})

function CardHolderVerification() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<SdkLogEvent[]>([])

  const logEvent = (name: SdkLogEvent['name'], payload?: unknown) => {
    setEvents((prev) => [...prev, createSdkLogEvent(name, payload)])
  }

  // Payment specifics
  const [amount] = useState(50)
  const [currency] = useState('EUR')

  // Restore persisted settings
  const [persisted] = useState(loadPersistedSettings)

  // Card Holder Verification Data
  const [verificationData, setVerificationData] = useState({
    firstName: persisted.firstName,
    middleName: persisted.middleName,
    lastName: persisted.lastName,
  })

  // Local input state (not tied to SDK reinit)
  const [inputFirstName, setInputFirstName] = useState(persisted.firstName)
  const [inputMiddleName, setInputMiddleName] = useState(persisted.middleName)
  const [inputLastName, setInputLastName] = useState(persisted.lastName)

  // Track active scenario selection
  const [activeScenario, setActiveScenario] = useState<string>(() => {
    const match = testScenarios.find(
      (s) =>
        s.firstName === persisted.firstName &&
        s.lastName === persisted.lastName &&
        persisted.middleName === ''
    )
    return match?.status ?? ''
  })

  // Verification behavior (ref to avoid SDK reinit on change)
  const [verificationBehavior, setVerificationBehavior] =
    useState<VerificationBehavior>(persisted.behavior)
  const verificationBehaviorRef =
    useRef<VerificationBehavior>(verificationBehavior)
  verificationBehaviorRef.current = verificationBehavior

  // Snapshot of name sent to SDK (for display alongside result)
  const [sentName, setSentName] = useState(verificationData)

  // Verification result
  const [verificationResult, setVerificationResult] =
    useState<CardHolderVerificationResult | null>(null)

  // Payment result
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
    setVerificationResult(null)
    setSessionId((n) => n + 1)
  }

  useEffect(() => {
    let mounted = true
    let sdkInstance: PaymentFormInstance | null = null

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

        if (window.XMoney) {
          assertXMoneyLoaded()
          const container = document.getElementById(
            'card-holder-verification-payment-form'
          )
          if (!container) return
          container.innerHTML = ''

          const sdkConfig: PaymentFormConfig = {
            container: 'card-holder-verification-payment-form',
            publicKey: publicKey,
            orderPayload: data.payload,
            orderChecksum: data.checksum,
            card: {
              validationMode: 'onBlur',
              savedCards: { enabled: false },
              inputs: { grouping: 'spaced' },
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
                  setSentName({ ...verificationData })

                  const behavior = verificationBehaviorRef.current
                  if (behavior === 'always_continue') return true
                  if (behavior === 'always_cancel') return false
                  return result.status === MatchStatusEnum.Matched
                },
              },
            },
            options: {
              locale: 'en-US',
            },
            onReady: () => {
              if (mounted) setLoading(false)
              logEvent('onReady')
            },
            onError: (err: { code: number | string; message: string } | string) => {
              logEvent('onError', err)
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
            onPaymentProcessing: (isProcessing) => {
              logEvent('onPaymentProcessing', { isProcessing })
            },
            onPaymentComplete: (transaction) => {
              logEvent('onPaymentComplete', transaction)
              if (mounted) {
                setLoading(false)
                setPaymentResult({
                  status: 'success',
                  data: transaction,
                })
              }
            },
          }
          sdkInstance = await window.XMoney.paymentForm(sdkConfig)
        } else {
          throw new Error(
            'xMoney SDK is not loaded. Check the SDK version in the header and refresh the page.'
          )
        }
      } catch (err) {
        console.error(err)
        if (mounted) {
          setLoading(false)
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to initialize checkout'
          )
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
    sessionId,
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
const checkout = await window.XMoney.paymentForm({
  container: 'payment-form-widget',
  publicKey: '${initData?.publicKey || '<YOUR_PUBLIC_KEY>'}',
  orderPayload: '${initData?.payload ? initData.payload.substring(0, 30) + '...' : '<YOUR_ORDER_PAYLOAD>'}',
  orderChecksum: '${initData?.checksum ? initData.checksum.substring(0, 30) + '...' : '<YOUR_ORDER_CHECKSUM>'}',
  card: {
    savedCards: { enabled: false },
    inputs: { grouping: 'spaced' },
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

        // Return true to proceed with payment, false to cancel
        // You can decide based on the result or your own business logic
        ${verificationBehavior === 'always_continue' ? 'return true // Always proceed with payment' : verificationBehavior === 'always_cancel' ? 'return false // Always cancel payment' : 'return result.status === MatchStatusEnum.Matched'}
      }
    }
  },
  onReady: () => {
    console.log('Payment form ready')
  },
  onError: (err) => {
    console.error('Payment error', err) 
  },
  onPaymentComplete: (transaction) => {
    console.log('Payment complete', transaction)
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
      error={error}
      onRefresh={restartPayment}
      events={events}
      onClearEvents={() => setEvents([])}
      codeTabs={codeTabs}
      sidebarContent={
        <div className='flex flex-col h-full'>
          <div className='border-b border-slate-200 px-4 pt-4 pb-2 sm:px-6'>
            <h2 className='text-sm font-semibold text-slate-900 mb-1'>
              Card Holder Name Verification
            </h2>
            <p className='text-xs text-slate-500'>
              Verify the cardholder's name against bank records during payment
              to enhance security.
            </p>
          </div>
          <div className='flex-1 overflow-y-auto space-y-4 p-4 sm:space-y-6 sm:p-5 md:p-6'>
            {/* Test Combinations */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <TestTube className='w-4 h-4 text-slate-600' />
                <h3 className='text-sm font-semibold text-slate-900'>
                  Test Combinations
                </h3>
              </div>
              <p className='text-xs text-slate-600'>
                Select a predefined scenario or enter a custom name below
              </p>
              <Select
                value={activeScenario}
                onValueChange={(value) => {
                  const scenario = testScenarios.find((s) => s.status === value)
                  if (scenario) {
                    setActiveScenario(value)
                    setInputFirstName(scenario.firstName)
                    setInputMiddleName('')
                    setInputLastName(scenario.lastName)
                    setVerificationData({
                      firstName: scenario.firstName,
                      middleName: '',
                      lastName: scenario.lastName,
                    })
                    persistSettings({
                      firstName: scenario.firstName,
                      middleName: '',
                      lastName: scenario.lastName,
                      behavior: verificationBehavior,
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
                      {scenario.status} - {scenario.firstName}{' '}
                      {scenario.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='h-px bg-slate-200' />

            {/* Manual Name Input */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Pencil className='w-4 h-4 text-slate-600' />
                <h3 className='text-sm font-semibold text-slate-900'>
                  Custom Name
                </h3>
              </div>
              <p className='text-xs text-slate-600'>
                Edit the name fields and apply to reinitialize the form
              </p>
              <div className='space-y-2'>
                <div>
                  <Label
                    htmlFor='chv-firstName'
                    className='text-xs text-slate-600'
                  >
                    First Name
                  </Label>
                  <Input
                    id='chv-firstName'
                    value={inputFirstName}
                    onChange={(e) => {
                      setInputFirstName(e.target.value)
                      setActiveScenario('')
                    }}
                    className='h-8 text-sm mt-1'
                    placeholder='e.g. John'
                  />
                </div>
                <div>
                  <Label
                    htmlFor='chv-middleName'
                    className='text-xs text-slate-600'
                  >
                    Middle Name
                  </Label>
                  <Input
                    id='chv-middleName'
                    value={inputMiddleName}
                    onChange={(e) => {
                      setInputMiddleName(e.target.value)
                      setActiveScenario('')
                    }}
                    className='h-8 text-sm mt-1'
                    placeholder='(optional)'
                  />
                </div>
                <div>
                  <Label
                    htmlFor='chv-lastName'
                    className='text-xs text-slate-600'
                  >
                    Last Name
                  </Label>
                  <Input
                    id='chv-lastName'
                    value={inputLastName}
                    onChange={(e) => {
                      setInputLastName(e.target.value)
                      setActiveScenario('')
                    }}
                    className='h-8 text-sm mt-1'
                    placeholder='e.g. Doe'
                  />
                </div>
              </div>
              <Button
                size='sm'
                className='w-full'
                disabled={
                  inputFirstName === verificationData.firstName &&
                  inputMiddleName === verificationData.middleName &&
                  inputLastName === verificationData.lastName
                }
                onClick={() => {
                  setVerificationData({
                    firstName: inputFirstName,
                    middleName: inputMiddleName,
                    lastName: inputLastName,
                  })
                  persistSettings({
                    firstName: inputFirstName,
                    middleName: inputMiddleName,
                    lastName: inputLastName,
                    behavior: verificationBehavior,
                  })
                }}
              >
                Apply & Reinitialize
              </Button>
            </div>

            <div className='h-px bg-slate-200' />

            {/* Payment Decision */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <PlayCircle className='w-4 h-4 text-slate-600' />
                <h3 className='text-sm font-semibold text-slate-900'>
                  Payment Decision
                </h3>
              </div>
              <p className='text-xs text-slate-600'>
                Control whether the payment proceeds after verification
              </p>
              <Select
                value={verificationBehavior}
                onValueChange={(value: string) => {
                  setVerificationBehavior(value as VerificationBehavior)
                  persistSettings({
                    firstName: verificationData.firstName,
                    middleName: verificationData.middleName,
                    lastName: verificationData.lastName,
                    behavior: value as VerificationBehavior,
                  })
                }}
              >
                <SelectTrigger className='h-9 text-sm'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='auto'>
                    Auto (proceed only on MATCHED)
                  </SelectItem>
                  <SelectItem value='always_continue'>
                    Always continue payment
                  </SelectItem>
                  <SelectItem value='always_cancel'>
                    Always cancel payment
                  </SelectItem>
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
                            <div className='flex flex-col'>
                              <span className='text-sm text-slate-700'>
                                First Name
                              </span>
                              <span className='text-xs text-slate-400 font-mono'>
                                &quot;{sentName.firstName}&quot;
                              </span>
                            </div>
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
                            <div className='flex flex-col'>
                              <span className='text-sm text-slate-700'>
                                Middle Name
                              </span>
                              <span className='text-xs text-slate-400 font-mono'>
                                &quot;{sentName.middleName}&quot;
                              </span>
                            </div>
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
                            <div className='flex flex-col'>
                              <span className='text-sm text-slate-700'>
                                Last Name
                              </span>
                              <span className='text-xs text-slate-400 font-mono'>
                                &quot;{sentName.lastName}&quot;
                              </span>
                            </div>
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
        <PreviewState>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm'>
            <Check className='w-8 h-8 text-green-600' />
          </div>
          <h3 className='text-xl font-bold text-slate-900 mb-2'>
            Payment Successful!
          </h3>
          <p className='text-sm text-slate-500 mb-8 max-w-[300px] mx-auto'>
            Your payment has been processed successfully.
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
            className='inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md'
          >
            Start New Payment
          </button>
        </PreviewState>
      )}

      {/* Error State */}
      {paymentResult?.status === 'error' && (
        <PreviewState>
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
            onClick={restartPayment}
            className='inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md'
          >
            Try Again
          </button>
        </PreviewState>
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
