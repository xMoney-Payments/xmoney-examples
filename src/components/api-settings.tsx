import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Globe, Key, Lock, Check, ShieldCheck, AlertCircle } from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { cn } from '@/lib/utils'

export function ApiSettings() {
  const [storedSiteId, setStoredSiteId] = useLocalStorage('xmoney-site-id', '')
  const [storedPublicKey, setStoredPublicKey] = useLocalStorage(
    'xmoney-public-key',
    ''
  )
  const [storedSecretKey, setStoredSecretKey] = useLocalStorage(
    'xmoney-secret-key',
    ''
  )

  const [siteId, setSiteId] = useState(storedSiteId)
  const [publicKey, setPublicKey] = useState(storedPublicKey)
  const [secretKey, setSecretKey] = useState(storedSecretKey)
  const [isSaved, setIsSaved] = useState(false)

  // Sync local state when stored state changes
  useEffect(() => {
    setSiteId(storedSiteId)
    setPublicKey(storedPublicKey)
    setSecretKey(storedSecretKey)
  }, [storedSiteId, storedPublicKey, storedSecretKey])

  const [errors, setErrors] = useState<{
    siteId?: string
    publicKey?: string
    secretKey?: string
  }>({})

  const validate = () => {
    const newErrors: {
      siteId?: string
      publicKey?: string
      secretKey?: string
    } = {}
    let isValid = true

    if (!siteId.trim()) {
      newErrors.siteId = 'Site ID is required'
      isValid = false
    } else if (!/^[a-zA-Z0-9]+$/.test(siteId)) {
      // Optional: Assuming Site ID is alphanumeric. If not using strict alphanumeric, remove this.
      // But usually IDs are. Let's stick to required for now to be safe, or just check empty.
      // Actually, let's keep it simple: just checking it's present.
      // If user wants stricter, they'd specify. "Validation" usually means "format check".
      // Let's assume Site ID is a string.
    }

    const keyRegex = /^(pk|sk)_(test|live)_[a-zA-Z0-9]+$/

    if (!publicKey.trim()) {
      newErrors.publicKey = 'Public Key is required'
      isValid = false
    } else if (!keyRegex.test(publicKey)) {
      newErrors.publicKey = 'Public Key must start with pk_test_ or pk_live_'
      isValid = false
    }

    if (!secretKey.trim()) {
      newErrors.secretKey = 'Secret Key is required'
      isValid = false
    } else if (!keyRegex.test(secretKey)) {
      newErrors.secretKey = 'Secret Key must start with sk_test_ or sk_live_'
      isValid = false
    }

    // Validate matching environments
    if (publicKey && secretKey) {
      const pkEnv = publicKey.includes('_live_')
        ? 'live'
        : publicKey.includes('_test_')
          ? 'test'
          : null
      const skEnv = secretKey.includes('_live_')
        ? 'live'
        : secretKey.includes('_test_')
          ? 'test'
          : null

      if (pkEnv && skEnv && pkEnv !== skEnv) {
        newErrors.secretKey = `Environment mismatch: Public Key is ${pkEnv}, but Secret Key is ${skEnv}`
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSave = () => {
    if (!validate()) return

    setStoredSiteId(siteId)
    setStoredPublicKey(publicKey)
    setStoredSecretKey(secretKey)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const isConfigured = storedSiteId && storedPublicKey && storedSecretKey
  const isMissingConfig = !storedSiteId || !storedPublicKey || !storedSecretKey

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'ml-auto gap-2 transition-all shadow-sm border cursor-pointer',
            isMissingConfig
              ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
              : isConfigured
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 pl-3 pr-4'
                : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50'
          )}
        >
          <div
            className={cn(
              'flex h-2.5 w-2.5 relative items-center justify-center',
              isConfigured && 'mr-1'
            )}
          >
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                isMissingConfig
                  ? 'bg-amber-400'
                  : isConfigured
                    ? 'bg-emerald-400 opacity-20 duration-1000'
                    : 'hidden'
              )}
            ></span>
            <span
              className={cn(
                'relative inline-flex rounded-full h-2 w-2',
                isMissingConfig
                  ? 'bg-amber-500'
                  : isConfigured
                    ? 'bg-emerald-500'
                    : 'bg-slate-400'
              )}
            ></span>
          </div>

          <span className='font-medium text-xs'>
            {isMissingConfig
              ? 'Setup API'
              : isConfigured
                ? storedPublicKey.startsWith('pk_live_')
                  ? 'Live'
                  : 'Sandbox'
                : 'API'}
          </span>

          {isConfigured && <Check className='h-3.5 w-3.5 ml-1' />}
        </Button>
      </SheetTrigger>
      <SheetContent className='w-full sm:w-[500px] sm:max-w-md flex flex-col h-full p-0 overflow-y-auto'>
        <SheetHeader className='px-4 sm:px-6 pt-4 sm:pt-6 pb-2 border-b-0 text-left'>
          <SheetTitle className='text-lg sm:text-xl'>
            API Configuration
          </SheetTitle>
          <SheetDescription className='text-xs sm:text-sm'>
            Manage your xMoney API credentials securely.
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto px-4 sm:px-6 py-4'>
          {/* Status Banner */}
          <div
            className={cn(
              'rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-3 sm:gap-4 border',
              isConfigured
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            )}
          >
            {isConfigured ? (
              <ShieldCheck className='h-4 w-4 sm:h-5 sm:w-5 mt-0.5 shrink-0 text-green-600' />
            ) : (
              <AlertCircle className='h-4 w-4 sm:h-5 sm:w-5 mt-0.5 shrink-0 text-amber-600' />
            )}
            <div className='min-w-0 flex-1'>
              <h4 className='font-semibold text-xs sm:text-sm'>
                {isConfigured
                  ? 'Configuration Complete'
                  : 'Configuration Incomplete'}
              </h4>
              <p className='text-[11px] sm:text-xs mt-1 opacity-90 leading-relaxed'>
                {isConfigured
                  ? 'Your xMoney integration is ready to process requests.'
                  : 'You need to provide your Site ID and API keys to enable full functionality.'}
              </p>
            </div>
          </div>

          <div className='space-y-4 sm:space-y-6'>
            <div className='space-y-2'>
              <Label
                htmlFor='siteId'
                className='text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500'
              >
                Site ID
              </Label>
              <div className='relative'>
                <Globe className='absolute left-2.5 sm:left-3 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400' />
                <Input
                  id='siteId'
                  value={siteId}
                  onChange={(e) => {
                    setSiteId(e.target.value)
                    if (errors.siteId)
                      setErrors({ ...errors, siteId: undefined })
                  }}
                  placeholder='e.g. 123456'
                  className={cn(
                    'pl-8 sm:pl-9 text-sm sm:text-base font-mono h-9 sm:h-10',
                    errors.siteId && 'border-red-500 focus-visible:ring-red-500'
                  )}
                />
              </div>
              {errors.siteId && (
                <p className='text-[11px] sm:text-xs text-red-500'>
                  {errors.siteId}
                </p>
              )}
              <p className='text-[11px] sm:text-[12px] text-slate-400 leading-relaxed'>
                Found in your xMoney Merchant Dashboard under Websites.
              </p>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='publicKey'
                className='text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500'
              >
                Public Key
              </Label>
              <div className='relative'>
                <Key className='absolute left-2.5 sm:left-3 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400' />
                <Input
                  id='publicKey'
                  value={publicKey}
                  onChange={(e) => {
                    setPublicKey(e.target.value)
                    if (errors.publicKey)
                      setErrors({ ...errors, publicKey: undefined })
                  }}
                  placeholder='e.g. pk_test_...'
                  className={cn(
                    'pl-8 sm:pl-9 text-sm sm:text-base font-mono h-9 sm:h-10',
                    errors.publicKey &&
                      'border-red-500 focus-visible:ring-red-500'
                  )}
                />
              </div>
              {errors.publicKey && (
                <p className='text-[11px] sm:text-xs text-red-500'>
                  {errors.publicKey}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='secretKey'
                className='text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500'
              >
                Secret Key
              </Label>
              <div className='relative'>
                <Lock className='absolute left-2.5 sm:left-3 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400' />
                <Input
                  id='secretKey'
                  type='text'
                  value={secretKey}
                  onChange={(e) => {
                    setSecretKey(e.target.value)
                    if (errors.secretKey)
                      setErrors({ ...errors, secretKey: undefined })
                  }}
                  placeholder='e.g. sk_test_...'
                  className={cn(
                    'pl-8 sm:pl-9 text-sm sm:text-base font-mono h-9 sm:h-10',
                    errors.secretKey &&
                      'border-red-500 focus-visible:ring-red-500'
                  )}
                />
              </div>
              {errors.secretKey && (
                <p className='text-[11px] sm:text-xs text-red-500'>
                  {errors.secretKey}
                </p>
              )}

              <div className='rounded-md bg-amber-50 p-2 sm:p-2.5 border border-amber-200 mt-2'>
                <p className='text-[11px] sm:text-[12px] text-amber-800 leading-relaxed font-medium'>
                  <span className='font-bold'>⚠️ Warning:</span> The Secret Key
                  is used in these examples for demo purposes only. It should
                  never be exposed on the frontend and must only be used on the
                  backend. This setup is for illustration and convenience only.
                </p>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className='p-4 sm:p-6 pt-2 border-t-0 sm:justify-end gap-2 sm:gap-3 flex-row items-center'>
          <SheetClose asChild>
            <Button
              variant='outline'
              className='flex-1 sm:flex-none cursor-pointer text-sm sm:text-base h-9 sm:h-10'
            >
              Close
            </Button>
          </SheetClose>
          <Button
            onClick={handleSave}
            className='flex-1 sm:flex-none min-w-[120px] cursor-pointer text-sm sm:text-base h-9 sm:h-10'
          >
            {isSaved ? (
              <>
                <Check className='mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4' /> Saved
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
