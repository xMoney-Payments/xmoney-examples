import { type ReactNode } from 'react'
import { Lock, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { TestCards } from '@/components/test-cards'
import { EventLogButton } from '@/components/event-log'
import {
  CollapsibleCodePanel,
  type CodeTab,
} from '@/components/collapsible-code-panel'
import type { SdkLogEvent } from '@/lib/sdk-events'

export type { CodeTab }

interface ThreeColumnLayoutProps {
  title: string
  icon: ReactNode
  sidebarContent: ReactNode
  children: ReactNode
  codeTabs: CodeTab[]
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
  themeMode?: 'light' | 'dark'
  events?: SdkLogEvent[]
  onClearEvents?: () => void
}

export function ThreeColumnLayout({
  title,
  icon,
  sidebarContent,
  children,
  codeTabs,
  loading = false,
  error = null,
  onRefresh,
  themeMode = 'light',
  events,
  onClearEvents,
}: ThreeColumnLayoutProps) {
  return (
    <TooltipProvider>
      <div className='flex h-[calc(100vh-56px)] flex-col overflow-hidden bg-gray-50 font-sans text-slate-900 md:flex-row'>
        <div className='z-10 flex max-h-[45vh] w-full shrink-0 flex-col border-gray-200 bg-white shadow-sm md:max-h-none md:h-full md:w-[340px] md:border-r'>
          {sidebarContent}
        </div>

        <div className='relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50'>
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
                  title='Refresh Preview'
                >
                  <RotateCw
                    className={cn('h-4 w-4', loading ? 'animate-spin' : '')}
                  />
                </button>
              )}
            </div>
          </div>

          <div className='min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]'>
            <div className='flex min-h-full items-center justify-center p-0 md:p-8'>
              <div className='flex h-full min-h-[500px] w-full flex-col overflow-hidden border-none bg-white transition-all duration-500 ease-in-out md:h-auto md:min-h-0 md:max-w-[480px] md:rounded-xl md:border md:border-gray-200/60 md:shadow-2xl'>
                <div className='hidden shrink-0 items-center gap-4 border-b border-gray-200 bg-gray-100/80 p-3 backdrop-blur-sm md:flex'>
                  <div className='flex items-center gap-1.5'>
                    <div className='h-2.5 w-2.5 rounded-full border border-red-500/30 bg-red-400' />
                    <div className='h-3 w-3 rounded-full border border-yellow-500/30 bg-yellow-400' />
                    <div className='h-3 w-3 rounded-full border border-green-500/30 bg-green-400' />
                  </div>
                  <div className='flex flex-1 justify-center'>
                    <div className='flex w-[200px] items-center justify-center gap-1.5 rounded-md border border-gray-200/50 bg-white/80 px-3 py-1 text-[10px] font-medium text-gray-400 shadow-sm'>
                      <Lock className='h-2.5 w-2.5' />
                      secure.payment.com
                    </div>
                  </div>
                  <div className='w-10' />
                </div>

                <div
                  className={cn(
                    'relative flex min-h-[400px] flex-1 flex-col bg-white p-0',
                    themeMode === 'dark' ? 'bg-[#1a1a1a]' : ''
                  )}
                >
                  {loading && (
                    <div className='absolute inset-0 z-20 flex flex-col items-start justify-center space-y-4 bg-white/80 p-4 backdrop-blur-sm md:p-6'>
                      <div className='w-full space-y-2'>
                        <Skeleton className='h-4 w-[120px]' />
                        <Skeleton className='h-10 w-full' />
                      </div>
                      <div className='w-full space-y-2'>
                        <Skeleton className='h-4 w-[100px]' />
                        <Skeleton className='h-10 w-full' />
                      </div>
                      <div className='flex w-full gap-4'>
                        <div className='flex-1 space-y-2'>
                          <Skeleton className='h-4 w-[80px]' />
                          <Skeleton className='h-10 w-full' />
                        </div>
                        <div className='flex-1 space-y-2'>
                          <Skeleton className='h-4 w-[40px]' />
                          <Skeleton className='h-10 w-full' />
                        </div>
                      </div>
                      <div className='w-full pt-4'>
                        <Skeleton className='h-12 w-full rounded-lg' />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className='absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-50/90 p-4 text-center text-red-600 backdrop-blur-sm md:p-6'>
                      <p className='mb-2 font-bold'>Configuration Error</p>
                      <p className='text-sm'>{error}</p>
                    </div>
                  )}

                  <div
                    className={cn(
                      'w-full flex-1 transition-opacity duration-300',
                      loading || error ? 'opacity-0' : 'opacity-100'
                    )}
                  >
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CollapsibleCodePanel codeTabs={codeTabs} />
        </div>
      </div>
    </TooltipProvider>
  )
}
