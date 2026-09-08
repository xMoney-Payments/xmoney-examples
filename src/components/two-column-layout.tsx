import { type ReactNode } from 'react'
import { RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TestCards } from '@/components/test-cards'
import { EventLogButton } from '@/components/event-log'
import {
  CollapsibleCodePanel,
  type CodeTab,
} from '@/components/collapsible-code-panel'
import type { SdkLogEvent } from '@/lib/sdk-events'

export type { CodeTab }

interface TwoColumnLayoutProps {
  title: string
  icon: ReactNode
  children: ReactNode
  codeTabs: CodeTab[]
  onRefresh?: () => void
  loading?: boolean
  events?: SdkLogEvent[]
  onClearEvents?: () => void
}

export function TwoColumnLayout({
  title,
  icon,
  children,
  codeTabs,
  onRefresh,
  loading = false,
  events,
  onClearEvents,
}: TwoColumnLayoutProps) {
  return (
    <div className='relative flex h-[calc(100vh-56px)] flex-col overflow-hidden bg-gray-50 font-sans text-slate-900'>
      <div className='z-20 flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600'>
            {icon}
          </div>
          <h1 className='text-sm font-semibold text-slate-900'>{title}</h1>
        </div>
        <div className='flex items-center gap-2'>
          {events && onClearEvents && (
            <EventLogButton events={events} onClear={onClearEvents} />
          )}
          <TestCards />
          {onRefresh && (
            <button
              type='button'
              onClick={onRefresh}
              className='rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900'
              title='Refresh'
            >
              <RotateCw
                className={cn('h-4 w-4', loading ? 'animate-spin' : '')}
              />
            </button>
          )}
        </div>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto'>{children}</div>

      <CollapsibleCodePanel codeTabs={codeTabs} />
    </div>
  )
}
