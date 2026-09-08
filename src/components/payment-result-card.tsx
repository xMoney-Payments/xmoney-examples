import { useState } from 'react'
import { Check, ChevronDown, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TransactionDetails } from '@/types/checkout.types'
import { cn } from '@/lib/utils'

function formatSuccessDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTransactionStatus(status: string): string {
  if (status === 'complete-ok') return 'Completed'
  return 'Failed'
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className='flex items-start justify-between gap-4 py-3 text-sm'>
      <span className='text-slate-500'>{label}</span>
      <span
        className={cn(
          'text-right font-medium text-slate-900',
          mono && 'font-mono text-xs'
        )}
      >
        {value}
      </span>
    </div>
  )
}

export function PaymentResultCard({
  result,
  variant = 'success',
  errorMessage,
  onRestart,
}: {
  result?: TransactionDetails | null
  variant?: 'success' | 'error'
  errorMessage?: string
  onRestart: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isSuccess = variant === 'success' && result?.transactionStatus === 'complete-ok'

  return (
    <div className='mx-auto w-full max-w-md animate-in zoom-in-95 duration-300'>
      <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg sm:rounded-xl md:rounded-2xl'>
        <div
          className={cn(
            'px-4 py-6 text-center text-white sm:px-6 sm:py-8',
            isSuccess
              ? 'bg-gradient-to-br from-green-400 to-green-600'
              : 'bg-gradient-to-br from-red-400 to-red-600'
          )}
        >
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur'>
            {isSuccess ? (
              <Check className='h-8 w-8' />
            ) : (
              <span className='text-3xl font-bold'>!</span>
            )}
          </div>
          <h3 className='text-xl font-bold'>
            {isSuccess ? 'Payment Successful' : 'Payment Failed'}
          </h3>
          <p className='mt-1 text-sm text-white/80'>
            {isSuccess
              ? 'Your order has been confirmed'
              : errorMessage || 'Your payment could not be processed'}
          </p>
          {result && (
            <div className='mt-5 text-3xl font-bold tracking-tight'>
              {result.amount} {result.currencyKey}
            </div>
          )}
        </div>

        {result && (
          <div className='divide-y divide-slate-100 p-4 sm:p-6'>
            <DetailRow label='Transaction ID' value={`#${result.id}`} mono />
            <DetailRow
              label='Order ID'
              value={`#${result.externalOrderId}`}
              mono
            />
            <DetailRow
              label='Status'
              value={formatTransactionStatus(result.transactionStatus)}
            />
            {result.customerData?.creationDate && (
              <DetailRow
                label='Date'
                value={formatSuccessDate(result.customerData.creationDate)}
              />
            )}
            {result.description && (
              <DetailRow label='Description' value={result.description} />
            )}

            <button
              type='button'
              onClick={() => setExpanded((v) => !v)}
              className='flex w-full items-center justify-between py-2 text-sm font-medium text-slate-500 hover:text-slate-700'
            >
              <span>{expanded ? 'Hide raw response' : 'View raw response'}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  expanded && 'rotate-180'
                )}
              />
            </button>
            {expanded && (
              <pre className='max-h-40 overflow-auto rounded-lg bg-slate-50 p-3 text-[10px] text-slate-700'>
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}

        <div className='px-4 pb-4 sm:px-6 sm:pb-6'>
          <Button className='w-full' variant='outline' onClick={onRestart}>
            <RotateCw className='mr-2 h-4 w-4' />
            Start new order
          </Button>
        </div>
      </div>
    </div>
  )
}
