import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PreviewShell({
  children,
  className,
  maxWidth = '4xl',
}: {
  children: ReactNode
  className?: string
  maxWidth?: '4xl' | '6xl'
}) {
  return (
    <div
      className={cn(
        'min-h-full bg-gradient-to-br from-primary/5 via-white to-slate-50 p-4 sm:p-6 md:p-8',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto',
          maxWidth === '4xl' && 'max-w-4xl',
          maxWidth === '6xl' && 'max-w-6xl'
        )}
      >
        {children}
      </div>
    </div>
  )
}
