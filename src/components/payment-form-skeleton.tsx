import { cn } from '@/lib/utils'

/** Matches SDK default wallet button height (Google Pay & Apple Pay). */
export const WALLET_PAY_BUTTON_HEIGHT_PX = 48

/**
 * Condensed paymentCard slot: title + 3-row card group (number, expiry/cvv, name).
 * 20px title + 12px gap + 132px field block = 164px; 168px leaves a little breathing room.
 */
export const CONDENSED_CARD_FORM_SLOT_HEIGHT_PX = 168

export function PaymentFormSkeleton({
  showSubmitRow = true,
  className,
}: {
  showSubmitRow?: boolean
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className='h-10 animate-pulse rounded-lg bg-slate-100' />
      <div className='grid grid-cols-2 gap-3'>
        <div className='h-10 animate-pulse rounded-lg bg-slate-100' />
        <div className='h-10 animate-pulse rounded-lg bg-slate-100' />
      </div>
      <div className='h-10 animate-pulse rounded-lg bg-slate-100' />
      {showSubmitRow && (
        <div className='h-11 animate-pulse rounded-xl bg-slate-100' />
      )}
    </div>
  )
}

export function WalletPayButtonSlot({
  containerId,
  isReady,
  className,
  skeletonClassName,
  skeletonRadius = 'rounded',
  fillParent = false,
}: {
  containerId: string
  isReady: boolean
  className?: string
  skeletonClassName?: string
  skeletonRadius?: 'rounded' | 'pill'
  fillParent?: boolean
}) {
  return (
    <div
      className={cn('relative w-full', fillParent && 'h-full', className)}
      style={fillParent ? undefined : { height: WALLET_PAY_BUTTON_HEIGHT_PX }}
    >
      <div
        id={containerId}
        className={cn(
          'h-full w-full',
          !isReady && 'pointer-events-none opacity-0'
        )}
      />
      {!isReady && (
        <div
          className={cn(
            'absolute inset-0 animate-pulse bg-muted',
            skeletonRadius === 'pill' ? 'rounded-full' : 'rounded-2xl',
            skeletonClassName
          )}
        />
      )}
    </div>
  )
}

export function CondensedCardFormSkeleton({
  className,
  variant = 'default',
}: {
  className?: string
  variant?: 'default' | 'jewelry'
}) {
  const isJewelry = variant === 'jewelry'

  return (
    <div
      className={cn('flex flex-col gap-3', className)}
      style={{ height: CONDENSED_CARD_FORM_SLOT_HEIGHT_PX }}
    >
      <div
        className={cn(
          'h-5 w-28 shrink-0 animate-pulse rounded',
          isJewelry ? 'bg-[#C5CAE9]/70' : 'bg-[#E8D4D8]/80'
        )}
      />
      <div
        className={cn(
          'shrink-0 overflow-hidden border bg-white',
          isJewelry
            ? 'rounded-[10px] border-[#C5CAE9]'
            : 'rounded-[14px] border-[#E8D4D8]'
        )}
      >
        <div
          className={cn(
            'h-11 animate-pulse border-b',
            isJewelry
              ? 'border-[#E8EAF6] bg-[#F5F7FF]'
              : 'border-[#E8D4D8]/70 bg-[#FFF5F6]'
          )}
        />
        <div
          className={cn(
            'grid grid-cols-2 border-b',
            isJewelry ? 'border-[#E8EAF6]' : 'border-[#E8D4D8]/70'
          )}
        >
          <div
            className={cn(
              'h-11 animate-pulse border-r',
              isJewelry
                ? 'border-[#E8EAF6] bg-[#F5F7FF]'
                : 'border-[#E8D4D8]/70 bg-[#FFF5F6]'
            )}
          />
          <div
            className={cn(
              'h-11 animate-pulse',
              isJewelry ? 'bg-[#F5F7FF]' : 'bg-[#FFF5F6]'
            )}
          />
        </div>
        <div
          className={cn(
            'h-11 animate-pulse',
            isJewelry ? 'bg-[#F5F7FF]' : 'bg-[#FFF5F6]'
          )}
        />
      </div>
    </div>
  )
}

export function CondensedCardFormSlot({
  isReady,
  containerId,
  className,
  skeletonVariant = 'default',
}: {
  isReady: boolean
  containerId: string
  className?: string
  skeletonVariant?: 'default' | 'jewelry'
}) {
  return (
    <div
      className={cn('relative', className)}
      style={isReady ? undefined : { height: CONDENSED_CARD_FORM_SLOT_HEIGHT_PX }}
    >
      <div
        id={containerId}
        className={cn(
          'transition-opacity duration-200',
          !isReady && 'pointer-events-none opacity-0'
        )}
      />
      {!isReady && (
        <div className='absolute inset-0'>
          <CondensedCardFormSkeleton variant={skeletonVariant} />
        </div>
      )}
    </div>
  )
}
