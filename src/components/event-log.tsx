import { useState } from 'react'
import { Check, Copy, List, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SdkLogEvent } from '@/lib/sdk-events'

const NAME_COLORS: Record<string, string> = {
  onReady: 'text-emerald-400',
  onValidation: 'text-sky-400',
  onPaymentProcessing: 'text-amber-400',
  onPaymentChange: 'text-violet-400',
  onPaymentComplete: 'text-green-400',
  onError: 'text-red-400',
}

export function EventLogButton({
  events,
  onClear,
}: {
  events: SdkLogEvent[]
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyPayload = async (event: SdkLogEvent) => {
    const text = JSON.stringify(
      { name: event.name, payload: event.payload ?? null },
      null,
      2
    )
    await navigator.clipboard.writeText(text)
    setCopiedId(event.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div className='relative'>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        className='inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        title='SDK event log'
      >
        <List className='h-4 w-4' />
        <span className='hidden sm:inline'>Events</span>
        {events.length > 0 && (
          <span className='rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700'>
            {events.length}
          </span>
        )}
      </button>
      {open && (
        <div className='absolute right-0 top-full z-30 mt-2 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl'>
          <div className='flex items-center justify-between border-b border-slate-100 px-3 py-2'>
            <p className='text-xs font-semibold text-slate-800'>SDK event log</p>
            <div className='flex items-center gap-1'>
              <button
                type='button'
                onClick={onClear}
                className='rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                title='Clear'
              >
                <Trash2 className='h-3.5 w-3.5' />
              </button>
              <button
                type='button'
                onClick={() => setOpen(false)}
                className='rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700'
              >
                <X className='h-3.5 w-3.5' />
              </button>
            </div>
          </div>
          <div className='max-h-72 overflow-auto bg-slate-950 p-2 font-mono text-[11px]'>
            {events.length === 0 ? (
              <p className='px-2 py-6 text-center text-slate-500'>
                Callbacks will appear here as they fire.
              </p>
            ) : (
              [...events].reverse().map((event) => (
                <div
                  key={event.id}
                  className='mb-2 rounded border border-slate-800 bg-slate-900 p-2 last:mb-0'
                >
                  <div className='mb-1 flex items-center justify-between gap-2'>
                    <span
                      className={cn(
                        'font-semibold',
                        NAME_COLORS[event.name] ?? 'text-slate-300'
                      )}
                    >
                      {event.name}
                    </span>
                    <div className='flex items-center gap-2'>
                      <span className='text-slate-500'>
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                      <button
                        type='button'
                        onClick={() => copyPayload(event)}
                        className='text-slate-400 hover:text-white'
                        title='Copy event JSON'
                      >
                        {copiedId === event.id ? (
                          <Check className='h-3 w-3' />
                        ) : (
                          <Copy className='h-3 w-3' />
                        )}
                      </button>
                    </div>
                  </div>
                  {event.payload !== undefined && (
                    <pre className='overflow-auto whitespace-pre-wrap text-slate-300'>
                      {typeof event.payload === 'string'
                        ? event.payload
                        : JSON.stringify(event.payload, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
