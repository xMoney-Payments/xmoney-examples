import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { getApiCredentials } from '@/lib/credentials'
import {
  CreditCard,
  Trash2,
  Plus,
  Info,
  Hash,
  User,
  Globe,
  MapPin,
  Mail,
  Loader2,
} from 'lucide-react'
import { TwoColumnLayout, type CodeTab } from '@/components/two-column-layout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { formatConfigToJS } from '@/lib/format-utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export const Route = createFileRoute('/examples/verify-card')({
  component: VerifyCardPage,
})

interface SavedCard {
  id: string
  brand: 'mastercard' | 'visa'
  last4: string
  expMonth: string
  expYear: string
  cardholderName: string
}

function VerifyCardPage() {
  const [loading, setLoading] = useState(true)
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [loadingCards, setLoadingCards] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<string | null>(null)
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null)
  const isDeletingRef = useRef<string | null>(null)
  const [initData, setInitData] = useState<{
    publicKey: string
    payload: string
    checksum: string
  } | null>(null)
  const [customerData, setCustomerData] = useState({
    identifier: 'customer-12333',
    firstName: 'John',
    lastName: 'Doe',
    country: 'RO',
    city: 'Bucharest',
    email: 'john.doe@test.com',
  })

  // Fetch customer cards when identifier changes
  useEffect(() => {
    const fetchCustomerCards = async () => {
      if (!customerData.identifier.trim()) {
        setSavedCards([])
        return
      }

      setLoadingCards(true)
      try {
        const { apiKey, isLive } = getApiCredentials()
        if (!apiKey) {
          console.warn('API key not found')
          setSavedCards([])
          setLoadingCards(false)
          return
        }

        const response = await fetch('/api/get-cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerIdentifier: customerData.identifier,
            apiKey,
            isLive,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Failed to fetch customer cards:', errorData)
          setSavedCards([])
          setLoadingCards(false)
          return
        }

        const data = await response.json()

        // Map API response to SavedCard format
        if (data.data && Array.isArray(data.data)) {
          const mappedCards: SavedCard[] = data.data.map((card: any) => {
            // Normalize card type to match our interface
            // Extract last4 from cardNumber (format: "411111******1111")
            const last4 = card.cardNumber?.replace(/\*/g, '').slice(-4) || ''

            // Normalize card type to match our interface (type is lowercase: "visa" or "mastercard")
            const brand =
              card.type?.toLowerCase() === 'mastercard'
                ? 'mastercard'
                : card.type?.toLowerCase() === 'visa'
                  ? 'visa'
                  : 'visa' // default fallback

            return {
              id: card.id?.toString() || Date.now().toString(),
              brand: brand as 'mastercard' | 'visa',
              last4: last4,
              expMonth: card.expiryMonth || '',
              expYear: card.expiryYear || '',
              cardholderName:
                card.nameOnCard ||
                `${customerData.firstName} ${customerData.lastName}`.trim() ||
                'Cardholder',
            }
          })
          setSavedCards(mappedCards)
        } else {
          setSavedCards([])
        }
      } catch (error) {
        console.error('Error fetching customer cards:', error)
        setSavedCards([])
      } finally {
        setLoadingCards(false)
      }
    }

    fetchCustomerCards()
  }, [customerData.identifier])

  useEffect(() => {
    let mounted = true
    let sdkInstance: any = null

    const initVerifyCard = async () => {
      if (!showAddCard) {
        return
      }

      setLoading(true)

      try {
        const { publicKey, apiKey } = getApiCredentials()

        const response = await fetch('/api/verify-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currency: 'EUR',
            description: 'Card Verification',
            publicKey,
            apiKey,
            customer: customerData,
          }),
        })

        if (!response.ok) throw new Error('Failed to init verify card')
        const data = await response.json()

        if (!mounted) return

        setInitData({
          publicKey,
          payload: data.payload,
          checksum: data.checksum,
        })

        // @ts-ignore
        if (window.XMoney) {
          const container = document.getElementById('verify-card-form')
          if (!container) return
          container.innerHTML = ''

          const sdkConfig: any = {
            container: 'verify-card-form',
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
            },
            onReady: () => {
              if (mounted) setLoading(false)
              console.log('Verify card form ready')
            },
            onError: (err: any) => {
              console.error('Verify card error', err)
              if (mounted) {
                setLoading(false)
              }
            },
            onPaymentComplete: async (data: any) => {
              console.log('Card verified', data)
              if (mounted) {
                setLoading(false)
                setShowAddCard(false)
                // Refresh the customer cards list
                try {
                  const { apiKey, isLive } = getApiCredentials()
                  if (apiKey && customerData.identifier) {
                    const response = await fetch('/api/get-cards', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        customerIdentifier: customerData.identifier,
                        apiKey,
                        isLive,
                      }),
                    })
                    if (response.ok) {
                      const cardData = await response.json()
                      if (cardData.data && Array.isArray(cardData.data)) {
                        const mappedCards: SavedCard[] = cardData.data.map(
                          (card: any) => {
                            // Extract last4 from cardNumber (format: "411111******1111")
                            const last4 =
                              card.cardNumber?.replace(/\*/g, '').slice(-4) ||
                              ''

                            // Normalize card type to match our interface (type is lowercase: "visa" or "mastercard")
                            const brand =
                              card.type?.toLowerCase() === 'mastercard'
                                ? 'mastercard'
                                : card.type?.toLowerCase() === 'visa'
                                  ? 'visa'
                                  : 'visa' // default fallback

                            return {
                              id: card.id?.toString() || Date.now().toString(),
                              brand: brand as 'mastercard' | 'visa',
                              last4: last4,
                              expMonth: card.expiryMonth || card.expMonth || '',
                              expYear: card.expiryYear || card.expYear || '',
                              cardholderName:
                                card.nameOnCard ||
                                `${customerData.firstName} ${customerData.lastName}`.trim() ||
                                'Cardholder',
                            }
                          }
                        )
                        setSavedCards(mappedCards)
                      }
                    }
                  }
                } catch (error) {
                  console.error('Error refreshing cards after payment:', error)
                }
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
        }
      }
    }

    initVerifyCard()

    return () => {
      mounted = false
      if (sdkInstance) {
        try {
          const container = document.getElementById('verify-card-form')
          if (container && container.parentNode) {
            sdkInstance.destroy()
          }
        } catch (e) {
          // Silently ignore destroy errors - the SDK may have already cleaned up
        }
      }
    }
  }, [showAddCard])

  // Reset loading when modal closes
  useEffect(() => {
    if (!showAddCard) {
      setLoading(false)
      const container = document.getElementById('verify-card-form')
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [showAddCard])

  const handleDelete = async (cardId: string) => {
    try {
      const { apiKey, isLive } = getApiCredentials()
      if (!apiKey) {
        console.error('API key not found')
        isDeletingRef.current = null
        setDeletingCardId(null)
        return
      }

      const response = await fetch('/api/delete-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          apiKey,
          isLive,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to delete card:', errorData)
        alert('Failed to delete card. Please try again.')
        isDeletingRef.current = null
        setDeletingCardId(null)
        return
      }

      // Remove the card from the local state
      setSavedCards(savedCards.filter((card) => card.id !== cardId))
      // Close the dialog after successful deletion
      isDeletingRef.current = null
      setCardToDelete(null)
      setDeletingCardId(null)
    } catch (error) {
      console.error('Error deleting card:', error)
      alert('An error occurred while deleting the card. Please try again.')
      isDeletingRef.current = null
      setDeletingCardId(null)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    window.location.reload()
  }

  const codeTabs: CodeTab[] = [
    {
      value: 'client',
      label: 'verify-card.tsx',
      language: 'javascript',
      content: `const xMoney = await window.XMoney.paymentForm({
  container: 'verify-card-form',
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
      },
      2
    )
    return str
      .split('\n')
      .map((line: string, i: number) => (i === 0 ? line : '  ' + line))
      .join('\n')
  })()},
  onReady: () => {
    console.log('Verify card form ready')
  },
  onError: (error) => {
    console.error('Verify card error', error)
  },
  onPaymentComplete: (data) => {
    console.log('Card verified', data)
    // Save the card for later use
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
    orderId: 'verify-card-' + Date.now(),
    description: 'Card Verification',
    type: 'purchase',
    amount: 0,
    currency: 'EUR',
  },
  cardTransactionMode: 'verifyCard',
  backUrl: 'https://mysite.com/verify-card'
}

// Secret API Key (Keep this safe on your server)
const apiKey = '<YOUR_API_KEY>'

const payload = getBase64JsonRequest(orderData)
const checksum = getBase64Checksum(orderData, apiKey)

// Pass 'payload' and 'checksum' to your frontend`,
    },
  ]

  const getCardBrandLogo = (brand: string) => {
    if (brand === 'mastercard') {
      return (
        <div className='flex items-center justify-center w-10 h-10 rounded-md bg-slate-50 border border-slate-200'>
          <img
            src='/mastercard_symbol.svg'
            alt='Mastercard'
            className='w-7 h-5 object-contain'
          />
        </div>
      )
    }
    if (brand === 'visa') {
      return (
        <div className='flex items-center justify-center w-10 h-10 rounded-md bg-slate-50 border border-slate-200'>
          <img
            src='/visa_blue.png'
            alt='Visa'
            className='w-7 h-5 object-contain'
          />
        </div>
      )
    }
    return null
  }

  return (
    <TwoColumnLayout
      title='Verify Card'
      icon={<CreditCard className='w-4 h-4' />}
      codeTabs={codeTabs}
      onRefresh={handleRefresh}
      loading={loading && showAddCard}
    >
      <div className='bg-white min-h-full'>
        <div className='max-w-6xl mx-auto p-4 sm:p-6 lg:p-8'>
          {/* Header */}
          <div className='mb-6 sm:mb-8'>
            <h1 className='text-xl sm:text-2xl font-semibold text-slate-900 mb-2'>
              Account Settings
            </h1>
            <p className='text-sm text-slate-600'>
              Manage your account details and payment cards
            </p>
          </div>

          {/* Two Column Layout */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8'>
            {/* Left Column - User Details */}
            <div>
              <div className='bg-white rounded-lg border border-slate-200'>
                {/* Header Section */}
                <div className='px-5 sm:px-6 py-5 border-b border-slate-100'>
                  <h2 className='text-lg font-semibold text-slate-900 tracking-tight'>
                    Account Information
                  </h2>
                  <p className='text-xs text-slate-500 mt-1'>
                    Update your account details
                  </p>
                </div>

                {/* Content Section */}
                <div className='p-5 sm:p-6 space-y-5'>
                  <div className='space-y-1.5'>
                    <div className='flex items-center gap-2'>
                      <Label
                        htmlFor='identifier'
                        className='text-xs font-medium text-slate-600 uppercase tracking-wide'
                      >
                        ID
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type='button'
                            className='inline-flex items-center justify-center'
                            onClick={(e) => e.preventDefault()}
                          >
                            <Info className='w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors' />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className='max-w-xs'>
                          <p className='font-medium mb-1'>ID</p>
                          <p className='text-xs'>
                            This is the unique identifier from your own system
                            (e.g., user ID, customer ID, account number) used to
                            associate payment cards with a specific customer in
                            your database.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className='relative'>
                      <Hash className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                      <Input
                        id='identifier'
                        value={customerData.identifier}
                        onChange={(e) =>
                          setCustomerData({
                            ...customerData,
                            identifier: e.target.value,
                          })
                        }
                        className='w-full h-10 pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400'
                        placeholder='customer-12333'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div className='space-y-1.5'>
                      <Label
                        htmlFor='firstName'
                        className='text-xs font-medium text-slate-600 uppercase tracking-wide'
                      >
                        First Name
                      </Label>
                      <div className='relative'>
                        <User className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                        <Input
                          id='firstName'
                          value={customerData.firstName}
                          onChange={(e) =>
                            setCustomerData({
                              ...customerData,
                              firstName: e.target.value,
                            })
                          }
                          className='w-full h-10 pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400'
                          placeholder='John'
                        />
                      </div>
                    </div>
                    <div className='space-y-1.5'>
                      <Label
                        htmlFor='lastName'
                        className='text-xs font-medium text-slate-600 uppercase tracking-wide'
                      >
                        Last Name
                      </Label>
                      <div className='relative'>
                        <User className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                        <Input
                          id='lastName'
                          value={customerData.lastName}
                          onChange={(e) =>
                            setCustomerData({
                              ...customerData,
                              lastName: e.target.value,
                            })
                          }
                          className='w-full h-10 pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400'
                          placeholder='Doe'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div className='space-y-1.5'>
                      <Label
                        htmlFor='country'
                        className='text-xs font-medium text-slate-600 uppercase tracking-wide'
                      >
                        Country
                      </Label>
                      <div className='relative'>
                        <Globe className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                        <Input
                          id='country'
                          value={customerData.country}
                          onChange={(e) =>
                            setCustomerData({
                              ...customerData,
                              country: e.target.value,
                            })
                          }
                          className='w-full h-10 pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400'
                          placeholder='RO'
                          maxLength={2}
                        />
                      </div>
                    </div>
                    <div className='space-y-1.5'>
                      <Label
                        htmlFor='city'
                        className='text-xs font-medium text-slate-600 uppercase tracking-wide'
                      >
                        City
                      </Label>
                      <div className='relative'>
                        <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                        <Input
                          id='city'
                          value={customerData.city}
                          onChange={(e) =>
                            setCustomerData({
                              ...customerData,
                              city: e.target.value,
                            })
                          }
                          className='w-full h-10 pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400'
                          placeholder='Bucharest'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='email'
                      className='text-xs font-medium text-slate-600 uppercase tracking-wide'
                    >
                      Email Address
                    </Label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                      <Input
                        id='email'
                        type='email'
                        value={customerData.email}
                        onChange={(e) =>
                          setCustomerData({
                            ...customerData,
                            email: e.target.value,
                          })
                        }
                        className='w-full h-10 pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400'
                        placeholder='john.doe@test.com'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Cards */}
            <div>
              <div className='mb-4 sm:mb-6'>
                <h2 className='text-base sm:text-lg font-semibold text-slate-900 mb-1'>
                  Saved Cards
                </h2>
                <p className='text-sm text-slate-600 mb-3'>
                  Manage your saved cards for faster checkout
                </p>
                <div className='flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                  <Info className='w-4 h-4 text-blue-600 mt-0.5 shrink-0' />
                  <p className='text-xs text-blue-800'>
                    Cards are verified with a zero-amount charge to ensure they
                    are valid and active.
                  </p>
                </div>
              </div>

              {/* Add New Card Button */}
              <div className='mb-4 sm:mb-6'>
                <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
                  <Button
                    onClick={() => setShowAddCard(true)}
                    variant='outline'
                    className='w-full sm:w-auto'
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Add Card
                  </Button>
                  <DialogContent className='sm:max-w-[480px] overflow-y-auto max-h-[90vh] p-0'>
                    <DialogHeader className='px-6 pt-6 pb-4'>
                      <DialogTitle className='text-xl font-semibold text-slate-900'>
                        Add Card
                      </DialogTitle>
                      <DialogDescription className='text-sm text-slate-600'>
                        Add a card to your account
                      </DialogDescription>
                    </DialogHeader>
                    <div className='relative min-h-[400px] px-6 pb-6'>
                      {loading && (
                        <div className='space-y-4 animate-in fade-in-0 duration-200'>
                          <div className='space-y-3'>
                            <Skeleton className='h-10 w-full' />
                            <Skeleton className='h-10 w-full' />
                            <div className='grid grid-cols-2 gap-3'>
                              <Skeleton className='h-10 w-full' />
                              <Skeleton className='h-10 w-full' />
                            </div>
                            <Skeleton className='h-10 w-full' />
                            <Skeleton className='h-12 w-full' />
                          </div>
                        </div>
                      )}
                      <div
                        id='verify-card-form'
                        className={cn(
                          'transition-all duration-300',
                          loading
                            ? 'opacity-0 absolute inset-0 pointer-events-none'
                            : 'opacity-100 relative'
                        )}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Saved Cards List */}
              <div className='mb-6'>
                {loadingCards ? (
                  <div className='space-y-3'>
                    <Skeleton className='h-20 w-full' />
                    <Skeleton className='h-20 w-full' />
                  </div>
                ) : savedCards.length > 0 ? (
                  <div className='max-h-[400px] overflow-y-auto space-y-2 pr-2'>
                    {savedCards.map((card) => (
                      <div
                        key={card.id}
                        className='group relative overflow-hidden rounded-lg border-2 border-slate-200 bg-white transition-all duration-200 hover:border-slate-300'
                      >
                        <div className='p-3'>
                          <div className='flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-3 flex-1 min-w-0'>
                              <div className='flex-shrink-0'>
                                {getCardBrandLogo(card.brand)}
                              </div>
                              <div className='flex-1 min-w-0 overflow-hidden'>
                                <div className='mb-1'>
                                  <span className='font-mono text-sm sm:text-base font-semibold tracking-wider text-slate-900 truncate block'>
                                    •••• •••• •••• {card.last4}
                                  </span>
                                </div>
                                <div className='text-xs font-medium text-slate-500 uppercase tracking-wide truncate'>
                                  Expires {card.expMonth}/{card.expYear}
                                </div>
                              </div>
                            </div>
                            <div className='flex items-center flex-shrink-0'>
                              <AlertDialog
                                open={cardToDelete === card.id}
                                onOpenChange={(open) => {
                                  // Prevent closing the dialog while deletion is in progress
                                  if (
                                    !open &&
                                    isDeletingRef.current === card.id
                                  ) {
                                    return
                                  }
                                  setCardToDelete(open ? card.id : null)
                                }}
                              >
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50/50 transition-colors cursor-pointer'
                                  onClick={() => setCardToDelete(card.id)}
                                >
                                  <Trash2 className='w-3.5 h-3.5' />
                                </Button>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Card
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete the card
                                      ending in {card.last4}? This action cannot
                                      be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      disabled={deletingCardId === card.id}
                                    >
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={(e) => {
                                        e.preventDefault()
                                        if (
                                          cardToDelete &&
                                          deletingCardId !== card.id
                                        ) {
                                          isDeletingRef.current = card.id
                                          setDeletingCardId(card.id)
                                          handleDelete(cardToDelete)
                                        }
                                      }}
                                      disabled={deletingCardId === card.id}
                                      className='bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                      {deletingCardId === card.id ? (
                                        <>
                                          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                          Deleting...
                                        </>
                                      ) : (
                                        'Delete'
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='bg-slate-50 rounded-lg border border-slate-200 p-12 text-center'>
                    <CreditCard className='w-12 h-12 text-slate-400 mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-slate-900 mb-2'>
                      No cards
                    </h3>
                    <p className='text-sm text-slate-600 mb-6'>
                      Add a card to get started
                    </p>
                    <Button
                      onClick={() => setShowAddCard(true)}
                      className='bg-slate-900 hover:bg-slate-800 text-white'
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Add Card
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TwoColumnLayout>
  )
}
