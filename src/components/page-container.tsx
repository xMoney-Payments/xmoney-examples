import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageContainer({
  children,
  className,
  maxWidth = '6xl',
}: {
  children: ReactNode
  className?: string
  maxWidth?: '6xl' | '7xl' | '4xl'
}) {
  return (
    <div
      className={cn(
        'mx-auto p-4 sm:p-6 lg:p-8',
        maxWidth === '6xl' && 'max-w-6xl',
        maxWidth === '7xl' && 'max-w-7xl',
        maxWidth === '4xl' && 'max-w-4xl',
        className
      )}
    >
      {children}
    </div>
  )
}
